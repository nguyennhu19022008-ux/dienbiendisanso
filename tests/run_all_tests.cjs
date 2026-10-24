/**
 * MASTER AUTOMATED E2E & OPAQUE-BOX TEST RUNNER
 * 
 * Executes all 4 Tiers of automated test suites:
 * - Tier 1: Feature Coverage (Syntax, Assets, Anchors, Schema, Audio API)
 * - Tier 2: Boundary & Corner Cases (STEAM slider, Storage sandbox, Rapid toggles, Navigation bounds)
 * - Tier 3: Cross-Feature Combinations (Audio & Modals, Map modes & pins, Mobile nav, ESC key, Header progress)
 * - Tier 4: Real-World Scenarios (Student learning journey, Researcher discovery, User Directives & Copyright)
 * 
 * Usage:
 *   node tests/run_all_tests.cjs
 *   node tests/run_all_tests.cjs --tier=1
 *   node tests/run_all_tests.cjs --verbose
 */

'use strict';

const path = require('path');
const { runSuites, colors } = require('./helpers/test_runner.cjs');

// Parse CLI arguments
const args = process.argv.slice(2);
const tierArg = args.find(a => a.startsWith('--tier='));
const selectedTier = tierArg ? parseInt(tierArg.split('=')[1], 10) : null;
const isVerbose = args.includes('--verbose') || args.includes('-v');

console.log(`${colors.bold}${colors.cyan}`);
console.log(`╔════════════════════════════════════════════════════════════════════════╗`);
console.log(`║           ĐIỆN BIÊN 3D STEAM HERITAGE LAB — E2E TEST SUITE             ║`);
console.log(`║                  Dual-Track Opaque-Box Test System                     ║`);
console.log(`╚════════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

// Conditionally load requested tiers or all tiers
if (!selectedTier || selectedTier === 1) {
  require('./tier1_feature_coverage.test.cjs');
}
if (!selectedTier || selectedTier === 2) {
  require('./tier2_boundary_corner.test.cjs');
}
if (!selectedTier || selectedTier === 3) {
  require('./tier3_cross_feature.test.cjs');
}
if (!selectedTier || selectedTier === 4) {
  require('./tier4_real_world_scenarios.test.cjs');
}
if (!selectedTier || selectedTier === 5) {
  require('./tier5_adversarial_stress.test.cjs');
  require('./tier5_challenger_final_empirical.test.cjs');
}

// Execute the test suites
(async () => {
  try {
    const result = await runSuites({ verbose: isVerbose });
    if (result.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error(`${colors.red}Fatal error during test run:${colors.reset}`, err);
    process.exit(1);
  }
})();
