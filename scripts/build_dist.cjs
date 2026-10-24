/**
 * DETERMINISTIC PRODUCTION BUILD & VERIFICATION SCRIPT
 * 
 * Generates dist/ for Vercel deployment:
 * - dist/index.html
 * - dist/assets/ (all JS scripts and CSS stylesheets)
 * - dist/images/ (all historical archive WebP images)
 * - dist/ (all root SVG icons: favicon.svg, file.svg, globe.svg, window.svg)
 * 
 * Performs end-to-end asset integrity, path resolution, and header verification.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

const REQUIRED_ASSETS = [
  'site_data.js',
  'site_audio.js',
  'interactive_engine.js',
  'site_styles.css',
  'interactive_enhancements.css'
];

const REQUIRED_IMAGES = [
  'd1.webp',
  'him-lam-aerial.webp',
  'muong-phang.webp',
  'a1.webp',
  'a1-cemetery.webp',
  'him-lam-memorial.webp'
];

const REQUIRED_ROOT_SVGS = [
  'favicon.svg',
  'file.svg',
  'globe.svg',
  'window.svg'
];

function acquireBuildLock(targetDir, timeoutMs = 30000) {
  const resolvedTarget = path.resolve(targetDir);
  const lockFile = path.join(path.dirname(resolvedTarget), `.${path.basename(resolvedTarget)}.lock`);
  const startTime = Date.now();

  while (true) {
    try {
      const fd = fs.openSync(lockFile, 'wx');
      try {
        fs.writeSync(fd, `${Date.now()}`);
      } finally {
        fs.closeSync(fd);
      }

      return function releaseLock() {
        try {
          if (fs.existsSync(lockFile)) {
            fs.unlinkSync(lockFile);
          }
        } catch (e) {}
      };
    } catch (err) {
      if (err.code === 'EEXIST' || err.code === 'EBUSY' || err.code === 'EPERM') {
        // Only break lock if it is genuinely stale (> 30 seconds)
        try {
          const stat = fs.statSync(lockFile);
          if (Date.now() - stat.mtimeMs > 30000) {
            try { fs.unlinkSync(lockFile); } catch (e) {}
            continue;
          }
        } catch (e) {
          // lockFile may have just been unlinked by holder
          continue;
        }

        if (Date.now() - startTime > timeoutMs) {
          throw new Error(`Timeout (${timeoutMs}ms) waiting for build lock on: ${lockFile}`);
        }

        const sleepEnd = Date.now() + 20;
        while (Date.now() < sleepEnd) {}
      } else {
        throw err;
      }
    }
  }
}

function copyWithRetry(src, dest, retries = 5, retryDelay = 50) {
  for (let i = 0; i < retries; i++) {
    try {
      fs.copyFileSync(src, dest);
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      const waitTill = Date.now() + retryDelay;
      while (Date.now() < waitTill) {}
    }
  }
}

function readTextWithRetry(filePath, retries = 5, retryDelay = 50) {
  for (let i = 0; i < retries; i++) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.length > 0) return content;
    } catch (err) {
      if (i === retries - 1) throw err;
    }
    const waitTill = Date.now() + retryDelay;
    while (Date.now() < waitTill) {}
  }
  return fs.readFileSync(filePath, 'utf8');
}

function readMagicBytes(filePath, numBytes = 12, retries = 5, retryDelay = 50) {
  for (let i = 0; i < retries; i++) {
    try {
      const fd = fs.openSync(filePath, 'r');
      try {
        const buf = Buffer.alloc(numBytes);
        const bytesRead = fs.readSync(fd, buf, 0, numBytes, 0);
        if (bytesRead === numBytes) return buf;
      } finally {
        fs.closeSync(fd);
      }
    } catch (err) {
      if (i === retries - 1) throw err;
    }
    const waitTill = Date.now() + retryDelay;
    while (Date.now() < waitTill) {}
  }
  const fd = fs.openSync(filePath, 'r');
  try {
    const buf = Buffer.alloc(numBytes);
    fs.readSync(fd, buf, 0, numBytes, 0);
    return buf;
  } finally {
    fs.closeSync(fd);
  }
}

function safeCleanDir(targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    return;
  }
  const entries = fs.readdirSync(targetDir);
  for (const entry of entries) {
    const fullPath = path.join(targetDir, entry);
    try {
      fs.rmSync(fullPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    } catch (err) {
      const waitTill = Date.now() + 100;
      while (Date.now() < waitTill) {}
      fs.rmSync(fullPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
    }
  }
}

function cleanStaleStagingDirs(parentDir) {
  try {
    if (!fs.existsSync(parentDir)) return;
    const entries = fs.readdirSync(parentDir);
    const now = Date.now();
    for (const entry of entries) {
      if (entry.includes('.staging.')) {
        const fullPath = path.join(parentDir, entry);
        try {
          const stat = fs.statSync(fullPath);
          if (now - stat.mtimeMs > 60000) {
            fs.rmSync(fullPath, { recursive: true, force: true });
          }
        } catch (e) {}
      }
    }
  } catch (e) {}
}

function syncDirectory(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });

  const srcEntries = fs.readdirSync(srcDir, { withFileTypes: true });
  const srcNames = new Set();

  for (const entry of srcEntries) {
    srcNames.add(entry.name);
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      syncDirectory(srcPath, destPath);
    } else {
      copyWithRetry(srcPath, destPath);
    }
  }

  // Remove orphaned files in destDir that are not in srcDir (except hidden files)
  const destEntries = fs.readdirSync(destDir);
  for (const entry of destEntries) {
    if (entry.startsWith('.')) continue;
    if (!srcNames.has(entry)) {
      const orphanPath = path.join(destDir, entry);
      fs.rmSync(orphanPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    }
  }
}

function build(options = {}) {
  const root = path.resolve(options.projectRoot || PROJECT_ROOT);
  const outDir = options.distDir ? path.resolve(root, options.distDir) : path.join(root, 'dist');
  const silent = !!options.silent;

  if (!silent) {
    console.log(`\n======================================================`);
    console.log(`  BUILDING PRODUCTION OUTPUT: ${outDir}`);
    console.log(`======================================================\n`);
  }

  const parentOut = path.dirname(outDir);
  cleanStaleStagingDirs(parentOut);

  // Acquire build lock to serialize access to target outDir across concurrent processes
  const releaseLock = acquireBuildLock(outDir);

  try {
    // Staged build: build completely in an isolated directory
    const stagingDir = path.join(parentOut, `.${path.basename(outDir)}.staging.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}`);
    safeCleanDir(stagingDir);

    try {
      const stagingAssetsDir = path.join(stagingDir, 'assets');
      const stagingImagesDir = path.join(stagingDir, 'images');
      fs.mkdirSync(stagingAssetsDir, { recursive: true });
      fs.mkdirSync(stagingImagesDir, { recursive: true });

      // 1. Copy index.html
      const srcIndex = path.join(root, 'index.html');
      if (!fs.existsSync(srcIndex)) {
        throw new Error(`Source index.html not found at ${srcIndex}`);
      }
      copyWithRetry(srcIndex, path.join(stagingDir, 'index.html'));
      if (!silent) console.log(`✓ Copied index.html`);

      // 2. Copy strictly required files from assets/
      const srcAssetsDir = path.join(root, 'assets');
      if (!fs.existsSync(srcAssetsDir)) {
        throw new Error(`Source assets/ directory not found at ${srcAssetsDir}`);
      }
      let copiedAssets = 0;
      for (const asset of REQUIRED_ASSETS) {
        const srcFile = path.join(srcAssetsDir, asset);
        if (!fs.existsSync(srcFile) || !fs.statSync(srcFile).isFile()) {
          throw new Error(`Required asset missing at source: ${srcFile}`);
        }
        copyWithRetry(srcFile, path.join(stagingAssetsDir, asset));
        copiedAssets++;
      }
      if (!silent) console.log(`✓ Copied ${copiedAssets} files to dist/assets/`);

      // 3. Copy strictly required files from images/
      const srcImagesDir = path.join(root, 'images');
      if (!fs.existsSync(srcImagesDir)) {
        throw new Error(`Source images/ directory not found at ${srcImagesDir}`);
      }
      let copiedImages = 0;
      for (const img of REQUIRED_IMAGES) {
        const srcFile = path.join(srcImagesDir, img);
        if (!fs.existsSync(srcFile) || !fs.statSync(srcFile).isFile()) {
          throw new Error(`Required image missing at source: ${srcFile}`);
        }
        copyWithRetry(srcFile, path.join(stagingImagesDir, img));
        copiedImages++;
      }
      if (!silent) console.log(`✓ Copied ${copiedImages} files to dist/images/`);

      // 4. Copy root SVG files
      let copiedSvgs = 0;
      for (const svg of REQUIRED_ROOT_SVGS) {
        const srcSvg = path.join(root, svg);
        if (fs.existsSync(srcSvg) && fs.statSync(srcSvg).isFile()) {
          copyWithRetry(srcSvg, path.join(stagingDir, svg));
          copiedSvgs++;
        } else {
          throw new Error(`Required root SVG missing at source: ${srcSvg}`);
        }
      }
      if (!silent) console.log(`✓ Copied ${copiedSvgs} root SVG icons to dist/`);

      // 5. Pre-verify in staging before syncing to outDir
      verifyDist(stagingDir, { silent: true, projectRoot: root });

      // 6. Atomically sync stagingDir to outDir
      syncDirectory(stagingDir, outDir);
    } finally {
      try {
        fs.rmSync(stagingDir, { recursive: true, force: true, maxRetries: 3 });
      } catch (e) {}
    }

    // 7. Run full verification on final outDir
    const verification = verifyDist(outDir, { silent, projectRoot: root });
    if (!silent) {
      console.log(`\n🎉 Production build complete and verified (${verification.totalChecked} checks passed).\n`);
    }

    return { success: true, outDir, verification };
  } finally {
    releaseLock();
  }
}

function verifyDist(outDir, options = {}) {
  const silent = !!options.silent;
  const root = path.resolve(options.projectRoot || PROJECT_ROOT);
  const resolvedOutDir = outDir ? path.resolve(root, outDir) : path.join(root, 'dist');
  let checksPassed = 0;

  // 1. Verify index.html exists and is valid
  const distIndex = path.join(resolvedOutDir, 'index.html');
  if (!fs.existsSync(distIndex)) {
    throw new Error(`dist/index.html is missing`);
  }
  const indexHtml = readTextWithRetry(distIndex);
  if (indexHtml.length < 500) {
    throw new Error(`dist/index.html is unexpectedly small (${indexHtml.length} bytes)`);
  }
  checksPassed++;

  // 2. Verify cache-busting query strings on assets
  for (const asset of REQUIRED_ASSETS) {
    const expectedRef = `assets/${asset}?v=20260424`;
    if (!indexHtml.includes(expectedRef)) {
      throw new Error(`dist/index.html missing cache-busting version query: ${expectedRef}`);
    }
    checksPassed++;
  }

  // 3. Verify absence of any unversioned asset references in index.html
  const unversionedAssetRegex = /assets\/[a-zA-Z0-9_-]+\.(?:js|css)(?!\?v=20260424)/g;
  const unversionedMatches = indexHtml.match(unversionedAssetRegex);
  if (unversionedMatches && unversionedMatches.length > 0) {
    throw new Error(`dist/index.html contains unversioned asset reference(s): ${unversionedMatches.join(', ')}`);
  }
  checksPassed++;

  // 4. Verify iframe allow attribute (no deprecated vr, has xr-spatial-tracking; fullscreen)
  const allIframes = indexHtml.match(/<iframe[^>]*>/gi) || [];
  if (allIframes.length === 0) {
    throw new Error(`dist/index.html missing 3D viewer <iframe> element`);
  }
  for (const iframeTag of allIframes) {
    if (/\ballow\s*=\s*["'][^"']*\bvr\b[^"']*["']/i.test(iframeTag)) {
      throw new Error(`dist/index.html contains deprecated "vr" feature in iframe allow attribute: ${iframeTag}`);
    }
  }
  const liveIframe = allIframes.find(tag => /id=["']viewerLiveIframe["']/i.test(tag)) || allIframes[0];
  if (!liveIframe.includes('xr-spatial-tracking') || !liveIframe.includes('fullscreen')) {
    throw new Error(`dist/index.html missing xr-spatial-tracking; fullscreen in iframe allow attribute: ${liveIframe}`);
  }
  checksPassed++;

  // 5. Verify all required assets in dist/assets/ and no orphaned files
  const distAssetsDir = path.join(resolvedOutDir, 'assets');
  if (!fs.existsSync(distAssetsDir)) {
    throw new Error(`Missing dist/assets/ directory`);
  }
  const actualAssetFiles = fs.readdirSync(distAssetsDir);
  for (const f of actualAssetFiles) {
    if (!REQUIRED_ASSETS.includes(f)) {
      throw new Error(`Unexpected or orphaned file in dist/assets/: ${f}`);
    }
  }
  checksPassed++;

  for (const asset of REQUIRED_ASSETS) {
    const assetPath = path.join(distAssetsDir, asset);
    if (!fs.existsSync(assetPath)) {
      throw new Error(`Missing required asset in dist/assets/: ${asset}`);
    }
    const stat = fs.statSync(assetPath);
    if (stat.size <= 0) {
      throw new Error(`Asset in dist/assets/ is empty: ${asset}`);
    }
    checksPassed++;
  }

  // 6. Verify all required images in dist/images/ and no orphaned files
  const distImagesDir = path.join(resolvedOutDir, 'images');
  if (!fs.existsSync(distImagesDir)) {
    throw new Error(`Missing dist/images/ directory`);
  }
  const actualImageFiles = fs.readdirSync(distImagesDir);
  for (const f of actualImageFiles) {
    if (!REQUIRED_IMAGES.includes(f)) {
      throw new Error(`Unexpected or orphaned file in dist/images/: ${f}`);
    }
  }
  checksPassed++;

  for (const img of REQUIRED_IMAGES) {
    const imgPath = path.join(distImagesDir, img);
    if (!fs.existsSync(imgPath)) {
      throw new Error(`Missing required image in dist/images/: ${img}`);
    }
    const stat = fs.statSync(imgPath);
    if (stat.size < 1000) {
      throw new Error(`Image in dist/images/ is too small (${stat.size} bytes): ${img}`);
    }

    const buf = readMagicBytes(imgPath, 12);
    const riff = buf.toString('ascii', 0, 4);
    const webp = buf.toString('ascii', 8, 12);
    if (riff !== 'RIFF' || webp !== 'WEBP') {
      throw new Error(`Image ${img} does not have valid RIFF/WEBP headers`);
    }
    checksPassed++;
  }

  // 7. Verify all root SVGs in dist/
  for (const svg of REQUIRED_ROOT_SVGS) {
    const svgPath = path.join(resolvedOutDir, svg);
    if (!fs.existsSync(svgPath)) {
      throw new Error(`Missing required SVG in dist/: ${svg}`);
    }
    const content = readTextWithRetry(svgPath);
    if (!content.includes('<svg') || !content.includes('</svg>')) {
      throw new Error(`SVG file in dist/ does not contain valid XML markup: ${svg}`);
    }
    checksPassed++;
  }

  // 8. Verify no orphaned entries in root dist/
  const allowedRootEntries = new Set(['index.html', 'assets', 'images', ...REQUIRED_ROOT_SVGS]);
  const actualRootEntries = fs.readdirSync(resolvedOutDir);
  for (const entry of actualRootEntries) {
    if (entry.startsWith('.')) continue; // ignore hidden/staging files
    if (!allowedRootEntries.has(entry)) {
      throw new Error(`Unexpected or orphaned entry in root dist/: ${entry}`);
    }
  }
  checksPassed++;

  // 9. Verify vercel.json strictly required in projectRoot
  const vercelPath = path.join(root, 'vercel.json');
  if (!fs.existsSync(vercelPath)) {
    throw new Error(`Required configuration file vercel.json missing at: ${vercelPath}`);
  }
  const vercelConfig = JSON.parse(readTextWithRetry(vercelPath));
  if (vercelConfig.buildCommand !== 'npm run build') {
    throw new Error(`vercel.json buildCommand must be "npm run build" (got "${vercelConfig.buildCommand}")`);
  }
  if (vercelConfig.outputDirectory !== 'dist') {
    throw new Error(`vercel.json outputDirectory must be "dist" (got "${vercelConfig.outputDirectory}")`);
  }
  const assetHeader = vercelConfig.headers?.find(h => h.source === '/assets/(.*)');
  if (!assetHeader) {
    throw new Error(`vercel.json missing headers configuration for /assets/(.*)`);
  }
  const cacheControl = assetHeader.headers?.find(h => h.key?.toLowerCase() === 'cache-control');
  if (!cacheControl || cacheControl.value.includes('immutable') || !cacheControl.value.includes('public, max-age=0, must-revalidate')) {
    throw new Error(`vercel.json Cache-Control for /assets/(.*) must be "public, max-age=0, must-revalidate"`);
  }
  checksPassed++;

  return { success: true, totalChecked: checksPassed };
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    const silent = args.includes('--silent') || args.includes('-s');
    const outDirIndex = args.findIndex(a => a === '--outDir' || a === '-o');
    const outDirArg = outDirIndex !== -1 && args[outDirIndex + 1] ? path.resolve(process.cwd(), args[outDirIndex + 1]) : null;
    const rootIndex = args.findIndex(a => a === '--projectRoot' || a === '-r');
    const rootArg = rootIndex !== -1 && args[rootIndex + 1] ? path.resolve(process.cwd(), args[rootIndex + 1]) : null;
    build({ silent, ...(outDirArg ? { distDir: outDirArg } : {}), ...(rootArg ? { projectRoot: rootArg } : {}) });
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ BUILD FAILURE:`, err.message);
    process.exit(1);
  }
}

module.exports = {
  build,
  verifyDist,
  acquireBuildLock,
  safeCleanDir,
  syncDirectory,
  REQUIRED_ASSETS,
  REQUIRED_IMAGES,
  REQUIRED_ROOT_SVGS
};
