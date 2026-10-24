/**
 * TIER 4: REAL-WORLD APPLICATION SCENARIOS TEST SUITE
 * 
 * Verifies complete realistic end-to-end user journeys and project directives:
 * - Scenario 1: Complete student interactive learning journey (Hero -> 3D Tour -> Touch Panning -> Route -> 10 Hotspots 100% -> STEAM Lab -> Back to Top)
 * - Scenario 2: Historical researcher curated discovery & category filtering
 * - Scenario 3: User Directives & Copyright Compliance Audit ("BỎ SLIDE 0" validation, footer pill metadata, 100% SVG iconography, zero emojis)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {
  suite,
  test,
  assert,
  assertEqual,
  assertNotEqual,
  assertGreaterThan
} = require('./helpers/test_runner.cjs');
const { createEnvironment, DOMCustomEvent } = require('./helpers/dom_harness.cjs');

const PROJECT_ROOT = path.resolve(__dirname, '..');

suite('Tier 4: Real-World Scenarios — Full Student Learning Journey', () => {
  let env;

  test('Student completes full interactive learning path from header to STEAM lab and back to top', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    // 1. Initial State: Arrives at website header
    const brand = env.document.querySelector('.brand');
    assert(brand, 'Brand element must exist');
    assertEqual(env.window.scrollY, 0, 'Initial scroll position must be at top (0)');

    // 2. Select Tour 2 (Đồi A1 - index 1)
    const tourCards = env.document.querySelectorAll('.tour-rail .tour-card');
    assertGreaterThan(tourCards.length, 1, 'Tour cards must be populated');
    tourCards[1].click();

    // Verify telemetry / guide panel updated to Đồi A1
    const guideTitle = env.document.querySelector('.tour-guide h3');
    assert(guideTitle && guideTitle.textContent.includes('A1'), 'Tour guide must reflect Đồi A1');

    // 3. Launch 360 viewer modal
    const playTourBtn = env.document.querySelector('.play-tour');
    playTourBtn.click();
    const panoModal = env.document.getElementById('modal-panorama-360');
    assert(panoModal && panoModal.classList.contains('modal-open'), '360 viewer modal must open');

    // 4. Student interacts with touch panning on mobile/tablet
    const viewport = panoModal.querySelector('#pano-viewport');
    const panoImg = panoModal.querySelector('#pano-image');
    assert(viewport && panoImg, 'Panorama viewport and image must exist');

    viewport.dispatchEvent(new env.window.TouchEvent('touchstart', {
      touches: [{ clientX: 200, clientY: 200 }]
    }));
    env.window.dispatchEvent(new env.window.TouchEvent('touchmove', {
      touches: [{ clientX: 120, clientY: 200 }]
    }));
    viewport.dispatchEvent(new env.window.TouchEvent('touchend'));

    // Verify transformation applied to image
    assert(panoImg.style.transform && panoImg.style.transform.includes('translateX'), 'Touch move must translate panorama image');

    // Zoom controls
    const zoomInBtn = panoModal.querySelector('#pano-zoom-in');
    zoomInBtn.click();
    assert(panoImg.style.transform.includes('scale'), 'Zoom in button must apply scale');

    // 5. Close modal using ESC key
    env.window.dispatchEvent(new env.window.KeyboardEvent('keydown', { key: 'Escape' }));
    assert(!panoModal.classList.contains('modal-open'), 'Modal must close on ESC');

    // 6. Navigate to Campaign Route section and open Dossier Modal
    const routeBtns = env.document.querySelectorAll('.route-chapters button');
    assertGreaterThan(routeBtns.length, 0, 'Route buttons must exist');
    routeBtns[0].click(); // Mường Phăng dossier

    const dossierModal = env.document.getElementById('modal-muong-phang');
    assert(dossierModal && dossierModal.classList.contains('modal-open'), 'Dossier modal must open');
    dossierModal.querySelector('.modal-close').click();
    assert(!dossierModal.classList.contains('modal-open'), 'Dossier modal must close on close button click');

    // 7. Tactical Map: Sequentially explore all 10 hotspots (H01 through H10)
    let successSoundPlayed = false;
    const origPlaySuccess = env.window.SiteAudio.playSuccess;
    env.window.SiteAudio.playSuccess = () => {
      successSoundPlayed = true;
      return origPlaySuccess.call(env.window.SiteAudio);
    };

    const mapPins = env.document.querySelectorAll('.strategy-map .map-pin');
    assertEqual(mapPins.length, 10, 'Must have 10 tactical pins');

    for (let i = 0; i < 10; i++) {
      mapPins[i].click();
    }

    // 100% completion reward sound triggered
    assert(successSoundPlayed, 'Exploring all 10 hotspots must trigger SiteAudio.playSuccess() reward');

    // 8. STEAM Heritage Lab: Explore station S and test artillery simulation
    const labCards = env.document.querySelectorAll('.lab-grid .lab-card');
    labCards[0].click(); // Science
    const steamModal = env.document.getElementById('modal-steam-lab');
    assert(steamModal && steamModal.classList.contains('modal-open'), 'STEAM modal must open');

    const slider = steamModal.querySelector('#sim-height-slider');
    slider.value = '60';
    slider.dispatchEvent(new DOMCustomEvent('input'));
    assertEqual(steamModal.querySelector('#sim-height-val').textContent, '60 mét');

    // Close STEAM modal via backdrop click
    steamModal.querySelector('.modal-backdrop').click();
    assert(!steamModal.classList.contains('modal-open'), 'STEAM modal must close on backdrop click');

    // 9. Back-to-Top Button
    env.window.scrollTo(0, 800);
    const backToTopBtn = env.document.getElementById('backToTopBtn');
    assert(backToTopBtn.classList.contains('visible'), 'Back-to-top button must be visible');
    backToTopBtn.click();
    assertEqual(env.window.scrollY, 0, 'Clicking back-to-top must return scroll position to top');
  });
});

suite('Tier 4: Real-World Scenarios — Historical Researcher Discovery & Tour Filtering', () => {
  let env;

  test('Filter tabs filter 3D tour rail cards accurately by category', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const filterBtns = env.document.querySelectorAll('.tour-filter button');
    assertEqual(filterBtns.length, 5, 'Must have 5 filter buttons (Tất cả, Chỉ huy, Chiến trường, Di tích, Tưởng niệm)');

    const tourCards = env.document.querySelectorAll('.tour-rail .tour-card');
    assertEqual(tourCards.length, 8, 'Must have 8 tour cards');

    // Click "Chiến trường" filter
    const battleBtn = Array.from(filterBtns).find(b => b.textContent.includes('Chiến trường'));
    assert(battleBtn, 'Battle filter button must exist');
    battleBtn.click();
    assert(battleBtn.classList.contains('active'), 'Battle button must be active');

    // Verify non-battle tours are hidden
    env.window.TOURS_DATA.forEach((tour, idx) => {
      const card = tourCards[idx];
      if (tour.catKey === 'battle') {
        assertNotEqual(card.style.display, 'none', `Battle tour ${tour.title} must be displayed`);
      } else {
        assertEqual(card.style.display, 'none', `Non-battle tour ${tour.title} must be hidden`);
      }
    });

    // Reset to "Tất cả" (Button 0)
    filterBtns[0].click();
    tourCards.forEach((card, idx) => {
      assertNotEqual(card.style.display, 'none', `Tour ${idx} must be displayed after reset to all`);
    });
  });
});

suite('Tier 4: Real-World Scenarios — User Directives & Copyright Compliance Audit', () => {
  test('User Directive "BỎ SLIDE 0": 0 occurrences of #slide0-overlay and zero scroll lock', () => {
    const htmlContent = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
    assert(!htmlContent.includes('id="slide0-overlay"'), 'index.html must NOT contain #slide0-overlay');
    assert(!htmlContent.includes('class="lock-scroll"'), 'index.html must NOT contain lock-scroll class');

    const env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const slide0 = env.document.getElementById('slide0-overlay');
    assertEqual(slide0, null, 'DOM must not contain #slide0-overlay element');
    assert(!env.document.body.classList.contains('lock-scroll'), 'body must not have lock-scroll class');
  });

  test('Footer Copyright Pill exists and contains required author attribution metadata', () => {
    const env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const pill = env.document.querySelector('.footer-copyright-pill');
    assert(pill, '.footer-copyright-pill must exist in document');

    const pillText = pill.textContent;
    assert(pillText.includes('DESIGN BY VUONGGIA'), 'Footer pill must include "DESIGN BY VUONGGIA"');
    assert(pillText.includes('Bản quyền'), 'Footer pill must state copyright notice');
    assert(pillText.includes('2026'), 'Footer pill must contain copyright year 2026');
  });

  test('Strict Accessibility: 100% SVG iconography with zero raw emojis', () => {
    const htmlContent = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
    const jsData = fs.readFileSync(path.join(PROJECT_ROOT, 'assets', 'site_data.js'), 'utf8');
    const jsEngine = fs.readFileSync(path.join(PROJECT_ROOT, 'assets', 'interactive_engine.js'), 'utf8');

    // Emoji regex checking common emoji unicode blocks
    const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    assert(!emojiRegex.test(htmlContent), 'index.html must not use raw emoji characters for icons');
    assert(!emojiRegex.test(jsData), 'assets/site_data.js must not use raw emoji characters');
    assert(!emojiRegex.test(jsEngine), 'assets/interactive_engine.js must not use raw emoji characters');
  });
});
