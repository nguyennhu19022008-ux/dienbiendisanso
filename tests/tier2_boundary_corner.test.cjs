/**
 * TIER 2: BOUNDARY & CORNER CASES TEST SUITE
 * 
 * Verifies resilient operation under boundary stress, edge cases, and sandbox failures:
 * - STEAM height slider boundaries (min, max, extreme values, clamping)
 * - Storage sandbox failures (DOMException / SecurityError in private browsing)
 * - Rapid state transitions & idempotency (audio toggle stress, rapid tour switching)
 * - Boundary index lookups & navigation wrap-around
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

suite('Tier 2: Boundary & Corner — STEAM Simulation Slider Boundaries', () => {
  let env;

  test('STEAM Science drawer slider updates line-of-sight metrics accurately', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    // Open Science station (index 0)
    const scienceCard = env.document.querySelectorAll('.lab-grid .lab-card')[0];
    assert(scienceCard, 'Science card must exist');
    scienceCard.click();

    const slider = env.document.getElementById('sim-height-slider');
    assert(slider, '#sim-height-slider must exist in modal');
    assertEqual(slider.getAttribute('min'), '10', 'Min slider value must be 10');
    assertEqual(slider.getAttribute('max'), '80', 'Max slider value must be 80');

    const heightVal = env.document.getElementById('sim-height-val');
    const losKm = env.document.getElementById('sim-los-km');
    const losDeg = env.document.getElementById('sim-los-deg');
    const deadZone = env.document.getElementById('sim-dead-zone');

    // Test default value (50m)
    assertEqual(slider.value, '50', 'Default slider value should be 50');

    // Test Minimum boundary (h = 10m)
    slider.value = '10';
    slider.dispatchEvent(new DOMCustomEvent('input'));
    assertEqual(heightVal.textContent, '10 mét');
    assertEqual(losKm.textContent, (3.57 * Math.sqrt(10)).toFixed(1) + ' km'); // 11.3 km
    assertEqual(losDeg.textContent, (-0.084 * 10).toFixed(1) + '°'); // -0.8°
    assertEqual(deadZone.textContent, 'Chỉ 18% lòng chảo'); // 20 - Math.floor(10/4) = 18

    // Test Maximum boundary (h = 80m)
    slider.value = '80';
    slider.dispatchEvent(new DOMCustomEvent('input'));
    assertEqual(heightVal.textContent, '80 mét');
    assertEqual(losKm.textContent, (3.57 * Math.sqrt(80)).toFixed(1) + ' km'); // 31.9 km
    assertEqual(losDeg.textContent, (-0.084 * 80).toFixed(1) + '°'); // -6.7°
    assertEqual(deadZone.textContent, 'Chỉ 3% lòng chảo'); // clamped to Math.max(3, 0) = 3
  });

  test('STEAM calculation clamps dead zone percentage at lower bound of 3%', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const scienceCard = env.document.querySelectorAll('.lab-grid .lab-card')[0];
    scienceCard.click();
    const slider = env.document.getElementById('sim-height-slider');
    const deadZone = env.document.getElementById('sim-dead-zone');

    // Extreme high value (h = 200)
    slider.value = '200';
    slider.dispatchEvent(new DOMCustomEvent('input'));
    assertEqual(deadZone.textContent, 'Chỉ 3% lòng chảo', 'Dead zone must not drop below 3% minimum clamp');
  });

  test('STEAM calculation handles zero height boundary without producing NaN or Infinity', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const scienceCard = env.document.querySelectorAll('.lab-grid .lab-card')[0];
    scienceCard.click();
    const slider = env.document.getElementById('sim-height-slider');
    const losKm = env.document.getElementById('sim-los-km');
    const losDeg = env.document.getElementById('sim-los-deg');
    const deadZone = env.document.getElementById('sim-dead-zone');

    slider.value = '0';
    slider.dispatchEvent(new DOMCustomEvent('input'));
    assert(losDeg.textContent === '0.0°' || losDeg.textContent === '-0.0°', 'Angle at 0 must be 0.0°');
    assertEqual(deadZone.textContent, 'Chỉ 20% lòng chảo');
  });
});

suite('Tier 2: Boundary & Corner — Storage Sandbox & Failure Resilience', () => {
  test('SiteAudio.toggleMute does not throw when localStorage.setItem throws DOMException (Private Mode)', () => {
    // Instantiate environment with throwing storage
    const sandboxEnv = createEnvironment(PROJECT_ROOT, { throwOnSet: true });
    sandboxEnv.loadScripts();

    const audio = sandboxEnv.window.SiteAudio;
    assert(audio, 'SiteAudio must exist');
    const initialMute = audio.isMuted;

    // Must not throw despite localStorage.setItem failing
    let newMute;
    assertDoesNotThrow(() => {
      newMute = audio.toggleMute();
    }, 'toggleMute must swallow storage exceptions cleanly');

    // In-memory state should still successfully toggle
    assertEqual(newMute, !initialMute, 'In-memory mute flag must toggle even if persistence fails');
    assertEqual(audio.isMuted, !initialMute, 'Property isMuted must reflect new state');
  });

  test('Audio toggle button in DOM remains operational when storage access is denied', () => {
    const sandboxEnv = createEnvironment(PROJECT_ROOT, { throwOnSet: true });
    sandboxEnv.loadScripts();

    const audioBtn = sandboxEnv.document.getElementById('audio-toggle-btn');
    assert(audioBtn, '#audio-toggle-btn must exist');

    assertDoesNotThrow(() => {
      audioBtn.click();
      audioBtn.click();
      audioBtn.click();
    }, 'Clicking audio toggle in sandboxed storage must never throw uncaught exceptions');
  });
});

suite('Tier 2: Boundary & Corner — Rapid Transitions & Idempotency', () => {
  test('100 rapid sequential audio toggles maintain deterministic alternating parity', () => {
    const env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();
    const audio = env.window.SiteAudio;
    const initial = audio.isMuted;

    for (let i = 1; i <= 100; i++) {
      const state = audio.toggleMute();
      const expected = (i % 2 === 1) ? !initial : initial;
      assertEqual(state, expected, `Toggle ${i} must match parity`);
      assertEqual(audio.isMuted, expected, `isMuted property at step ${i} must match`);
    }
  });

  test('Rapid STEAM station switching reuses single modal container without DOM bloat', () => {
    const env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const labCards = env.document.querySelectorAll('.lab-grid .lab-card');
    assertEqual(labCards.length, 4, 'Must have 4 station cards');

    // Cycle through S -> T -> E -> M -> S rapidly
    labCards[0].click(); // Science
    let modal = env.document.getElementById('modal-steam-lab');
    assert(modal, 'Modal must exist');
    assert(modal.classList.contains('modal-open'), 'Modal must be open');
    assertEqual(modal.querySelector('.modal-badge').textContent, 'VẬT LÝ & ĐỊA LÝ QUÂN SỰ');

    labCards[1].click(); // Technology
    assertEqual(modal.querySelector('.modal-badge').textContent, 'CÔNG NGHỆ THÔNG TIN & TRẮC ĐỊA');

    labCards[2].click(); // Engineering
    assertEqual(modal.querySelector('.modal-badge').textContent, 'KỸ THUẬT XÂY DỰNG & ĐỘNG LỰC HỌC');

    labCards[3].click(); // Math
    assertEqual(modal.querySelector('.modal-badge').textContent, 'TOÁN THỐNG KÊ & TÍNH TOÁN NĂNG LƯỢNG');

    labCards[0].click(); // Back to Science
    assertEqual(modal.querySelector('.modal-badge').textContent, 'VẬT LÝ & ĐỊA LÝ QUÂN SỰ');

    // Ensure exactly ONE instance of modal-steam-lab exists in DOM
    const allSteamModals = env.document.querySelectorAll('#modal-steam-lab');
    assertEqual(allSteamModals.length, 1, 'Only one modal-steam-lab element should ever exist in DOM');
  });

  test('Rapid tour card selection updates active highlight state idempotently', () => {
    const env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const tourCards = env.document.querySelectorAll('.tour-rail .tour-card');
    assertGreaterThan(tourCards.length, 0, 'Tour cards must exist in rail');

    // Click cards in sequence and verify only one card is active at a time
    for (let i = 0; i < tourCards.length; i++) {
      tourCards[i].click();
      const activeCards = env.document.querySelectorAll('.tour-rail .tour-card.active');
      assertEqual(activeCards.length, 1, `Exactly 1 card must be active after clicking card ${i}`);
      assertEqual(activeCards[0], tourCards[i], `Clicked card ${i} must be the active one`);
    }
  });
});

suite('Tier 2: Boundary & Corner — Tour Stepper Wrap-Around & Boundary Navigation', () => {
  test('Tour stepper previous button from Tour 1 wraps around to Tour 8 (modulo ring)', () => {
    const env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const btnPrev = env.document.querySelector('.tour-stepper button[aria-label="Tour trước"]');
    const btnNext = env.document.querySelector('.tour-stepper button[aria-label="Tour tiếp theo"]');
    assert(btnPrev, 'Tour previous button must exist');
    assert(btnNext, 'Tour next button must exist');

    // Select Tour 1 (index 0) first
    const tourCards = env.document.querySelectorAll('.tour-rail .tour-card');
    tourCards[0].click();

    // Click prev -> should wrap to last tour (index 7)
    btnPrev.click();
    let activeCards = env.document.querySelectorAll('.tour-rail .tour-card.active');
    assertEqual(activeCards.length, 1);
    assertEqual(activeCards[0], tourCards[7], 'Previous from Tour 1 must wrap to Tour 8');

    // Click next -> should wrap forward to Tour 1 (index 0)
    btnNext.click();
    activeCards = env.document.querySelectorAll('.tour-rail .tour-card.active');
    assertEqual(activeCards.length, 1);
    assertEqual(activeCards[0], tourCards[0], 'Next from Tour 8 must wrap to Tour 1');
  });
});
