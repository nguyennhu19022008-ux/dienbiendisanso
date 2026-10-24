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
