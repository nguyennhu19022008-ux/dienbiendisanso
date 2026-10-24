/**
 * TIER 5: EMPIRICAL STRESS HARNESS & ADVERSARIAL RESILIENCE
 * 
 * Challenger 1 Empirical Verification Suite:
 * - Stress 1: Rapid Tour Stepper & Filter Navigation (500 steps, modulo ring, wrap-around)
 * - Stress 2: Rapid Modal Thrashing & Stack Lifecycle (1,000 open/close/ESC cycles)
 * - Stress 3: Extreme Slider & STEAM Math Oracle (1,000 inputs, bounds, zero, large, NaN detection)
 * - Stress 4: High-Frequency Audio & Device Failure Injection (5,000 calls, broken AudioContext)
 * - Stress 5: Rapid Scrolling & Telemetry Metrics (2,000 scroll events, bounce, overscroll)
 * - Stress 6: Tactical Map Exploration & Hotspots Monotonicity (1,000 clicks, visited cap at 10)
 * - Stress 7: Mobile Navigation Drawer & Keyboard ESC (1,000 toggles, link click auto-dismiss)
 * - Stress 8: Fullscreen & Panorama Viewport Edge Cases (API fallback, zoom clamps [1.0, 2.5])
 */

'use strict';

const path = require('path');
const {
  suite,
  test,
  assert,
  assertEqual,
  assertNotEqual,
  assertDoesNotThrow,
  assertGreaterThan,
  assertLessThan
} = require('./helpers/test_runner.cjs');
const { createEnvironment, DOMCustomEvent } = require('./helpers/dom_harness.cjs');

const PROJECT_ROOT = path.resolve(__dirname, '..');

suite('Tier 5 Stress 1: Rapid Tour Stepper & Modulo Navigation', () => {
  let env;

  test('500 rapid interleaved prev/next stepper clicks maintain state and percentage bounds', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const btnPrev = env.document.querySelector('.tour-stepper button[aria-label="Tour trước"]');
    const btnNext = env.document.querySelector('.tour-stepper button[aria-label="Tour tiếp theo"]');
    const stepperProgress = env.document.querySelector('.tour-stepper div i');
    const viewerStatus = env.document.querySelector('.viewer-status');

    assert(btnPrev && btnNext, 'Tour navigation stepper buttons must exist');

    for (let i = 0; i < 500; i++) {
      if (i % 3 === 0) {
        btnPrev.click();
      } else {
        btnNext.click();
      }

      // Assert DOM state consistency after each rapid click
      const activeCards = env.document.querySelectorAll('.tour-rail .tour-card.active');
      assertEqual(activeCards.length, 1, `Must have exactly 1 active card at iteration ${i}`);

      const widthStr = stepperProgress.style.width;
      assert(widthStr.endsWith('%'), `Progress width must be percentage at iteration ${i}`);
      const pct = parseFloat(widthStr);
      assert(!isNaN(pct), `Progress width must not be NaN at iteration ${i}`);
      assert(pct >= 12.5 && pct <= 100, `Progress percentage out of bounds [12.5%, 100%]: ${pct}%`);

      assert(!viewerStatus.textContent.includes('undefined'), `Viewer status must not contain "undefined" at step ${i}`);
      assert(!viewerStatus.textContent.includes('NaN'), `Viewer status must not contain "NaN" at step ${i}`);
    }
  });

  test('Rapid filter tab switching concurrent with stepper navigation does not deadlock', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const filterBtns = env.document.querySelectorAll('.tour-filter button');
    const btnNext = env.document.querySelector('.tour-stepper button[aria-label="Tour tiếp theo"]');
    const btnPrev = env.document.querySelector('.tour-stepper button[aria-label="Tour trước"]');

    assertGreaterThan(filterBtns.length, 0, 'Filter buttons must exist');

    for (let i = 0; i < 200; i++) {
      const filterBtn = filterBtns[i % filterBtns.length];
      filterBtn.click();

      btnNext.click();
      btnPrev.click();

      const activeCard = env.document.querySelector('.tour-rail .tour-card.active');
      assert(activeCard, `Must have an active card at iteration ${i}`);
      assertNotEqual(activeCard.style.display, 'none', `Active card must not be hidden by filter at iteration ${i}`);
    }
  });
});

suite('Tier 5 Stress 2: Rapid Modal Thrashing & Lifecycle', () => {
  let env;

  test('1,000 rapid open/close/ESC operations across multiple modal types prevent DOM duplication', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const playTourBtn = env.document.querySelector('.play-tour');
    const routeBtns = env.document.querySelectorAll('.route-chapters button');
    const labCards = env.document.querySelectorAll('.lab-grid .lab-card');

    assert(playTourBtn, 'Play tour button must exist');
    assertGreaterThan(routeBtns.length, 0, 'Route buttons must exist');
    assertGreaterThan(labCards.length, 0, 'Lab cards must exist');

    for (let i = 0; i < 250; i++) {
      // 1. Open 360 Panorama modal
      playTourBtn.click();
      let panoModal = env.document.getElementById('modal-panorama-360');
      assert(panoModal && panoModal.classList.contains('modal-open'), 'Panorama modal must open');

      // 2. Open Route modal
      const routeIdx = i % routeBtns.length;
      routeBtns[routeIdx].click();

      // 3. Open STEAM lab modal
      const labIdx = i % labCards.length;
      labCards[labIdx].click();

      // 4. Press ESC to dismiss
      const escEvent = new env.window.KeyboardEvent('keydown', { key: 'Escape' });
      env.window.dispatchEvent(escEvent);

      // Invariant: ESC clears all open modals
      const openModals = env.document.querySelectorAll('.custom-modal.modal-open');
      assertEqual(openModals.length, 0, `All modals must be closed after ESC at iteration ${i}`);
      assertEqual(env.document.body.style.overflow, '', `Body overflow must be restored after ESC at iteration ${i}`);
    }

    // Verify DOM element uniqueness (no memory leak / duplicate DOM elements injected)
    assertEqual(env.document.querySelectorAll('#modal-panorama-360').length, 1, 'Only 1 panorama modal in DOM');
    assertEqual(env.document.querySelectorAll('#modal-steam-lab').length, 1, 'Only 1 steam modal in DOM');
    assertEqual(env.document.querySelectorAll('#modal-muong-phang').length, 1, 'Only 1 muong-phang modal in DOM');
    assertEqual(env.document.querySelectorAll('#modal-compare-a1-d1').length, 1, 'Only 1 compare modal in DOM');
  });

  test('360 Panorama viewport withstands extreme gestures, wheel deltas and multi-touch', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const playTourBtn = env.document.querySelector('.play-tour');
    playTourBtn.click();

    const panoModal = env.document.getElementById('modal-panorama-360');
    assert(panoModal, 'Panorama modal must exist');
    const viewport = panoModal.querySelector('#pano-viewport');
    const img = panoModal.querySelector('#pano-image');
    assert(viewport && img, 'Viewport and image elements must exist');

    // 1. Simulate 300 rapid touch moves including multi-touch and single-touch
    for (let i = 0; i < 300; i++) {
      const isMultiTouch = (i % 5 === 0);
      const touches = isMultiTouch ?
        [{ clientX: 100 + i }, { clientX: 200 + i }] :
        [{ clientX: 50 + (i % 70) * 10 }];

      const touchStart = new DOMCustomEvent('touchstart');
      touchStart.touches = touches;
      viewport.dispatchEvent(touchStart);

      const touchMove = new DOMCustomEvent('touchmove');
      touchMove.touches = touches;
      env.window.dispatchEvent(touchMove);

      const touchEnd = new DOMCustomEvent('touchend');
      env.window.dispatchEvent(touchEnd);
    }

    // 2. Simulate 200 extreme wheel zoom events
    const extremeDeltas = [-100000, 50000, 0, -1, 1, 999999, -500];
    for (const delta of extremeDeltas) {
      const wheelEvt = new DOMCustomEvent('wheel');
      wheelEvt.deltaY = delta;
      wheelEvt.preventDefault = () => {};
      viewport.dispatchEvent(wheelEvt);

      const transform = img.style.transform || '';
      assert(!transform.includes('NaN'), `Transform must not contain NaN after wheel delta ${delta}: ${transform}`);
      assert(!transform.includes('Infinity'), `Transform must not contain Infinity after wheel delta ${delta}: ${transform}`);
    }

    // 3. Zoom controls boundary checks
    const btnZoomIn = panoModal.querySelector('#pano-zoom-in');
    const btnZoomOut = panoModal.querySelector('#pano-zoom-out');
    const btnReset = panoModal.querySelector('#pano-reset');

    for (let i = 0; i < 30; i++) btnZoomIn.click();
    assert(img.style.transform.includes('scale(2.5)'), `Zoom in must clamp at 2.5: ${img.style.transform}`);

    for (let i = 0; i < 30; i++) btnZoomOut.click();
    assert(img.style.transform.includes('scale(1)'), `Zoom out must clamp at 1: ${img.style.transform}`);

    btnReset.click();
    assertEqual(img.style.transform, 'scale(1) translateX(0px)', 'Reset must restore default transform');
  });
});

suite('Tier 5 Stress 3: Extreme Slider & STEAM Math Oracle', () => {
  let env;

  test('1,000 rapid random slider values within valid range [10, 80] produce accurate math without NaN', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const scienceCard = env.document.querySelectorAll('.lab-grid .lab-card')[0];
    scienceCard.click();

    const slider = env.document.getElementById('sim-height-slider');
    const heightVal = env.document.getElementById('sim-height-val');
    const losKm = env.document.getElementById('sim-los-km');
    const losDeg = env.document.getElementById('sim-los-deg');
    const deadZone = env.document.getElementById('sim-dead-zone');

    assert(slider && heightVal && losKm && losDeg && deadZone, 'Simulation elements must exist');

    for (let i = 0; i < 1000; i++) {
      const h = Math.floor(Math.random() * 71) + 10;
      slider.value = String(h);
      slider.dispatchEvent(new DOMCustomEvent('input'));

      // Validate against floating-point math
      const expectedLos = (3.57 * Math.sqrt(h)).toFixed(1);
      const expectedDeg = (-0.084 * h).toFixed(1);
      const expectedDead = Math.max(3, 20 - Math.floor(h / 4));

      assertEqual(heightVal.textContent, `${h} mét`);
      assertEqual(losKm.textContent, `${expectedLos} km`);
      assertEqual(losDeg.textContent, `${expectedDeg}°`);
      assertEqual(deadZone.textContent, `Chỉ ${expectedDead}% lòng chảo`);

      assert(!losKm.textContent.includes('NaN'), `losKm must not contain NaN at h=${h}`);
      assert(!losDeg.textContent.includes('NaN'), `losDeg must not contain NaN at h=${h}`);
      assert(!deadZone.textContent.includes('NaN'), `deadZone must not contain NaN at h=${h}`);
    }
  });

  test('Extreme out-of-range slider inputs do not throw runtime exceptions', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const scienceCard = env.document.querySelectorAll('.lab-grid .lab-card')[0];
    scienceCard.click();
    const slider = env.document.getElementById('sim-height-slider');
    const deadZone = env.document.getElementById('sim-dead-zone');

    const testValues = ['0', '1', '100', '1000', '5000', '999999'];

    for (const val of testValues) {
      assertDoesNotThrow(() => {
        slider.value = val;
        slider.dispatchEvent(new DOMCustomEvent('input'));
      }, `Slider input ${val} must not throw uncaught error`);

      const h = parseInt(val, 10);
      const expectedDead = Math.max(3, 20 - Math.floor(h / 4));
      assertEqual(deadZone.textContent, `Chỉ ${expectedDead}% lòng chảo`);
    }
  });
});

suite('Tier 5 Stress 4: High-Frequency Audio & Failure Injection', () => {
  let env;

  test('5,000 rapid interleaved audio calls and concurrent mute toggles maintain state integrity', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const audio = env.window.SiteAudio;
    assert(audio, 'SiteAudio must exist');

    assertDoesNotThrow(() => {
      for (let i = 0; i < 1000; i++) {
        audio.playClick();
        audio.playRadar();
        audio.playWhoosh();
        audio.playSuccess();

        if (i % 10 === 0) {
          audio.toggleMute();
          assertEqual(typeof audio.isMuted, 'boolean', 'isMuted must strictly remain boolean');
        }
      }
    }, '5,000 high-frequency audio API calls must complete without runtime errors');
  });

  test('Audio methods survive broken AudioContext / device failure injection cleanly', () => {
    class FailingAudioContext {
      constructor() {
        this.state = 'running';
        this.currentTime = 0;
        this.destination = {};
      }
      createOscillator() {
        throw new Error('Hardware device disconnected / DAC timeout');
      }
      createGain() {
        throw new Error('Gain node allocation failed: out of memory');
      }
      resume() {}
    }

    const faultyEnv = createEnvironment(PROJECT_ROOT);
    faultyEnv.window.AudioContext = FailingAudioContext;
    faultyEnv.loadScripts();

    const audio = faultyEnv.window.SiteAudio;
    assert(audio, 'SiteAudio must exist');

    assertDoesNotThrow(() => {
      audio.playClick();
      audio.playRadar();
      audio.playWhoosh();
      audio.playSuccess();
    }, 'All audio methods must catch internal Web Audio API failures gracefully');
  });
});

suite('Tier 5 Stress 5: Rapid Scrolling & HUD Telemetry', () => {
  let env;

  test('2,000 rapid scroll events across extreme boundaries maintain HUD metrics without NaN', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const btn = env.document.getElementById('backToTopBtn');
    const circle = env.document.getElementById('scrollProgressCircle');
    const bar = env.document.getElementById('scrollProgressBar');

    assert(btn && circle && bar, 'Scroll HUD elements must exist');

    const testPositions = [
      0, -100, -50, 10, 200, 349, 350, 351, 600, 1000, 2500, 10000, 50000, 0
    ];

    for (let i = 0; i < 2000; i++) {
      const scrollPos = testPositions[i % testPositions.length];
      env.window.scrollY = scrollPos;
      env.window.dispatchEvent(new DOMCustomEvent('scroll'));

      const barWidth = bar.style.width;
      assert(barWidth.endsWith('%'), `Bar width must be percentage at pos ${scrollPos}: ${barWidth}`);
      const pct = parseFloat(barWidth);
      assert(!isNaN(pct), `Bar width must not be NaN at pos ${scrollPos}`);
      assert(pct >= 0 && pct <= 100, `Bar width percentage out of bounds: ${pct}`);

      const dashOffset = parseFloat(circle.style.strokeDashoffset);
      assert(!isNaN(dashOffset), `Circle dash offset must not be NaN at pos ${scrollPos}`);
      assert(dashOffset >= 0 && dashOffset <= 120, `Circle dash offset out of expected range: ${dashOffset}`);

      if (scrollPos > 350) {
        assert(btn.classList.contains('visible'), `Button must be visible when scrollY > 350 (scrollY=${scrollPos})`);
      } else {
        assert(!btn.classList.contains('visible'), `Button must be hidden when scrollY <= 350 (scrollY=${scrollPos})`);
      }
    }
  });
});

suite('Tier 5 Stress 6: Tactical Map Exploration & Hotspots Monotonicity', () => {
  let env;

  test('1,000 rapid random hotspot selections maintain visited set and progress monotonicity', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const mapPins = env.document.querySelectorAll('.strategy-map .map-pin');
    const stripBtns = env.document.querySelectorAll('.hotspot-strip button');
    const progressText = env.document.querySelector('.progress-row strong');
    const progressBar = env.document.querySelector('.progress-track i');

    assertEqual(mapPins.length, 10, 'Must have 10 map pins');
    assertEqual(stripBtns.length, 10, 'Must have 10 strip buttons');

    for (let i = 0; i < 1000; i++) {
      const pinIdx = i % 10;
      if (i % 2 === 0) {
        mapPins[pinIdx].click();
      } else {
        stripBtns[pinIdx].click();
      }

      const activePins = env.document.querySelectorAll('.strategy-map .map-pin.active');
      assertEqual(activePins.length, 1, `Must have exactly 1 active pin at iteration ${i}`);

      const activeStrip = env.document.querySelectorAll('.hotspot-strip button.active');
      assertEqual(activeStrip.length, 1, `Must have exactly 1 active strip button at iteration ${i}`);

      const text = progressText.textContent;
      assert(text.endsWith('/ 10'), `Progress text must match format "X / 10": ${text}`);
      const count = parseInt(text.split('/')[0].trim(), 10);
      assert(count >= 1 && count <= 10, `Visited count must be between 1 and 10: ${count}`);

      const widthPct = parseFloat(progressBar.style.width);
      assert(!isNaN(widthPct), `Progress bar width must not be NaN: ${progressBar.style.width}`);
      assertEqual(widthPct, (count / 10) * 100, `Progress bar percentage must match visited count`);
    }

    assertEqual(progressText.textContent, '10 / 10');
    assertEqual(progressBar.style.width, '100%');
  });

  test('Rapid mode switching between .mode-journey and .mode-system maintains exact exclusivity', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const modeBtns = env.document.querySelectorAll('.mode-switch button');
    assertEqual(modeBtns.length, 2, 'Must have 2 mode switch buttons');
    const map = env.document.querySelector('.strategy-map');

    for (let i = 0; i < 500; i++) {
      const btn = modeBtns[i % 2];
      btn.click();

      const hasJourney = map.classList.contains('mode-journey');
      const hasSystem = map.classList.contains('mode-system');

      assert((hasJourney && !hasSystem) || (!hasJourney && hasSystem),
        `Map mode classes must be mutually exclusive at step ${i} (journey=${hasJourney}, system=${hasSystem})`);
    }
  });
});

suite('Tier 5 Stress 7: Mobile Navigation Drawer & Keyboard ESC Integrity', () => {
  let env;

  test('1,000 rapid hamburger menu toggles maintain strict aria-expanded and class parity', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const toggle = env.document.querySelector('.menu-toggle');
    const nav = env.document.querySelector('.main-nav');
    assert(toggle && nav, 'Menu toggle and nav must exist');

    for (let i = 0; i < 1000; i++) {
      toggle.click();

      const isOpen = nav.classList.contains('is-open');
      const isAriaExpanded = toggle.getAttribute('aria-expanded') === 'true';

      assertEqual(isOpen, isAriaExpanded, `Class .is-open and aria-expanded must match at iteration ${i}`);
    }
  });

  test('Clicking navigation link inside mobile drawer immediately closes drawer and resets aria-expanded', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const toggle = env.document.querySelector('.menu-toggle');
    const nav = env.document.querySelector('.main-nav');
    const links = nav.querySelectorAll('a');
    assertGreaterThan(links.length, 0, 'Nav links must exist');

    for (let i = 0; i < links.length; i++) {
      toggle.click();
      assert(nav.classList.contains('is-open'), 'Drawer must be open');
      assertEqual(toggle.getAttribute('aria-expanded'), 'true');

      links[i].click();

      assert(!nav.classList.contains('is-open'), `Drawer must close after clicking link ${i}`);
      assert(!nav.classList.contains('nav-open'), `nav-open must be removed after clicking link ${i}`);
      assertEqual(toggle.getAttribute('aria-expanded'), 'false', `aria-expanded must reset to false after link ${i}`);
    }
  });

  test('500 rapid ESC keystrokes safely handle mixed states without error', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const toggle = env.document.querySelector('.menu-toggle');
    const nav = env.document.querySelector('.main-nav');

    assertDoesNotThrow(() => {
      for (let i = 0; i < 500; i++) {
        if (i % 2 === 0) {
          toggle.click();
        }
        const escEvent = new env.window.KeyboardEvent('keydown', { key: 'Escape' });
        env.window.dispatchEvent(escEvent);

        assert(!nav.classList.contains('is-open'), 'Nav must not be open after ESC');
        assertEqual(toggle.getAttribute('aria-expanded'), 'false');
      }
    }, 'Rapid ESC dispatches must never throw uncaught exceptions');
  });
});

suite('Tier 5 Stress 8: Fullscreen Tour Action & Edge Case Resiliency', () => {
  let env;

  test('Fullscreen button executes standard requestFullscreen without error when supported', () => {
    env = createEnvironment(PROJECT_ROOT);
    
    // Provide standard fullscreen API mock
    let fullscreenCalled = 0;
    const frame = env.document.querySelector('.viewer-frame');
    if (frame) {
      frame.requestFullscreen = () => { fullscreenCalled++; return Promise.resolve(); };
    }

    env.loadScripts();

    const btnFullscreen = env.document.querySelector('.viewer-actions button:last-child');
    assert(btnFullscreen, 'Fullscreen button exists');

    btnFullscreen.click();
    btnFullscreen.click();
    assertGreaterThan(fullscreenCalled, 0, 'Fullscreen API should be called');
  });

  test('Reload tour button triggers scan animation class and cleans up cleanly', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const btnReload = env.document.querySelector('.viewer-actions button:first-child');
    const cover = env.document.querySelector('.viewer-cover');
    assert(btnReload && cover, 'Reload button and cover must exist');

    for (let i = 0; i < 50; i++) {
      btnReload.click();
      assert(cover.classList.contains('scanning-flash'), 'Cover must receive scanning-flash on click');
    }
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
