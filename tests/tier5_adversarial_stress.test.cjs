/**
 * TIER 5: ADVERSARIAL INTERACTION STATE TRANSITION STRESS SUITE
 * 
 * Empirically challenges and stress-tests:
 * 1. Interleaved ESC key events and clicks during modal opening/closing.
 * 2. Repeated tactical map mode switching while visiting hotspots in random sequences.
 * 3. Rapid cycling through STEAM lab stations (S -> T -> E -> M -> S) verifying badge and title updates.
 * 4. 360 panorama touch events concurrent with zoom button clicks and wheel events.
 * 5. Check for race conditions, stale DOM states, and visual desynchronization.
 */

'use strict';

const path = require('path');
const {
  suite,
  test,
  assert,
  assertEqual,
  assertNotEqual,
  assertGreaterThan,
  assertLessThan,
  assertDoesNotThrow
} = require('./helpers/test_runner.cjs');
const { createEnvironment, DOMCustomEvent } = require('./helpers/dom_harness.cjs');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Helper to simulate sleep / timer flush
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

suite('Tier 5 Adversarial — Interleaved ESC Key & Modal Click Transitions', () => {
  let env;

  test('High-frequency sequential open, ESC, close-btn, and backdrop clicks across all modal types', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const playTourBtn = env.document.querySelector('.play-tour');
    const routeBtns = env.document.querySelectorAll('.route-chapters button');
    const steamCards = env.document.querySelectorAll('.lab-grid .lab-card');
    const menuToggle = env.document.querySelector('.menu-toggle');

    assert(playTourBtn, 'Play tour button exists');
    assertEqual(routeBtns.length, 4, '4 route buttons exist');
    assertEqual(steamCards.length, 4, '4 steam lab cards exist');

    const pressEsc = () => {
      const ev = new env.window.KeyboardEvent('keydown', { key: 'Escape', code: 'Escape' });
      env.window.dispatchEvent(ev);
    };

    const pressLegacyEsc = () => {
      const ev = new env.window.KeyboardEvent('keydown', { key: 'Esc', code: 'Escape' });
      env.window.dispatchEvent(ev);
    };

    const getOpenModals = () => {
      return env.document.querySelectorAll('.custom-modal.modal-open, #modal-panorama-360.modal-open');
    };

    // Initial state: no modals open, body overflow is not hidden
    assertEqual(getOpenModals().length, 0, 'Initially 0 open modals');
    assertNotEqual(env.document.body.style.overflow, 'hidden', 'Initial overflow is not hidden');

    // 1. ESC when no modal or menu is open is safe and idempotent
    pressEsc();
    pressLegacyEsc();
    assertEqual(getOpenModals().length, 0);
    assertNotEqual(env.document.body.style.overflow, 'hidden');

    // 2. Open Route 0 -> immediate ESC
    routeBtns[0].click();
    assertEqual(getOpenModals().length, 1, 'Route 0 modal open');
    assertEqual(env.document.body.style.overflow, 'hidden', 'Body overflow hidden');
    pressEsc();
    assertEqual(getOpenModals().length, 0, 'ESC closed modal');
    assertEqual(env.document.body.style.overflow, '', 'Body overflow restored');

    // 3. Open Panorama 360 -> Close via Close Button
    playTourBtn.click();
    assertEqual(getOpenModals().length, 1, 'Pano modal open');
    const panoCloseBtn = env.document.querySelector('#close-pano-modal');
    assert(panoCloseBtn, '#close-pano-modal exists');
    panoCloseBtn.click();
    assertEqual(getOpenModals().length, 0, 'Close button closed pano');
    assertEqual(env.document.body.style.overflow, '', 'Body overflow restored');

    // 4. Open STEAM Lab -> Close via Backdrop click
    steamCards[0].click();
    assertEqual(getOpenModals().length, 1, 'STEAM modal open');
    const steamModal = env.document.getElementById('modal-steam-lab');
    const backdrop = steamModal.querySelector('.modal-backdrop');
    assert(backdrop, 'Backdrop exists');
    backdrop.click();
    assertEqual(getOpenModals().length, 0, 'Backdrop click closed STEAM modal');
    assertEqual(env.document.body.style.overflow, '', 'Body overflow restored');

    // 5. Sequential Rapid Cycling: 200 cycles of open -> close via randomized dismisser
    let seed = 42;
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < 200; i++) {
      // Pick a modal to open
      const modalType = Math.floor(pseudoRandom() * 3);
      if (modalType === 0) {
        playTourBtn.click();
      } else if (modalType === 1) {
        routeBtns[Math.floor(pseudoRandom() * 4)].click();
      } else {
        steamCards[Math.floor(pseudoRandom() * 4)].click();
      }

      assertEqual(getOpenModals().length, 1, `Step ${i}: exactly 1 modal open`);
      assertEqual(env.document.body.style.overflow, 'hidden', `Step ${i}: body overflow hidden`);

      // Pick a dismissal method: ESC (0), Close Button (1), Backdrop (2)
      const dismissMethod = Math.floor(pseudoRandom() * 3);
      const openModal = getOpenModals()[0];
      if (dismissMethod === 0) {
        pressEsc();
      } else if (dismissMethod === 1) {
        const btn = openModal.querySelector('.modal-close, #close-pano-modal');
        if (btn) btn.click();
      } else {
        const bd = openModal.querySelector('.modal-backdrop');
        if (bd) bd.click();
      }

      assertEqual(getOpenModals().length, 0, `Step ${i}: 0 modals after dismissal`);
      assertEqual(env.document.body.style.overflow, '', `Step ${i}: body overflow cleared after dismissal`);
    }
  });

  test('Concurrent mobile menu and modal ESC dismissal idempotency', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const menuToggle = env.document.querySelector('.menu-toggle');
    const mainNav = env.document.querySelector('.main-nav');
    const playTourBtn = env.document.querySelector('.play-tour');

    // Open mobile menu
    menuToggle.click();
    assert(mainNav.classList.contains('is-open'), 'Menu is open');
    assertEqual(menuToggle.getAttribute('aria-expanded'), 'true');

    // While menu is open, open a modal
    playTourBtn.click();
    const panoModal = env.document.getElementById('modal-panorama-360');
    assert(panoModal.classList.contains('modal-open'), 'Pano modal is open');
    assertEqual(env.document.body.style.overflow, 'hidden');

    // Press ESC: both modal AND mobile menu should be dismissed
    const ev = new env.window.KeyboardEvent('keydown', { key: 'Escape', code: 'Escape' });
    env.window.dispatchEvent(ev);

    assert(!panoModal.classList.contains('modal-open'), 'Modal must be closed by ESC');
    assert(!mainNav.classList.contains('is-open'), 'Mobile nav must be closed by ESC');
    assert(!mainNav.classList.contains('nav-open'), 'Mobile nav compat class must be removed');
    assertEqual(menuToggle.getAttribute('aria-expanded'), 'false', 'aria-expanded must reset to false');
    assertEqual(env.document.body.style.overflow, '', 'Body overflow restored');
  });

  test('Interleaved modal stacking maintains body scroll lock until all modals closed', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const routeBtns = env.document.querySelectorAll('.route-chapters button');
    const steamCards = env.document.querySelectorAll('.lab-grid .lab-card');

    // User opens Route 0 modal (Mường Phăng)
    routeBtns[0].click();
    const routeModal = env.document.getElementById('modal-muong-phang');
    assert(routeModal.classList.contains('modal-open'), 'Route modal is open');
    assertEqual(env.document.body.style.overflow, 'hidden', 'Body scroll locked');

    // While Route modal is active, another modal trigger fires (e.g. keyboard Tab+Enter or interleaved action)
    steamCards[0].click();
    const steamModal = env.document.getElementById('modal-steam-lab');
    assert(steamModal.classList.contains('modal-open'), 'STEAM modal is open');

    // Now user closes STEAM modal via its close button
    const steamCloseBtn = steamModal.querySelector('.modal-close');
    steamCloseBtn.click();
    assert(!steamModal.classList.contains('modal-open'), 'STEAM modal closed');

    // Check Route modal state: Route modal is STILL open!
    assert(routeModal.classList.contains('modal-open'), 'Route modal is still open');

    // VERIFIED: .modal-close checks open modals and keeps body overflow hidden!
    const bodyOverflow = env.document.body.style.overflow;
    console.log('    [Empirical Finding] Body overflow when Route modal is still open:', JSON.stringify(bodyOverflow));
    assertEqual(bodyOverflow, 'hidden', 'Body scroll remains locked while Route modal is open');
  });
});

suite('Tier 5 Adversarial — Tactical Map Mode & Hotspot Sequence Stress', () => {
  let env;

  test('200 rapid random hotspot visits interleaved with tactical map mode toggling', async () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const strategyMap = env.document.querySelector('.strategy-map');
    const modeBtns = env.document.querySelectorAll('.mode-switch button');
    const mapPins = env.document.querySelectorAll('.strategy-map .map-pin');
    const stripBtns = env.document.querySelectorAll('.hotspot-strip button');
    const progressText = env.document.querySelector('.progress-row strong');
    const progressBar = env.document.querySelector('.progress-track i');
    const titleEl = env.document.querySelector('.hotspot-panel h3');
    const codeEl = env.document.querySelector('.hotspot-meta span');

    assertEqual(mapPins.length, 10, 'Must have 10 map pins');
    assertEqual(stripBtns.length, 10, 'Must have 10 strip buttons');
    assertEqual(modeBtns.length, 2, 'Must have 2 mode buttons');

    let successAudioCount = 0;
    const origPlaySuccess = env.window.SiteAudio.playSuccess;
    env.window.SiteAudio.playSuccess = () => {
      successAudioCount++;
      if (origPlaySuccess) origPlaySuccess.call(env.window.SiteAudio);
    };

    const visitedSet = new Set(['H01']); // Initial is H01

    let seed = 12345;
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let step = 0; step < 200; step++) {
      const targetIdx = Math.floor(pseudoRandom() * 10);
      const usePin = pseudoRandom() > 0.5;
      const toggleMode = pseudoRandom() > 0.4;

      if (toggleMode) {
        const modeIdx = Math.floor(pseudoRandom() * 2);
        modeBtns[modeIdx].click();
        if (modeIdx === 0) {
          assert(strategyMap.classList.contains('mode-journey'), `Step ${step}: Map must have mode-journey`);
          assert(!strategyMap.classList.contains('mode-system'), `Step ${step}: Map must not have mode-system`);
        } else {
          assert(strategyMap.classList.contains('mode-system'), `Step ${step}: Map must have mode-system`);
          assert(!strategyMap.classList.contains('mode-journey'), `Step ${step}: Map must not have mode-journey`);
        }
      }

      // Visit hotspot
      if (usePin) {
        mapPins[targetIdx].click();
      } else {
        stripBtns[targetIdx].click();
      }

      const hotspotData = env.window.HOTSPOTS_DATA[targetIdx];
      visitedSet.add(hotspotData.id);

      // Check pin invariants
      let activePinCount = 0;
      mapPins.forEach((pin, pIdx) => {
        const pData = env.window.HOTSPOTS_DATA[pIdx];
        if (pIdx === targetIdx) {
          assert(pin.classList.contains('active'), `Pin ${pIdx} must be active at step ${step}`);
          assert(!pin.classList.contains('visited'), `Active pin ${pIdx} must NOT have visited class`);
          assertEqual(pin.getAttribute('aria-selected'), 'true', `Active pin must have aria-selected=true`);
          activePinCount++;
        } else {
          assert(!pin.classList.contains('active'), `Pin ${pIdx} must NOT be active`);
          assertEqual(pin.getAttribute('aria-selected'), null, `Inactive pin must not have aria-selected`);
          if (visitedSet.has(pData.id)) {
            assert(pin.classList.contains('visited'), `Visited pin ${pIdx} must have .visited`);
          } else {
            assert(!pin.classList.contains('visited'), `Unvisited pin ${pIdx} must not have .visited`);
          }
        }
      });
      assertEqual(activePinCount, 1, `Exactly one pin must be active at step ${step}`);

      // Check strip button invariants
      let activeStripCount = 0;
      stripBtns.forEach((btn, sIdx) => {
        if (sIdx === targetIdx) {
          assert(btn.classList.contains('active'), `Strip btn ${sIdx} must be active`);
          activeStripCount++;
        } else {
          assert(!btn.classList.contains('active'), `Strip btn ${sIdx} must not be active`);
        }
      });
      assertEqual(activeStripCount, 1, `Exactly one strip btn must be active at step ${step}`);

      // Check side panel metadata invariants
      assertEqual(titleEl.textContent, hotspotData.name, `Panel title matches ${hotspotData.name}`);
      assertEqual(codeEl.textContent, hotspotData.id, `Panel code matches ${hotspotData.id}`);

      // Check progress tracker
      assertEqual(progressText.textContent, `${visitedSet.size} / 10`, `Progress text must match visited count`);
      assertEqual(progressBar.style.width, `${(visitedSet.size / 10) * 100}%`, `Progress bar width matches`);
    }

    // Since 200 random picks covered all 10 hotspots
    assertEqual(visitedSet.size, 10, 'All 10 hotspots visited');
    assertEqual(progressText.textContent, '10 / 10');
    assertEqual(progressBar.style.width, '100%');
    assertGreaterThan(successAudioCount, 0, 'playSuccess must have triggered upon 10/10');
  });

  test('Image src consistency and race condition check after asynchronous timeout delay', async () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const mapPins = env.document.querySelectorAll('.strategy-map .map-pin');
    const hotspotImg = env.document.querySelector('.hotspot-panel .hotspot-image img');

    // Rapidly click Hotspot 1, 3, 5, 8 within 10ms
    mapPins[1].click();
    mapPins[3].click();
    mapPins[5].click();
    mapPins[8].click();

    // The current hotspot index is 8
    const expectedData = env.window.HOTSPOTS_DATA[8];

    // Wait for the 150ms timeout to resolve
    await sleep(200);

    // The image src and alt must match the final clicked hotspot (index 8)
    assertEqual(hotspotImg.src, expectedData.image, 'Image src must synchronize with final hotspot');
    assertEqual(hotspotImg.alt, expectedData.name, 'Image alt must synchronize with final hotspot');
    assertEqual(hotspotImg.style.opacity, '1', 'Image opacity must return to 1');
  });
});

suite('Tier 5 Adversarial — Rapid STEAM Lab Cycling & Dynamic Slider Reattachment', () => {
  let env;

  test('100 high-frequency cycles across S -> T -> E -> M -> S verify badge, title, and single container', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const steamCards = env.document.querySelectorAll('.lab-grid .lab-card');
    assertEqual(steamCards.length, 4);

    const expectedData = [
      {
        badge: 'VẬT LÝ & ĐỊA LÝ QUÂN SỰ',
        title: 'Thí Nghiệm Địa Hình & Tầm Nhìn Chiến Lược (Line of Sight)'
      },
      {
        badge: 'CÔNG NGHỆ THÔNG TIN & TRẮC ĐỊA',
        title: 'Tối Ưu Hóa Tuyến Đường Tour 3D & Bản Đồ Số GIS'
      },
      {
        badge: 'KỸ THUẬT XÂY DỰNG & ĐỘNG LỰC HỌC',
        title: 'Kỹ Thuật Chiến Hào Vây Lấn Chữ Chi & Hầm Ngầm A1'
      },
      {
        badge: 'TOÁN THỐNG KÊ & TÍNH TOÁN NĂNG LƯỢNG',
        title: 'Toán Học Chiến Dịch: Thống Kê & Bài Toán Hậu Cần Vĩ Đại'
      }
    ];

    let seed = 999;
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Cycle 100 times in deterministic and random patterns
    for (let i = 0; i < 100; i++) {
      const stationIdx = (i < 20) ? (i % 4) : Math.floor(pseudoRandom() * 4);
      steamCards[stationIdx].click();

      // Check container count
      const allModals = env.document.querySelectorAll('#modal-steam-lab');
      assertEqual(allModals.length, 1, `Step ${i}: Exactly 1 modal container must exist`);

      const modal = allModals[0];
      assert(modal.classList.contains('modal-open'), `Step ${i}: Modal must have .modal-open`);

      const badge = modal.querySelector('.modal-badge').textContent;
      const title = modal.querySelector('h3').textContent;

      assertEqual(badge, expectedData[stationIdx].badge, `Step ${i}: Badge mismatch`);
      assertEqual(title, expectedData[stationIdx].title, `Step ${i}: Title mismatch`);
    }

    // Close modal
    const closeBtn = env.document.querySelector('#modal-steam-lab .modal-close');
    closeBtn.click();
    const modal = env.document.getElementById('modal-steam-lab');
    assert(!modal.classList.contains('modal-open'), 'Modal must close');
  });

  test('Slider listener reattachment and mathematical accuracy across repeated station re-entries', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const steamCards = env.document.querySelectorAll('.lab-grid .lab-card');

    // Helper: test slider input
    const testSlider = (hVal, expectedLos, expectedDeg, expectedDead) => {
      const slider = env.document.getElementById('sim-height-slider');
      assert(slider, 'Slider must exist when Science station is active');

      slider.value = hVal;
      const inputEv = new DOMCustomEvent('input', { bubbles: true });
      inputEv.target = slider;
      slider.dispatchEvent(inputEv);

      assertEqual(env.document.getElementById('sim-height-val').textContent, `${hVal} mét`);
      assertEqual(env.document.getElementById('sim-los-km').textContent, `${expectedLos} km`);
      assertEqual(env.document.getElementById('sim-los-deg').textContent, `${expectedDeg}°`);
      assertEqual(env.document.getElementById('sim-dead-zone').textContent, `Chỉ ${expectedDead}% lòng chảo`);
    };

    // 1. Enter Station S
    steamCards[0].click();
    testSlider(50, '25.2', '-4.2', 8);
    testSlider(10, '11.3', '-0.8', 18);
    testSlider(80, '31.9', '-6.7', 3);

    // 2. Switch away to Station T, E, M
    steamCards[1].click();
    assertEqual(env.document.getElementById('sim-height-slider'), null, 'Slider removed in T');

    steamCards[2].click();
    assertEqual(env.document.getElementById('sim-height-slider'), null, 'Slider removed in E');

    steamCards[3].click();
    assertEqual(env.document.getElementById('sim-height-slider'), null, 'Slider removed in M');

    // 3. Re-enter Station S -> slider element is newly created in innerHTML
    steamCards[0].click();
    assert(env.document.getElementById('sim-height-slider'), 'Slider re-created in S');

    // Verify event listener is properly wired to the new element
    // Note: 3.57 * Math.sqrt(25) = 17.84999... -> toFixed(1) = '17.8'
    testSlider(25, '17.8', '-2.1', 14);
    testSlider(65, '28.8', '-5.5', 4);

    // 4. Close via ESC and re-enter
    const ev = new env.window.KeyboardEvent('keydown', { key: 'Escape' });
    env.window.dispatchEvent(ev);
    assert(!env.document.getElementById('modal-steam-lab').classList.contains('modal-open'));

    steamCards[0].click();
    assert(env.document.getElementById('modal-steam-lab').classList.contains('modal-open'));
    testSlider(40, '22.6', '-3.4', 10);
  });
});

suite('Tier 5 Adversarial — 360 Panorama Concurrent Touch, Wheel & Zoom Buttons', () => {
  let env;

  test('Single-finger touch drag combined concurrently with zoom button clicks and wheel events', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const playTourBtn = env.document.querySelector('.play-tour');
    playTourBtn.click();

    const modal = env.document.getElementById('modal-panorama-360');
    assert(modal.classList.contains('modal-open'));

    const viewport = modal.querySelector('#pano-viewport');
    const img = modal.querySelector('#pano-image');
    const zoomInBtn = modal.querySelector('#pano-zoom-in');
    const zoomOutBtn = modal.querySelector('#pano-zoom-out');
    const resetBtn = modal.querySelector('#pano-reset');

    // 1. Touch start at x=100
    const touchStartEv = new env.window.TouchEvent('touchstart', {
      touches: [{ clientX: 100 }]
    });
    viewport.dispatchEvent(touchStartEv);

    // 2. While touch dragging, user clicks Zoom In twice
    zoomInBtn.click(); // currentZoom: 1.0 -> 1.25
    zoomInBtn.click(); // currentZoom: 1.25 -> 1.50
    assertEqual(img.style.transform, 'scale(1.5) translateX(0px)');

    // 3. Wheel event zooms in further
    // deltaY = -100 -> currentZoom += 100 * 0.002 = +0.2 -> 1.70
    const wheelEv1 = new DOMCustomEvent('wheel', { cancelable: true });
    wheelEv1.deltaY = -100;
    viewport.dispatchEvent(wheelEv1);
    assertEqual(img.style.transform, 'scale(1.7) translateX(0px)');

    // 4. Touch move to x=150 (pan delta = +50px, translated by 50 * 0.4 = 20px)
    const touchMoveEv1 = new env.window.TouchEvent('touchmove', {
      touches: [{ clientX: 150 }]
    });
    env.window.dispatchEvent(touchMoveEv1);
    assertEqual(img.style.transform, 'scale(1.7) translateX(20px)');

    // 5. While still touch dragging, user clicks Zoom Out
    zoomOutBtn.click(); // 1.70 - 0.25 = 1.45
    assertEqual(img.style.transform, 'scale(1.45) translateX(20px)');

    // 6. Touch move further to x=250 (pan delta = +150px, translated by 150 * 0.4 = 60px)
    const touchMoveEv2 = new env.window.TouchEvent('touchmove', {
      touches: [{ clientX: 250 }]
    });
    env.window.dispatchEvent(touchMoveEv2);
    assertEqual(img.style.transform, 'scale(1.45) translateX(60px)');

    // 7. Touchend
    const touchEndEv = new env.window.TouchEvent('touchend');
    env.window.dispatchEvent(touchEndEv);

    // Subsequent touchmove when not dragging must be ignored
    const touchMoveEv3 = new env.window.TouchEvent('touchmove', {
      touches: [{ clientX: 999 }]
    });
    env.window.dispatchEvent(touchMoveEv3);
    assertEqual(img.style.transform, 'scale(1.45) translateX(60px)', 'Touchmove after touchend must be ignored');

    // 8. Reset button
    resetBtn.click();
    assertEqual(img.style.transform, 'scale(1) translateX(0px)', 'Reset button restores scale(1) translateX(0px)');
  });

  test('Multi-touch (pinch/2+ fingers) touchstart and touchmove safety', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const playTourBtn = env.document.querySelector('.play-tour');
    playTourBtn.click();

    const modal = env.document.getElementById('modal-panorama-360');
    const viewport = modal.querySelector('#pano-viewport');
    const img = modal.querySelector('#pano-image');

    // Multi-touch touchstart (2 fingers) must not initiate single-finger dragging
    const multiTouchStart = new env.window.TouchEvent('touchstart', {
      touches: [{ clientX: 100 }, { clientX: 200 }]
    });
    assertDoesNotThrow(() => {
      viewport.dispatchEvent(multiTouchStart);
    });

    // Touchmove with 2 fingers must be ignored safely
    const multiTouchMove = new env.window.TouchEvent('touchmove', {
      touches: [{ clientX: 120 }, { clientX: 220 }]
    });
    assertDoesNotThrow(() => {
      env.window.dispatchEvent(multiTouchMove);
    });

    assertEqual(img.style.transform, 'scale(1) translateX(0px)', 'Multi-touch must not cause erroneous panning');
  });

  test('Zoom boundary clamping limits [1.0, 2.5] under extreme wheel and button hammering', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const playTourBtn = env.document.querySelector('.play-tour');
    playTourBtn.click();

    const modal = env.document.getElementById('modal-panorama-360');
    const viewport = modal.querySelector('#pano-viewport');
    const img = modal.querySelector('#pano-image');
    const zoomInBtn = modal.querySelector('#pano-zoom-in');
    const zoomOutBtn = modal.querySelector('#pano-zoom-out');

    // Hammer zoom in 20 times -> must clamp at 2.5
    for (let i = 0; i < 20; i++) {
      zoomInBtn.click();
    }
    assertEqual(img.style.transform, 'scale(2.5) translateX(0px)');

    // Hammer wheel zoom in with massive negative delta
    const hugeWheelIn = new DOMCustomEvent('wheel', { cancelable: true });
    hugeWheelIn.deltaY = -10000;
    viewport.dispatchEvent(hugeWheelIn);
    assertEqual(img.style.transform, 'scale(2.5) translateX(0px)', 'Wheel cannot exceed 2.5 clamp');

    // Hammer zoom out 30 times -> must clamp at 1.0
    for (let i = 0; i < 30; i++) {
      zoomOutBtn.click();
    }
    assertEqual(img.style.transform, 'scale(1) translateX(0px)');

    // Hammer wheel zoom out with massive positive delta
    const hugeWheelOut = new DOMCustomEvent('wheel', { cancelable: true });
    hugeWheelOut.deltaY = 10000;
    viewport.dispatchEvent(hugeWheelOut);
    assertEqual(img.style.transform, 'scale(1) translateX(0px)', 'Wheel cannot go below 1.0 clamp');
  });

  test('Stale zoom & pan closure state cleanly reset on tour switching', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const playTourBtn = env.document.querySelector('.play-tour');
    const btnNextTour = env.document.querySelector('.tour-stepper button[aria-label="Tour tiếp theo"]');

    // Step 1: Open Tour A in 360 viewer
    playTourBtn.click();
    const modal = env.document.getElementById('modal-panorama-360');
    const img = modal.querySelector('#pano-image');
    const zoomInBtn = modal.querySelector('#pano-zoom-in');
    const zoomOutBtn = modal.querySelector('#pano-zoom-out');
    const viewport = modal.querySelector('#pano-viewport');

    // User zooms in to 2.25 (5 clicks of +0.25)
    for (let i = 0; i < 5; i++) zoomInBtn.click();
    assertEqual(img.style.transform, 'scale(2.25) translateX(0px)');

    // User pans 200px
    const touchStart = new env.window.TouchEvent('touchstart', { touches: [{ clientX: 100 }] });
    viewport.dispatchEvent(touchStart);
    const touchMove = new env.window.TouchEvent('touchmove', { touches: [{ clientX: 300 }] });
    env.window.dispatchEvent(touchMove);
    const touchEnd = new env.window.TouchEvent('touchend');
    env.window.dispatchEvent(touchEnd);
    assertEqual(img.style.transform, 'scale(2.25) translateX(80px)');

    // Close modal via close button
    const closeBtn = modal.querySelector('#close-pano-modal');
    closeBtn.click();
    assert(!modal.classList.contains('modal-open'));

    // Step 2: Switch to next tour (Tour B)
    btnNextTour.click();

    // Step 3: Re-open 360 viewer with Tour B
    playTourBtn.click();
    assert(modal.classList.contains('modal-open'));

    // Visual reset on open: line 560 reset transform attribute to default
    assertEqual(img.style.transform, 'scale(1) translateX(0px)', 'Visually reset to scale(1) translateX(0px)');

    // VERIFIED: The closure variables currentZoom, currentPanX, startX are cleanly reset on open.
    // Clicking Zoom Out when reopened at 1.0 remains clamped at scale(1) translateX(0px).
    zoomOutBtn.click();
    const cleanTransform = img.style.transform;
    console.log('    [Empirical Finding] Panorama transform on Tour B after clicking Zoom Out:', cleanTransform);

    // Confirms that clicking zoom-out does not zoom in from 1.0 to 2.0 or jump 80px!
    assertEqual(cleanTransform, 'scale(1) translateX(0px)', 'Confirms stale zoom/pan closure state is cleanly reset');
  });
});

if (require.main === module) {
  const { runSuites } = require('./helpers/test_runner.cjs');
  runSuites().then(res => {
    process.exit(res.failed > 0 ? 1 : 0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
