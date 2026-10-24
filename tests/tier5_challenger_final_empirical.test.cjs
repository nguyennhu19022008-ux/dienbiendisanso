/**
 * TIER 5: CHALLENGER FINAL EMPIRICAL STRESS & ADVERSARIAL VERIFICATION
 * 
 * Independent, exhaustive verification of the 4 remediations implemented by worker_impl_2:
 * 1. Fullscreen fallback safety (no TypeError when requestFullscreen is absent/non-functional).
 * 2. 360 Panorama state reset (currentZoom and currentPanX cleanly reset to 1 and 0 on tour reopen).
 * 3. Stacked modal body scroll lock (closing one modal checks remaining openModals before restoring body overflow).
 * 4. Hotspot 10/10 victory fanfare audio latch (fires strictly once when reaching 10 hotspots, not on repeated clicks).
 */

'use strict';

const path = require('path');
const {
  suite,
  test,
  assert,
  assertEqual,
  assertNotEqual,
  assertDoesNotThrow
} = require('./helpers/test_runner.cjs');
const { createEnvironment } = require('./helpers/dom_harness.cjs');

const PROJECT_ROOT = path.resolve(__dirname, '..');

suite('Empirical Challenger: 1. Fullscreen Fallback Safety', () => {
  let env;

  test('Frame with neither standard nor webkit requestFullscreen does not throw TypeError on click', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const frame = env.document.querySelector('.viewer-frame');
    assert(frame, '.viewer-frame exists');
    delete frame.requestFullscreen;
    delete frame.webkitRequestFullscreen;

    const fsBtn = env.document.querySelector('.viewer-actions button:last-child');
    assert(fsBtn, 'Fullscreen button exists');

    assertDoesNotThrow(() => {
      fsBtn.click();
    }, 'Clicking fullscreen button in environment lacking fullscreen APIs must not throw');
  });

  test('Degraded non-function attributes on frame do not trigger TypeError', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const frame = env.document.querySelector('.viewer-frame');
    frame.requestFullscreen = 'not_a_function';
    frame.webkitRequestFullscreen = 12345;

    const fsBtn = env.document.querySelector('.viewer-actions button:last-child');

    assertDoesNotThrow(() => {
      fsBtn.click();
    }, 'Frame with non-function fullscreen properties must be safely ignored');
  });

  test('Invokes standard requestFullscreen when present', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const frame = env.document.querySelector('.viewer-frame');
    let calledStandard = 0;
    frame.requestFullscreen = () => { calledStandard++; };
    delete frame.webkitRequestFullscreen;

    const fsBtn = env.document.querySelector('.viewer-actions button:last-child');
    fsBtn.click();
    assertEqual(calledStandard, 1, 'Standard requestFullscreen must be invoked');
  });

  test('Invokes webkitRequestFullscreen as fallback when standard is absent', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const frame = env.document.querySelector('.viewer-frame');
    let calledWebkit = 0;
    delete frame.requestFullscreen;
    frame.webkitRequestFullscreen = () => { calledWebkit++; };

    const fsBtn = env.document.querySelector('.viewer-actions button:last-child');
    fsBtn.click();
    assertEqual(calledWebkit, 1, 'webkitRequestFullscreen must be invoked when standard is absent');
  });

  test('Exit fullscreen fallback safety when in fullscreen mode', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const frame = env.document.querySelector('.viewer-frame');
    env.document.fullscreenElement = frame;

    // Both missing
    delete env.document.exitFullscreen;
    delete env.document.webkitExitFullscreen;

    const fsBtn = env.document.querySelector('.viewer-actions button:last-child');
    assertDoesNotThrow(() => {
      fsBtn.click();
    }, 'Exit fullscreen without API support must not throw');

    // Only webkit exit
    let calledWebkitExit = 0;
    env.document.webkitExitFullscreen = () => { calledWebkitExit++; };
    fsBtn.click();
    assertEqual(calledWebkitExit, 1, 'webkitExitFullscreen must be invoked as fallback');

    // Standard exit
    let calledStandardExit = 0;
    env.document.exitFullscreen = () => { calledStandardExit++; };
    fsBtn.click();
    assertEqual(calledStandardExit, 1, 'Standard exitFullscreen must be invoked when present');
  });

  test('1,000 rapid clicks on fullscreen button under completely stripped fullscreen APIs', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const frame = env.document.querySelector('.viewer-frame');
    delete frame.requestFullscreen;
    delete frame.webkitRequestFullscreen;
    delete env.document.exitFullscreen;
    delete env.document.webkitExitFullscreen;

    const fsBtn = env.document.querySelector('.viewer-actions button:last-child');
    assertDoesNotThrow(() => {
      for (let i = 0; i < 1000; i++) {
        fsBtn.click();
      }
    }, '1,000 rapid clicks without fullscreen support must execute cleanly');
  });
});

suite('Empirical Challenger: 2. 360 Panorama State Reset', () => {
  let env;

  test('Numeric coordinates and transform reset cleanly across successive tour visits', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const playTourBtn = env.document.querySelector('.play-tour');
    const btnNextTour = env.document.querySelector('.tour-stepper button[aria-label="Tour tiếp theo"]');

    // 1. Open Tour 0
    playTourBtn.click();
    const modal = env.document.getElementById('modal-panorama-360');
    const img = modal.querySelector('#pano-image');
    const zoomInBtn = modal.querySelector('#pano-zoom-in');
    const zoomOutBtn = modal.querySelector('#pano-zoom-out');
    const viewport = modal.querySelector('#pano-viewport');
    const closeBtn = modal.querySelector('#close-pano-modal');

    // Zoom in 6 times to max zoom 2.5
    for (let i = 0; i < 6; i++) zoomInBtn.click();
    assertEqual(img.style.transform, 'scale(2.5) translateX(0px)');

    // Pan with mouse drag: mousedown at 100, mousemove to 600 -> currentPanX = 500, translateX = 200px
    const mouseDown = new env.window.MouseEvent('mousedown', { clientX: 100 });
    viewport.dispatchEvent(mouseDown);
    const mouseMove = new env.window.MouseEvent('mousemove', { clientX: 600 });
    env.window.dispatchEvent(mouseMove);
    const mouseUp = new env.window.MouseEvent('mouseup');
    env.window.dispatchEvent(mouseUp);

    assertEqual(img.style.transform, 'scale(2.5) translateX(200px)', 'Tour 0 panned and zoomed');

    // Close modal
    closeBtn.click();
    assert(!modal.classList.contains('modal-open'));

    // Switch to Tour 1 and open
    btnNextTour.click();
    playTourBtn.click();
    assert(modal.classList.contains('modal-open'));

    // Check immediate transform upon opening Tour 1
    assertEqual(img.style.transform, 'scale(1) translateX(0px)', 'Immediate visual transform must be scale(1) translateX(0px)');

    // Click Zoom In once: must cleanly transition from 1.0 to 1.25 at 0px pan (NOT 2.5 and NOT 200px pan)
    zoomInBtn.click();
    assertEqual(img.style.transform, 'scale(1.25) translateX(0px)', 'Next zoom-in starts strictly from 1.0 baseline and 0px pan');

    // Click Zoom Out twice: must clamp to 1.0
    zoomOutBtn.click();
    assertEqual(img.style.transform, 'scale(1) translateX(0px)');
    zoomOutBtn.click();
    assertEqual(img.style.transform, 'scale(1) translateX(0px)', 'Zoom out at lower bound clamps cleanly at scale(1) translateX(0px)');
  });

  test('Reset button inside active tour cleanly resets zoom, pan and transform', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const playTourBtn = env.document.querySelector('.play-tour');
    playTourBtn.click();
    const modal = env.document.getElementById('modal-panorama-360');
    const img = modal.querySelector('#pano-image');
    const zoomInBtn = modal.querySelector('#pano-zoom-in');
    const resetBtn = modal.querySelector('#pano-reset');
    const viewport = modal.querySelector('#pano-viewport');

    // Zoom and pan
    zoomInBtn.click();
    zoomInBtn.click();
    const touchStart = new env.window.TouchEvent('touchstart', { touches: [{ clientX: 50 }] });
    viewport.dispatchEvent(touchStart);
    const touchMove = new env.window.TouchEvent('touchmove', { touches: [{ clientX: 300 }] });
    env.window.dispatchEvent(touchMove);
    const touchEnd = new env.window.TouchEvent('touchend');
    env.window.dispatchEvent(touchEnd);

    assertNotEqual(img.style.transform, 'scale(1) translateX(0px)');

    // Click Reset
    resetBtn.click();
    assertEqual(img.style.transform, 'scale(1) translateX(0px)', 'Reset button restores canonical scale(1) translateX(0px)');

    // Immediately click Zoom In: verify start is 1.0 -> 1.25 at 0px
    zoomInBtn.click();
    assertEqual(img.style.transform, 'scale(1.25) translateX(0px)', 'Subsequent zoom after reset starts from 1.0 baseline');
  });

  test('50 consecutive tour reopenings maintain pristine state invariants', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const playTourBtn = env.document.querySelector('.play-tour');
    const btnNextTour = env.document.querySelector('.tour-stepper button[aria-label="Tour tiếp theo"]');

    for (let cycle = 0; cycle < 50; cycle++) {
      playTourBtn.click();
      const modal = env.document.getElementById('modal-panorama-360');
      const img = modal.querySelector('#pano-image');
      assertEqual(img.style.transform, 'scale(1) translateX(0px)', `Cycle ${cycle} must open at scale(1) translateX(0px)`);

      const zoomInBtn = modal.querySelector('#pano-zoom-in');
      zoomInBtn.click(); // zoom to 1.25

      const closeBtn = modal.querySelector('#close-pano-modal');
      closeBtn.click();

      btnNextTour.click(); // Next tour
    }
  });
});

suite('Empirical Challenger: 3. Stacked Modal Body Scroll Lock', () => {
  let env;

  test('Stacking 3 modals: body scroll remains locked until the last modal is dismissed', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const playTourBtn = env.document.querySelector('.play-tour');
    const routeBtns = env.document.querySelectorAll('.route-chapters button');
    const steamCards = env.document.querySelectorAll('.lab-grid .lab-card');

    // 1. Open Route modal (Mường Phăng)
    routeBtns[0].click();
    const routeModal = env.document.getElementById('modal-muong-phang');
    assert(routeModal.classList.contains('modal-open'));
    assertEqual(env.document.body.style.overflow, 'hidden', 'Step 1: 1 modal open -> overflow hidden');

    // 2. Open STEAM lab modal (Station S)
    steamCards[0].click();
    const steamModal = env.document.getElementById('modal-steam-lab');
    assert(steamModal.classList.contains('modal-open'));
    assertEqual(env.document.body.style.overflow, 'hidden', 'Step 2: 2 modals open -> overflow hidden');

    // 3. Open 360 Panorama modal
    playTourBtn.click();
    const panoModal = env.document.getElementById('modal-panorama-360');
    assert(panoModal.classList.contains('modal-open'));
    assertEqual(env.document.body.style.overflow, 'hidden', 'Step 3: 3 modals open -> overflow hidden');

    // Check open count
    const openModals = env.document.querySelectorAll('.custom-modal.modal-open, #modal-panorama-360.modal-open');
    assertEqual(openModals.length, 3, 'Exactly 3 modals currently open');

    // Dismiss Modal 3 (Panorama) via close button
    const panoClose = panoModal.querySelector('#close-pano-modal');
    panoClose.click();
    assert(!panoModal.classList.contains('modal-open'));
    assertEqual(env.document.body.style.overflow, 'hidden', 'Step 4: Panorama closed, 2 remain -> body overflow MUST STAY hidden');

    // Dismiss Modal 2 (STEAM) via close button
    const steamClose = steamModal.querySelector('.modal-close');
    steamClose.click();
    assert(!steamModal.classList.contains('modal-open'));
    assertEqual(env.document.body.style.overflow, 'hidden', 'Step 5: STEAM closed, 1 remains -> body overflow MUST STAY hidden');

    // Dismiss Modal 1 (Route) via backdrop
    const routeBackdrop = routeModal.querySelector('.modal-backdrop');
    routeBackdrop.click();
    assert(!routeModal.classList.contains('modal-open'));
    assertEqual(env.document.body.style.overflow, '', 'Step 6: Last modal closed -> body overflow MUST BE restored to empty string');
  });

  test('Reverse order dismissals: Route closed before STEAM lab', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const routeBtns = env.document.querySelectorAll('.route-chapters button');
    const steamCards = env.document.querySelectorAll('.lab-grid .lab-card');

    routeBtns[0].click();
    const routeModal = env.document.getElementById('modal-muong-phang');
    steamCards[0].click();
    const steamModal = env.document.getElementById('modal-steam-lab');

    // Dismiss Route modal first via its close button
    const routeClose = routeModal.querySelector('.modal-close');
    routeClose.click();
    assert(!routeModal.classList.contains('modal-open'));

    // STEAM modal is still open
    assert(steamModal.classList.contains('modal-open'));
    assertEqual(env.document.body.style.overflow, 'hidden', 'Body overflow remains hidden when STEAM modal is still open');

    // Dismiss STEAM modal via backdrop
    const steamBackdrop = steamModal.querySelector('.modal-backdrop');
    steamBackdrop.click();
    assertEqual(env.document.body.style.overflow, '', 'Body overflow restored after closing last open modal');
  });

  test('Global ESC dismissal clears all modals and restores overflow synchronously', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const playTourBtn = env.document.querySelector('.play-tour');
    const routeBtns = env.document.querySelectorAll('.route-chapters button');

    routeBtns[0].click();
    playTourBtn.click();

    assertEqual(env.document.body.style.overflow, 'hidden');

    const ev = new env.window.KeyboardEvent('keydown', { key: 'Escape', code: 'Escape' });
    env.window.dispatchEvent(ev);

    const openModals = env.document.querySelectorAll('.custom-modal.modal-open, #modal-panorama-360.modal-open');
    assertEqual(openModals.length, 0, 'ESC closes all modals');
    assertEqual(env.document.body.style.overflow, '', 'ESC restores body overflow');
  });

  test('Fuzz test: 100 randomized interleaved open/close actions maintain strict invariant', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const playTourBtn = env.document.querySelector('.play-tour');
    const routeBtns = env.document.querySelectorAll('.route-chapters button');
    const steamCards = env.document.querySelectorAll('.lab-grid .lab-card');

    const openActions = [
      () => playTourBtn.click(),
      () => routeBtns[0].click(),
      () => steamCards[0].click()
    ];

    let seed = 999;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < 100; i++) {
      const actionType = rand();
      if (actionType < 0.6) {
        // Open one
        const opener = openActions[Math.floor(rand() * openActions.length)];
        opener();
      } else {
        // Close an open modal if any
        const openList = env.document.querySelectorAll('.custom-modal.modal-open, #modal-panorama-360.modal-open');
        if (openList.length > 0) {
          const target = openList[Math.floor(rand() * openList.length)];
          const closeBtn = target.querySelector('.modal-close, #close-pano-modal');
          if (closeBtn) closeBtn.click();
        }
      }

      // Check invariant
      const remaining = env.document.querySelectorAll('.custom-modal.modal-open, #modal-panorama-360.modal-open');
      if (remaining.length > 0) {
        assertEqual(env.document.body.style.overflow, 'hidden', `Iteration ${i}: ${remaining.length} open modals must enforce overflow=hidden`);
      } else {
        assertEqual(env.document.body.style.overflow, '', `Iteration ${i}: 0 open modals must enforce overflow=''`);
      }
    }
  });
});

suite('Empirical Challenger: 4. Hotspot 10/10 Victory Fanfare Audio Latch', () => {
  let env;

  test('SiteAudio.playSuccess is invoked strictly once when completing 10/10 hotspots', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const mapPins = env.document.querySelectorAll('.strategy-map .map-pin');
    assertEqual(mapPins.length, 10, '10 tactical pins present');

    let fanfareCalls = 0;
    env.window.SiteAudio.playSuccess = () => {
      fanfareCalls++;
    };

    // Click pins 0 to 8 (9 total visited)
    for (let i = 0; i < 9; i++) {
      mapPins[i].click();
    }
    assertEqual(fanfareCalls, 0, 'No fanfare before reaching 10/10');

    // Click pin 9 (10th hotspot reached)
    mapPins[9].click();
    assertEqual(fanfareCalls, 1, 'Victory fanfare triggered exactly once upon reaching 10/10');

    // Repeated clicks on pin 9
    for (let i = 0; i < 10; i++) {
      mapPins[9].click();
    }
    assertEqual(fanfareCalls, 1, 'Repeated clicks on pin 9 must NOT retrigger fanfare');

    // Repeated clicks on previous pins
    for (let i = 0; i < 9; i++) {
      mapPins[i].click();
    }
    assertEqual(fanfareCalls, 1, 'Visiting already explored pins must NOT retrigger fanfare');

    // Click all 10 strip buttons
    const stripBtns = env.document.querySelectorAll('.hotspot-strip button');
    stripBtns.forEach(btn => btn.click());
    assertEqual(fanfareCalls, 1, 'Strip buttons must NOT retrigger fanfare');

    // Toggle map exploration modes
    const modeBtns = env.document.querySelectorAll('.mode-switch button');
    for (let i = 0; i < 20; i++) {
      modeBtns[i % 2].click();
      mapPins[i % 10].click();
    }
    assertEqual(fanfareCalls, 1, 'Mode switching and pin clicking must NOT retrigger fanfare');
  });

  test('Scrambled visitation order triggers fanfare strictly on the 10th distinct pin', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const mapPins = env.document.querySelectorAll('.strategy-map .map-pin');
    let fanfareCalls = 0;
    env.window.SiteAudio.playSuccess = () => {
      fanfareCalls++;
    };

    // Non-linear order: 10 distinct pins scrambled
    const order = [4, 7, 1, 8, 2, 0, 5, 9, 3, 6];

    for (let step = 0; step < 9; step++) {
      mapPins[order[step]].click();
      assertEqual(fanfareCalls, 0, `Step ${step + 1}: fanfare must not fire at ${step + 1}/10`);
    }

    // 10th distinct pin
    mapPins[order[9]].click();
    assertEqual(fanfareCalls, 1, 'Fanfare fires on 10th distinct pin');

    // 500 random pin hammer clicks
    for (let i = 0; i < 500; i++) {
      const idx = Math.floor(Math.random() * 10);
      mapPins[idx].click();
    }
    assertEqual(fanfareCalls, 1, '500 hammer clicks after completion must never fire fanfare again');
  });

  test('Missing or uninitialized SiteAudio.playSuccess handles gracefully without error', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    // SiteAudio without playSuccess method
    env.window.SiteAudio.playSuccess = null;

    const mapPins = env.document.querySelectorAll('.strategy-map .map-pin');
    assertDoesNotThrow(() => {
      for (let i = 0; i < 10; i++) {
        mapPins[i].click();
      }
    }, 'Reaching 10 hotspots with null playSuccess does not throw');
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
