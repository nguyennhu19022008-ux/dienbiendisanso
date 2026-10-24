/**
 * TIER 1: FEATURE COVERAGE TEST SUITE
 * 
 * Verifies foundational technical integrity:
 * - JavaScript syntax verification across all scripts (assets/site_data.js, assets/site_audio.js, assets/interactive_engine.js)
 * - Physical presence and validity of image/SVG/CSS assets
 * - Document anchor link consistency
 * - Complete data contracts for TOURS_DATA and HOTSPOTS_DATA
 * - DOM structural contracts for Campaign Route, 56 Days Timeline, and STEAM Lab cards
 * - Web Audio API synthesizer contract
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  suite,
  test,
  assert,
  assertEqual,
  assertDeepEqual,
  assertIncludes,
  assertGreaterThan
} = require('./helpers/test_runner.cjs');
const { createEnvironment } = require('./helpers/dom_harness.cjs');

const PROJECT_ROOT = path.resolve(__dirname, '..');

suite('Tier 1: Feature Coverage — Syntax & Code Integrity', () => {
  test('assets/site_data.js passes node -c syntax check without errors', () => {
    const file = path.join(PROJECT_ROOT, 'assets', 'site_data.js');
    assert(fs.existsSync(file), 'site_data.js must exist');
    execSync(`node -c "${file}"`, { stdio: 'pipe' });
  });

  test('assets/site_audio.js passes node -c syntax check without errors', () => {
    const file = path.join(PROJECT_ROOT, 'assets', 'site_audio.js');
    assert(fs.existsSync(file), 'site_audio.js must exist');
    execSync(`node -c "${file}"`, { stdio: 'pipe' });
  });

  test('assets/interactive_engine.js passes node -c syntax check without errors', () => {
    const file = path.join(PROJECT_ROOT, 'assets', 'interactive_engine.js');
    assert(fs.existsSync(file), 'interactive_engine.js must exist');
    execSync(`node -c "${file}"`, { stdio: 'pipe' });
  });
});

suite('Tier 1: Feature Coverage — Physical Assets & Resources', () => {
  const REQUIRED_IMAGES = [
    'd1.webp',
    'him-lam-aerial.webp',
    'muong-phang.webp',
    'a1.webp',
    'a1-cemetery.webp',
    'him-lam-memorial.webp'
  ];

  test('All 6 historical archive WebP images exist and have valid RIFF/WEBP headers', () => {
    REQUIRED_IMAGES.forEach(imgName => {
      const imgPath = path.join(PROJECT_ROOT, 'images', imgName);
      assert(fs.existsSync(imgPath), `Image ${imgName} must exist on disk`);
      const stat = fs.statSync(imgPath);
      assertGreaterThan(stat.size, 1000, `Image ${imgName} must be larger than 1KB`);

      const fd = fs.openSync(imgPath, 'r');
      const buf = Buffer.alloc(12);
      fs.readSync(fd, buf, 0, 12, 0);
      fs.closeSync(fd);

      const riff = buf.toString('ascii', 0, 4);
      const webp = buf.toString('ascii', 8, 12);
      assertEqual(riff, 'RIFF', `Image ${imgName} must have RIFF container header`);
      assertEqual(webp, 'WEBP', `Image ${imgName} must have WEBP format tag`);
    });
  });

  test('Root SVG icons and Favicon exist and contain valid XML markup', () => {
    const REQUIRED_SVGS = ['favicon.svg'];
    REQUIRED_SVGS.forEach(svgName => {
      const svgPath = path.join(PROJECT_ROOT, svgName);
      assert(fs.existsSync(svgPath), `${svgName} must exist at root`);
      const content = fs.readFileSync(svgPath, 'utf8');
      assertIncludes(content, '<svg', `${svgName} must contain <svg tag`);
      assertIncludes(content, '</svg>', `${svgName} must contain </svg> closing tag`);
    });
  });

  test('Both base and interactive stylesheets exist and are non-empty', () => {
    const STYLESHEETS = [
      path.join(PROJECT_ROOT, 'assets', 'site_styles.css'),
      path.join(PROJECT_ROOT, 'assets', 'interactive_enhancements.css')
    ];
    STYLESHEETS.forEach(sheetPath => {
      assert(fs.existsSync(sheetPath), `Stylesheet ${path.basename(sheetPath)} must exist`);
      const stat = fs.statSync(sheetPath);
      assertGreaterThan(stat.size, 5000, `Stylesheet ${path.basename(sheetPath)} must have content (>5KB)`);
    });
  });

  test('All image references in index.html resolve to existing disk files', () => {
    const htmlContent = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
    let match;
    const foundImages = [];
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      foundImages.push(match[1]);
    }
    assertGreaterThan(foundImages.length, 0, 'index.html must have image tags');

    foundImages.forEach(src => {
      if (!src.startsWith('http')) {
        const resolved = path.join(PROJECT_ROOT, src);
        assert(fs.existsSync(resolved), `Referenced image ${src} in index.html must exist on disk`);
      }
    });
  });
});

suite('Tier 1: Feature Coverage — Document Anchors & Navigation', () => {
  test('All primary in-page navigation anchors target existing section IDs in index.html', () => {
    const htmlContent = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
    const hrefRegex = /href=["']#([a-zA-Z0-9_-]+)["']/g;
    let match;
    const anchors = new Set();
    while ((match = hrefRegex.exec(htmlContent)) !== null) {
      anchors.add(match[1]);
    }

    const expectedAnchors = ['top', 'viewer', 'route', 'map', 'steam'];
    expectedAnchors.forEach(id => {
      assert(anchors.has(id), `index.html must contain anchor link to #${id}`);
      const idRegex = new RegExp(`id=["']${id}["']`);
      assert(idRegex.test(htmlContent), `index.html must contain target element with id="${id}"`);
    });
  });
});

suite('Tier 1: Feature Coverage — Data Contracts & Schemas', () => {
  let env;
  let loaded;

  test('site_data.js exports TOURS_DATA and HOTSPOTS_DATA onto window', () => {
    env = createEnvironment(PROJECT_ROOT);
    loaded = env.loadScripts();
    assert(Array.isArray(loaded.TOURS_DATA), 'window.TOURS_DATA must be an array');
    assert(Array.isArray(loaded.HOTSPOTS_DATA), 'window.HOTSPOTS_DATA must be an array');
  });

  test('TOURS_DATA contains exactly 8 tours with valid schema and existing images', () => {
    assertEqual(loaded.TOURS_DATA.length, 8, 'Must have exactly 8 3D tours');
    loaded.TOURS_DATA.forEach((tour, idx) => {
      assertEqual(tour.id, idx + 1, `Tour ${idx} id must match sequential 1-based index`);
      assert(tour.title, `Tour ${idx} must have title`);
      assert(tour.category, `Tour ${idx} must have category`);
      assert(tour.catKey, `Tour ${idx} must have catKey`);
      assert(tour.badge, `Tour ${idx} must have badge`);
      assert(tour.desc, `Tour ${idx} must have description`);
      assert(tour.coords, `Tour ${idx} must have coordinates`);
      assert(Array.isArray(tour.viewpoints), `Tour ${idx} must have viewpoints array`);
      assertGreaterThan(tour.viewpoints.length, 0, `Tour ${idx} viewpoints must not be empty`);
      assert(tour.externalUrl, `Tour ${idx} must have externalUrl`);
      assert(tour.image, `Tour ${idx} must have image path`);

      const imgPath = path.join(PROJECT_ROOT, tour.image);
      assert(fs.existsSync(imgPath), `Tour ${tour.id} image ${tour.image} must exist`);
    });
  });

  test('HOTSPOTS_DATA contains exactly 10 tactical points with normalized coordinates', () => {
    assertEqual(loaded.HOTSPOTS_DATA.length, 10, 'Must have exactly 10 tactical hotspots');
    loaded.HOTSPOTS_DATA.forEach((hp, idx) => {
      assertEqual(hp.id, `H${String(idx + 1).padStart(2, '0')}`, `Hotspot ${idx} id format must be H01..H10`);
      assert(hp.name, `Hotspot ${idx} must have name`);
      assert(hp.layer, `Hotspot ${idx} must have layer`);
      assert(hp.layerKey, `Hotspot ${idx} must have layerKey`);
      assert(hp.time, `Hotspot ${idx} must have time`);
      assert(hp.left, `Hotspot ${idx} must have left percentage`);
      assert(hp.top, `Hotspot ${idx} must have top percentage`);
      assert(hp.desc, `Hotspot ${idx} must have description`);
      assert(hp.steamQuestion, `Hotspot ${idx} must have steamQuestion`);

      const leftNum = parseFloat(hp.left);
      const topNum = parseFloat(hp.top);
      assert(leftNum >= 0 && leftNum <= 100, `Hotspot ${idx} left ${hp.left} must be in [0, 100]%`);
      assert(topNum >= 0 && topNum <= 100, `Hotspot ${idx} top ${hp.top} must be in [0, 100]%`);

      const imgPath = path.join(PROJECT_ROOT, hp.image);
      assert(fs.existsSync(imgPath), `Hotspot ${hp.id} image ${hp.image} must exist`);
    });
  });

  test('DOM contains 4 Route chapters, 4 Timeline phases, and 4 STEAM lab cards', () => {
    const routeChapters = env.document.querySelectorAll('.route-chapters article');
    assertEqual(routeChapters.length, 4, 'Must have exactly 4 Route Chapters');

    const phaseCards = env.document.querySelectorAll('.phase-grid .phase-card');
    assertEqual(phaseCards.length, 4, 'Must have exactly 4 Timeline Phase cards');

    const labCards = env.document.querySelectorAll('.lab-grid .lab-card');
    assertEqual(labCards.length, 4, 'Must have exactly 4 STEAM Lab station cards');
  });
});

suite('Tier 1: Feature Coverage — Web Audio API Synthesizer Contract', () => {
  let env;

  test('SiteAudio exports all required methods and properties without sound file dependencies', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();
    const audio = env.window.SiteAudio;
    assert(audio, 'SiteAudio must be defined on window');
    assertEqual(typeof audio.playClick, 'function', 'SiteAudio.playClick must be a function');
    assertEqual(typeof audio.playRadar, 'function', 'SiteAudio.playRadar must be a function');
    assertEqual(typeof audio.playWhoosh, 'function', 'SiteAudio.playWhoosh must be a function');
    assertEqual(typeof audio.playSuccess, 'function', 'SiteAudio.playSuccess must be a function');
    assertEqual(typeof audio.toggleMute, 'function', 'SiteAudio.toggleMute must be a function');
    assertEqual(typeof audio.isMuted, 'boolean', 'SiteAudio.isMuted must be boolean');
  });

  test('SiteAudio synth nodes are correctly constructed via Web Audio API oscillators', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();
    const audio = env.window.SiteAudio;

    // Trigger each sound effect and ensure no errors are thrown
    audio.playClick();
    audio.playRadar();
    audio.playWhoosh();
    audio.playSuccess();
  });
});

suite('Tier 1: Feature Coverage — Production Build & dist/ Integrity', () => {
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
  const REQUIRED_SVGS = ['favicon.svg', 'file.svg', 'globe.svg', 'window.svg'];

  test('npm run build exits with code 0 and populates dist/ directory', () => {
    execSync('npm run build', { cwd: PROJECT_ROOT, stdio: 'pipe' });
    assert(fs.existsSync(DIST_DIR), 'dist/ directory must exist after build');
    assert(fs.existsSync(path.join(DIST_DIR, 'index.html')), 'dist/index.html must exist');
  });

  test('dist/assets/ contains all 5 scripts and stylesheets', () => {
    REQUIRED_ASSETS.forEach(asset => {
      const p = path.join(DIST_DIR, 'assets', asset);
      assert(fs.existsSync(p), `dist/assets/${asset} must exist`);
      assertGreaterThan(fs.statSync(p).size, 0, `dist/assets/${asset} must not be empty`);
    });
  });

  test('dist/images/ contains all 6 WebP images with RIFF/WEBP magic bytes', () => {
    REQUIRED_IMAGES.forEach(img => {
      const p = path.join(DIST_DIR, 'images', img);
      assert(fs.existsSync(p), `dist/images/${img} must exist`);
      assertGreaterThan(fs.statSync(p).size, 1000, `dist/images/${img} must be > 1KB`);

      const fd = fs.openSync(p, 'r');
      const buf = Buffer.alloc(12);
      fs.readSync(fd, buf, 0, 12, 0);
      fs.closeSync(fd);

      assertEqual(buf.toString('ascii', 0, 4), 'RIFF', `${img} must have RIFF header`);
      assertEqual(buf.toString('ascii', 8, 12), 'WEBP', `${img} must have WEBP format`);
    });
  });

  test('dist/ contains all 4 root SVGs with valid XML markup', () => {
    REQUIRED_SVGS.forEach(svg => {
      const p = path.join(DIST_DIR, svg);
      assert(fs.existsSync(p), `dist/${svg} must exist`);
      const content = fs.readFileSync(p, 'utf8');
      assertIncludes(content, '<svg', `dist/${svg} must contain <svg>`);
      assertIncludes(content, '</svg>', `dist/${svg} must contain </svg>`);
    });
  });

  test('index.html references ?v=20260424 on all 5 assets in assets/', () => {
    const html = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
    REQUIRED_ASSETS.forEach(asset => {
      assertIncludes(html, `assets/${asset}?v=20260424`, `index.html must reference assets/${asset}?v=20260424`);
    });
  });

  test('index.html iframe allow attribute replaces vr with xr-spatial-tracking; fullscreen', () => {
    const html = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
    assert(!/\ballow\s*=\s*["'][^"']*\bvr\b[^"']*["']/i.test(html), 'Must not contain deprecated vr in any allow attribute');
    assertIncludes(html, 'xr-spatial-tracking; fullscreen', 'Must contain xr-spatial-tracking; fullscreen');
  });

  test('vercel.json specifies buildCommand, outputDirectory, and safe assets Cache-Control', () => {
    const vercelConfig = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'vercel.json'), 'utf8'));
    assertEqual(vercelConfig.buildCommand, 'npm run build', 'vercel.json buildCommand must be npm run build');
    assertEqual(vercelConfig.outputDirectory, 'dist', 'vercel.json outputDirectory must be dist');

    const assetHeader = vercelConfig.headers.find(h => h.source === '/assets/(.*)');
    assert(assetHeader, 'vercel.json must have headers for /assets/(.*)');
    const cacheControl = assetHeader.headers.find(h => h.key === 'Cache-Control');
    assert(cacheControl, 'Must specify Cache-Control header for /assets/(.*)');
    assert(!cacheControl.value.includes('immutable'), 'Cache-Control for assets must NOT be immutable');
    assertIncludes(cacheControl.value, 'public, max-age=0, must-revalidate', 'Cache-Control must be safe revalidation');
  });

  test('dist/assets/ contains strictly the 5 required assets without orphaned files', () => {
    const files = fs.readdirSync(path.join(DIST_DIR, 'assets'));
    assertEqual(files.length, REQUIRED_ASSETS.length, 'dist/assets/ must contain exactly 5 assets');
    REQUIRED_ASSETS.forEach(asset => {
      assert(files.includes(asset), `dist/assets/ must include ${asset}`);
    });
  });

  test('scripts/build_dist.cjs verifyDist() validates production build and passes all checks', () => {
    const { verifyDist } = require('../scripts/build_dist.cjs');
    const res = verifyDist(DIST_DIR, { projectRoot: PROJECT_ROOT, silent: true });
    assertEqual(res.success, true, 'verifyDist must succeed');
    assertEqual(res.totalChecked, 27, 'verifyDist must pass all 27 verification checks');
  });

  test('production dist/ artifacts load and initialize cleanly in DOM harness', () => {
    const distEnv = createEnvironment(DIST_DIR);
    const scripts = distEnv.loadScripts();
    assert(scripts.SiteAudio, 'dist/assets/site_audio.js must export SiteAudio');
    assert(distEnv.window.TOURS_DATA, 'dist/assets/site_data.js must export TOURS_DATA');
    assertEqual(distEnv.window.TOURS_DATA.length, 8, 'TOURS_DATA must contain 8 tours');
  });

  test('vite.config.js fallback plugin closeBundle hook populates and verifies dist/', async () => {
    const viteConfig = await import('../vite.config.js');
    const plugin = viteConfig.default.plugins.find(p => p.name === 'copy-static-dist-assets');
    assert(plugin, 'vite.config.js must include copy-static-dist-assets plugin');
    assertEqual(typeof plugin.closeBundle, 'function', 'plugin must implement closeBundle hook');

    // Execute the hook directly
    plugin.closeBundle();

    const { verifyDist } = require('../scripts/build_dist.cjs');
    const res = verifyDist(DIST_DIR, { projectRoot: PROJECT_ROOT, silent: true });
    assertEqual(res.success, true, 'verifyDist must succeed after vite closeBundle');
  });

  test('real vite build CLI execution populates verified dist/ without orphaned assets', () => {
    execSync('npx vite build', { cwd: PROJECT_ROOT, stdio: 'pipe' });
    const { verifyDist } = require('../scripts/build_dist.cjs');
    const res = verifyDist(DIST_DIR, { projectRoot: PROJECT_ROOT, silent: true });
    assertEqual(res.success, true, 'verifyDist must succeed after npx vite build');

    const files = fs.readdirSync(path.join(DIST_DIR, 'assets'));
    assertEqual(files.length, REQUIRED_ASSETS.length, 'dist/assets/ must contain exactly 5 assets after vite build');
    REQUIRED_ASSETS.forEach(asset => {
      assert(files.includes(asset), `dist/assets/ must include ${asset}`);
    });
  });

  test('build handles Windows CWD inside dist/ without EPERM errors', () => {
    const { build, verifyDist } = require('../scripts/build_dist.cjs');
    const initialCwd = process.cwd();
    try {
      process.chdir(DIST_DIR);
      build({ projectRoot: PROJECT_ROOT, distDir: DIST_DIR, silent: true });
    } finally {
      process.chdir(initialCwd);
    }
    const res = verifyDist(DIST_DIR, { projectRoot: PROJECT_ROOT, silent: true });
    assertEqual(res.success, true, 'dist must be valid after building with CWD in dist');
  });

  test('extraneous files in source assets/ do not leak into dist/assets/', () => {
    const { build, verifyDist } = require('../scripts/build_dist.cjs');
    const dummyFile = path.join(PROJECT_ROOT, 'assets', '__test_dummy__.bak');
    try {
      fs.writeFileSync(dummyFile, 'transient backup file');
      build({ projectRoot: PROJECT_ROOT, distDir: DIST_DIR, silent: true });
      const distFiles = fs.readdirSync(path.join(DIST_DIR, 'assets'));
      assert(!distFiles.includes('__test_dummy__.bak'), 'Transient backup file must not be copied to dist/assets');
      assertEqual(distFiles.length, REQUIRED_ASSETS.length, 'dist/assets/ count must strictly equal 5');
    } finally {
      if (fs.existsSync(dummyFile)) fs.unlinkSync(dummyFile);
    }
    const res = verifyDist(DIST_DIR, { projectRoot: PROJECT_ROOT, silent: true });
    assertEqual(res.success, true, 'dist must remain valid');
  });

  test('verifyDist rejects unversioned asset references in index.html', () => {
    const { verifyDist } = require('../scripts/build_dist.cjs');
    const indexPath = path.join(DIST_DIR, 'index.html');
    const originalHtml = fs.readFileSync(indexPath, 'utf8');
    try {
      fs.writeFileSync(indexPath, originalHtml + '\n<script src="assets/site_data.js"></script>');
      let caught = false;
      try {
        verifyDist(DIST_DIR, { projectRoot: PROJECT_ROOT, silent: true });
      } catch (err) {
        caught = true;
        assertIncludes(err.message, 'unversioned asset reference', 'Error must cite unversioned asset reference');
      }
      assert(caught, 'verifyDist must throw when index.html contains unversioned asset reference');
    } finally {
      fs.writeFileSync(indexPath, originalHtml);
    }
  });

  test('verifyDist rejects orphaned files in dist/images/ and root dist/', () => {
    const { verifyDist } = require('../scripts/build_dist.cjs');
    const orphanImg = path.join(DIST_DIR, 'images', '__orphan_img__.webp');
    const orphanRoot = path.join(DIST_DIR, '__orphan_root__.txt');

    try {
      // Test orphan image rejection
      fs.writeFileSync(orphanImg, 'dummy data');
      let caughtImg = false;
      try {
        verifyDist(DIST_DIR, { projectRoot: PROJECT_ROOT, silent: true });
      } catch (err) {
        caughtImg = true;
        assertIncludes(err.message, 'Unexpected or orphaned file in dist/images', 'Must cite orphaned image');
      }
      assert(caughtImg, 'verifyDist must reject orphaned file in dist/images/');
    } finally {
      if (fs.existsSync(orphanImg)) fs.unlinkSync(orphanImg);
    }

    try {
      // Test orphan root entry rejection
      fs.writeFileSync(orphanRoot, 'dummy data');
      let caughtRoot = false;
      try {
        verifyDist(DIST_DIR, { projectRoot: PROJECT_ROOT, silent: true });
      } catch (err) {
        caughtRoot = true;
        assertIncludes(err.message, 'Unexpected or orphaned entry in root dist', 'Must cite orphaned root entry');
      }
      assert(caughtRoot, 'verifyDist must reject orphaned entry in root dist/');
    } finally {
      if (fs.existsSync(orphanRoot)) fs.unlinkSync(orphanRoot);
    }
  });

  test('build correctly resolves custom projectRoot without defaulting to PROJECT_ROOT', () => {
    const os = require('os');
    const { build } = require('../scripts/build_dist.cjs');
    const tmpProj = fs.mkdtempSync(path.join(os.tmpdir(), 'db_proj_'));

    try {
      fs.copyFileSync(path.join(PROJECT_ROOT, 'index.html'), path.join(tmpProj, 'index.html'));
      fs.cpSync(path.join(PROJECT_ROOT, 'assets'), path.join(tmpProj, 'assets'), { recursive: true });
      fs.cpSync(path.join(PROJECT_ROOT, 'images'), path.join(tmpProj, 'images'), { recursive: true });
      fs.copyFileSync(path.join(PROJECT_ROOT, 'favicon.svg'), path.join(tmpProj, 'favicon.svg'));
      fs.copyFileSync(path.join(PROJECT_ROOT, 'file.svg'), path.join(tmpProj, 'file.svg'));
      fs.copyFileSync(path.join(PROJECT_ROOT, 'globe.svg'), path.join(tmpProj, 'globe.svg'));
      fs.copyFileSync(path.join(PROJECT_ROOT, 'window.svg'), path.join(tmpProj, 'window.svg'));
      fs.copyFileSync(path.join(PROJECT_ROOT, 'vercel.json'), path.join(tmpProj, 'vercel.json'));

      const res = build({ projectRoot: tmpProj, silent: true });
      assertEqual(res.outDir, path.join(tmpProj, 'dist'), 'outDir must resolve inside custom projectRoot');
      assert(fs.existsSync(path.join(tmpProj, 'dist', 'index.html')), 'dist/index.html must exist in custom projectRoot');
      assertEqual(res.verification.totalChecked, 27, 'All 27 checks must pass in custom projectRoot');
    } finally {
      fs.rmSync(tmpProj, { recursive: true, force: true });
    }
  });

  test('concurrent builds executed in parallel processes succeed cleanly with atomic locking', () => {
    const { spawn } = require('child_process');
    const scriptPath = path.join(PROJECT_ROOT, 'scripts', 'build_dist.cjs');

    const procs = [];
    for (let i = 0; i < 6; i++) {
      procs.push(new Promise((resolve, reject) => {
        const p = spawn('node', [scriptPath, '--silent']);
        let errOut = '';
        p.stderr.on('data', d => errOut += d);
        p.on('close', code => {
          if (code === 0) resolve();
          else reject(new Error(`Worker ${i} failed with exit code ${code}: ${errOut}`));
        });
      }));
    }

    return Promise.all(procs);
  });
});


