/**
 * TIER 3: CROSS-FEATURE COMBINATIONS TEST SUITE
 * 
 * Verifies multi-subsystem orchestration and concurrent state interactions:
 * - Audio synthesis coordination with modal lifecycle
 * - Tactical map mode switching, persistent visited pin telemetry, and progress tracking
 * - Mobile responsive drawer toggle and automatic link dismissal
 * - Global ESC key keyboard dismissals across all modal dialogs
 * - Header scroll progress bar and back-to-top synchronization
 */

'use strict';

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

suite('Tier 3: Cross-Feature — Audio & Modal Interactivity', () => {
  let env;

  test('Opening 360 panorama modal triggers audio radar effect when unmuted', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    let radarCount = 0;
    const origPlayRadar = env.window.SiteAudio.playRadar;
    env.window.SiteAudio.playRadar = () => {
      radarCount++;
      return origPlayRadar.call(env.window.SiteAudio);
    };

    const playTourBtn = env.document.querySelector('.play-tour');
    assert(playTourBtn, '.play-tour button must exist');
    playTourBtn.click();

    const panoModal = env.document.getElementById('modal-panorama-360');
    assert(panoModal, '#modal-panorama-360 must exist');
    assert(panoModal.classList.contains('modal-open'), '360 modal must be open');
    assertEqual(radarCount, 1, 'Opening tour modal must trigger playRadar once');
  });

  test('Modals open and close smoothly even when audio is muted', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    // Mute audio
    env.window.SiteAudio.toggleMute();
    assertEqual(env.window.SiteAudio.isMuted, true, 'Audio must be muted');

    const playTourBtn = env.document.querySelector('.play-tour');
    playTourBtn.click();

    const panoModal = env.document.getElementById('modal-panorama-360');
    assert(panoModal.classList.contains('modal-open'), 'Modal must still open when muted');

    // Close modal via close button
    const closeBtn = panoModal.querySelector('#close-pano-modal');
    closeBtn.click();
    assert(!panoModal.classList.contains('modal-open'), 'Modal must close smoothly when muted');
  });
});

suite('Tier 3: Cross-Feature — Tactical Map Modes, Pins & Progress', () => {
  let env;

  test('Mode switch toggles between .mode-journey and .mode-system on .strategy-map', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const strategyMap = env.document.querySelector('.strategy-map');
    assert(strategyMap, '.strategy-map must exist');
    const modeBtns = env.document.querySelectorAll('.mode-switch button');
    assertEqual(modeBtns.length, 2, 'Must have 2 mode switch buttons');

    // Button 0: Theo hành trình
    // Button 1: Theo hệ thống
    modeBtns[1].click(); // Switch to system mode
    assert(strategyMap.classList.contains('mode-system'), 'Map must have mode-system class');
    assert(!strategyMap.classList.contains('mode-journey'), 'Map must not have mode-journey class');
    assert(modeBtns[1].classList.contains('active'), 'Button 1 must be active');

    modeBtns[0].click(); // Switch back to journey mode
    assert(strategyMap.classList.contains('mode-journey'), 'Map must have mode-journey class');
    assert(!strategyMap.classList.contains('mode-system'), 'Map must not have mode-system class');
    assert(modeBtns[0].classList.contains('active'), 'Button 0 must be active');
  });

  test('Exploring tactical map pins marks visited state and updates exploration progress bar', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const mapPins = env.document.querySelectorAll('.strategy-map .map-pin');
    assertEqual(mapPins.length, 10, 'Must have 10 map pins');

    const progressBar = env.document.querySelector('.hotspot-panel .progress-track i');
    const progressText = env.document.querySelector('.hotspot-panel .progress-row strong');

    // Pin 0 (Him Lam - H01) is visited initially
    assert(mapPins[0].classList.contains('active'), 'Pin 0 should be initially active');

    // Click Pin 1 (Độc Lập - H02)
    mapPins[1].click();
    assert(mapPins[1].classList.contains('active'), 'Pin 1 must now be active');
    assert(mapPins[0].classList.contains('visited'), 'Pin 0 must now receive visited class');

    // Click Pin 2 (Mường Phăng - H03)
    mapPins[2].click();
    assert(mapPins[2].classList.contains('active'), 'Pin 2 must now be active');
    assert(mapPins[0].classList.contains('visited'), 'Pin 0 must retain visited class');
    assert(mapPins[1].classList.contains('visited'), 'Pin 1 must now receive visited class');

    // Progress counter should now be at least 3/10
    if (progressText) {
      assert(progressText.textContent.includes('3 / 10') || progressText.textContent.includes('3/10'));
    }
  });

  test('Visited pins remain marked as .visited when switching map exploration modes', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const mapPins = env.document.querySelectorAll('.strategy-map .map-pin');
    mapPins[0].click();
    mapPins[1].click();
    mapPins[2].click();

    // Verify pins 0 and 1 are visited
    assert(mapPins[0].classList.contains('visited'));
    assert(mapPins[1].classList.contains('visited'));

    // Switch map mode to system and back
    const modeBtns = env.document.querySelectorAll('.mode-switch button');
    modeBtns[1].click();
    modeBtns[0].click();

    // Verify visited classes are preserved
    assert(mapPins[0].classList.contains('visited'), 'Pin 0 must stay visited across mode changes');
    assert(mapPins[1].classList.contains('visited'), 'Pin 1 must stay visited across mode changes');
  });
});

suite('Tier 3: Cross-Feature — Mobile Navigation & Link Dismissals', () => {
  let env;

  test('Hamburger button toggles .is-open on .main-nav and updates aria-expanded attribute', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const toggleBtn = env.document.querySelector('.menu-toggle');
    const nav = env.document.querySelector('.main-nav');
    assert(toggleBtn, '.menu-toggle button must exist');
    assert(nav, '.main-nav element must exist');

    assertEqual(toggleBtn.getAttribute('aria-expanded'), 'false', 'Initial aria-expanded must be false');
    assert(!nav.classList.contains('is-open'), 'Initial nav must not be open');

    // Click hamburger to open
    toggleBtn.click();
    assert(nav.classList.contains('is-open'), 'Nav must have is-open class after toggle click');
    assertEqual(toggleBtn.getAttribute('aria-expanded'), 'true', 'aria-expanded must be true when open');

    // Click hamburger to close
    toggleBtn.click();
    assert(!nav.classList.contains('is-open'), 'Nav must not have is-open after second toggle click');
    assertEqual(toggleBtn.getAttribute('aria-expanded'), 'false', 'aria-expanded must be false when closed');
  });

  test('Clicking any navigation link inside .main-nav automatically closes mobile menu', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const toggleBtn = env.document.querySelector('.menu-toggle');
    const nav = env.document.querySelector('.main-nav');
    const navLinks = nav.querySelectorAll('a');
    assertGreaterThan(navLinks.length, 0, 'Must have links in navigation');

    // Open menu
    toggleBtn.click();
    assert(nav.classList.contains('is-open'), 'Menu must be open');

    // Click first link (#viewer)
    navLinks[0].click();
    assert(!nav.classList.contains('is-open'), 'Menu must close after clicking a navigation link');
    assertEqual(toggleBtn.getAttribute('aria-expanded'), 'false', 'aria-expanded must reset to false');
  });
});

suite('Tier 3: Cross-Feature — Global ESC Key Keyboard Dismissals', () => {
  let env;

  test('Pressing ESC closes 360 panorama modal and restores body scroll', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    // Open 360 modal
    const playTourBtn = env.document.querySelector('.play-tour');
    playTourBtn.click();
    const panoModal = env.document.getElementById('modal-panorama-360');
    assert(panoModal.classList.contains('modal-open'), 'Modal must be open');
    assertEqual(env.document.body.style.overflow, 'hidden', 'Body scroll must be locked when modal is open');

    // Press Escape
    env.window.dispatchEvent(new env.window.KeyboardEvent('keydown', { key: 'Escape' }));
    assert(!panoModal.classList.contains('modal-open'), 'Modal must be closed after pressing ESC');
    assertEqual(env.document.body.style.overflow, '', 'Body scroll must be unlocked after closing modal');
  });

  test('Pressing ESC closes STEAM lab modal and restores body scroll', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const scienceCard = env.document.querySelectorAll('.lab-grid .lab-card')[0];
    scienceCard.click();
    const steamModal = env.document.getElementById('modal-steam-lab');
    assert(steamModal.classList.contains('modal-open'), 'STEAM modal must be open');

    // Press Escape
    env.window.dispatchEvent(new env.window.KeyboardEvent('keydown', { key: 'Escape' }));
    assert(!steamModal.classList.contains('modal-open'), 'STEAM modal must be closed after pressing ESC');
  });

  test('Pressing ESC closes Route Chapter modal (Mường Phăng dossier)', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const routeBtns = env.document.querySelectorAll('.route-chapters button');
    assert(routeBtns.length > 0, 'Route buttons must exist');
    routeBtns[0].click(); // Open Mường Phăng dossier modal

    const dossierModal = env.document.getElementById('modal-muong-phang');
    assert(dossierModal, 'Dossier modal must exist');
    assert(dossierModal.classList.contains('modal-open'), 'Dossier modal must be open');

    // Press Escape
    env.window.dispatchEvent(new env.window.KeyboardEvent('keydown', { key: 'Escape' }));
    assert(!dossierModal.classList.contains('modal-open'), 'Dossier modal must be closed on ESC');
  });

  test('Pressing ESC closes open mobile navigation drawer', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const toggleBtn = env.document.querySelector('.menu-toggle');
    const nav = env.document.querySelector('.main-nav');
    toggleBtn.click();
    assert(nav.classList.contains('is-open'), 'Nav drawer must be open');

    // Press Escape
    env.window.dispatchEvent(new env.window.KeyboardEvent('keydown', { key: 'Escape' }));
    assert(!nav.classList.contains('is-open'), 'Nav drawer must be dismissed on ESC');
  });

  test('Pressing ESC when no modal or menu is open is safe and idempotent', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    // No modal open — dispatch ESC
    env.window.dispatchEvent(new env.window.KeyboardEvent('keydown', { key: 'Escape' }));
    assertEqual(env.document.body.style.overflow || '', '', 'Body scroll remains unlocked');
  });
});

suite('Tier 3: Cross-Feature — Header Scroll Progress Bar & Back-to-Top', () => {
  let env;

  test('Scrolling updates #scrollProgressBar width and displays back-to-top button', () => {
    env = createEnvironment(PROJECT_ROOT);
    env.loadScripts();

    const bar = env.document.getElementById('scrollProgressBar');
    assert(bar, '#scrollProgressBar must exist in header');
    const backToTopBtn = env.document.getElementById('backToTopBtn');
    assert(backToTopBtn, '#backToTopBtn must exist');

    // Scroll down to 400px
    env.window.scrollTo(0, 400);

    // Verify progress bar style width was calculated
    assert(bar.style.width, 'Progress bar width must be defined');
    assert(bar.style.width.endsWith('%'), 'Progress bar width must be in %');

    // Verify back-to-top visibility
    assert(backToTopBtn.classList.contains('visible'), 'Back-to-top must be visible past 350px');
  });
});
