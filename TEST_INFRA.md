# TEST INFRASTRUCTURE — ĐIỆN BIÊN 3D STEAM HERITAGE LAB

**System**: Dual-Track Opaque-Box Automated Testing Framework  
**Author**: `test_writer_e2e_1` (E2E Testing Track)  
**Execution Environment**: Node.js (v18+ compatible, native v24 tested)  
**Dependencies**: **Zero** external npm dependencies (pure standard Node.js APIs)  

---

## 1. Testing Methodology & Philosophy

The test infrastructure for the **Điện Biên 3D — STEAM Heritage Lab** web application is built upon **Opaque-Box Verification** principles:
1. **Behavior-Based, Not Implementation-Biased**: Tests exercise the observable public contracts, DOM mutations, accessibility attributes, visual class updates, and audio synthesis triggers without modifying production source code or testing internal private variables.
2. **Zero-Dependency Resilience**: The test runner and DOM emulation harness run directly in any standard Node.js runtime without requiring `npm install`, headless Chrome/Puppeteer downloads, or network connectivity. This guarantees immediate, repeatable execution in CI/CD pipelines, air-gapped environments, and local dev environments.
3. **Dual-Track Isolation**: Production source code is owned by the Implementation Track (`worker_impl_1`), while the `tests/` directory is exclusively owned and governed by the E2E Testing Track (`test_writer_e2e_1`). Tests act as an authoritative oracle validating all project acceptance criteria.
4. **Adversarial & Boundary Verification**: The test suites rigorously test extreme slider values (0m to 200m), storage exceptions (private browsing / iframe sandboxes), rapid clicking (100 sequential audio toggles), keyboard dismissals, and touch gestures.

---

## 2. Test Architecture

```
tests/
├── run_all_tests.cjs                 # Master CLI Test Runner
├── helpers/
│   ├── test_runner.cjs               # Lightweight test framework (suite, test, assert, reporters)
│   └── dom_harness.cjs               # Opaque-box DOM & browser environment simulator
├── tier1_feature_coverage.test.cjs   # Tier 1: Foundational Technical Integrity
├── tier2_boundary_corner.test.cjs    # Tier 2: Boundary Stress & Sandbox Resilience
├── tier3_cross_feature.test.cjs      # Tier 3: Subsystem Interactivity & ESC Dismissals
└── tier4_real_world_scenarios.test.cjs # Tier 4: Student Journeys & Compliance Audits
```

### Component Details:
- **`run_all_tests.cjs`**: Dispatches test suites across all 4 tiers, parses CLI arguments (e.g. `--tier=1`, `--verbose`), aggregates assertion timings, formats ANSI color reports, and exits with code `0` on success or code `1` on failure.
- **`helpers/test_runner.cjs`**: Provides `suite()`, `test()`, `beforeEach()`, `afterEach()`, and rich assertion utilities: `assert()`, `assertEqual()`, `assertNotEqual()`, `assertDeepEqual()`, `assertIncludes()`, `assertThrows()`, `assertDoesNotThrow()`, `assertGreaterThan()`.
- **`helpers/dom_harness.cjs`**: Parses `index.html` into a full live DOM tree with `DOMElement`, `classList`, `attributes`, `style`, `dataset`, `querySelector`/`querySelectorAll` (supporting tag, ID, class, attributes with quotes/spaces, child and descendant combinators), `addEventListener`, `dispatchEvent`, `Event`/`MouseEvent`/`TouchEvent`/`KeyboardEvent`, `MockAudioContext`, `MockLocalStorage` (with configurable `DOMException` error throwing), and script sandboxing via Node's `vm` module.

---

## 3. Four-Tier Test Suite Specification

### Tier 1: Feature Coverage (14 Tests)
- **Syntax Integrity**: `assets/site_data.js`, `assets/site_audio.js`, and `assets/interactive_engine.js` pass `node -c` without syntax errors.
- **Physical Assets**: All 6 archival WebP images (`images/*.webp`) verified on disk with valid `RIFF/WEBP` headers and non-zero sizes; `favicon.svg` verified with valid XML; base and interactive CSS stylesheets verified.
- **Document Anchors**: All in-page navigation anchors (`#top`, `#viewer`, `#route`, `#map`, `#steam`) match existing section IDs in `index.html`.
- **Data Contracts**: `TOURS_DATA` (8 tours with complete metadata, 3D links, viewpoints) and `HOTSPOTS_DATA` (10 tactical positions with normalized coordinates in `[0, 100]%` and existing image targets).
- **Audio Synthesizer Contract**: `SiteAudio` exports `playClick()`, `playRadar()`, `playWhoosh()`, `playSuccess()`, `toggleMute()`, and `isMuted` using pure Web Audio API oscillator synthesis.

### Tier 2: Boundary & Corner Cases (9 Tests)
- **STEAM Slider Mathematical Invariants**: Verifies line-of-sight formula $d \approx 3.57 \times \sqrt{h}$ and depression angle calculation at minimum bound ($h = 10\text{m}$), default ($h = 50\text{m}$), maximum ($h = 80\text{m}$), and zero/extreme boundaries. Verifies dead zone percentage clamps to minimum 3%.
- **Storage Sandbox Failures**: Simulates `localStorage.setItem` throwing `DOMException` (e.g., iOS Safari Private Mode, cross-origin sandboxed iframes). Verifies `SiteAudio.toggleMute()` catches storage exceptions safely, preserves in-memory mute state, and keeps audio toggle UI responsive.
- **Rapid State Transitions & Idempotency**: 100 rapid sequential audio toggles verify deterministic parity without state drift; rapid STEAM station switching (S → T → E → M → S) reuses a single modal container without DOM bloat.
- **Tour Stepper Modulo Wrap-Around**: Previous button from Tour 1 wraps around to Tour 8; Next button from Tour 8 wraps around to Tour 1.

### Tier 3: Cross-Feature Combinations (13 Tests)
- **Audio & Modal Coordination**: Opening 360 panorama modal triggers `SiteAudio.playRadar()` effect; modal interaction remains 100% operational when muted.
- **Tactical Map Modes & Persistent Progress**: Switching between `.mode-journey` and `.mode-system` toggles visual map classes; exploring pins progressively applies `.visited` class (green highlight) to past pins; visited status persists across mode switches.
- **Mobile Navigation Drawer**: Hamburger button toggles `.is-open` and `aria-expanded` ("true"/"false"); clicking any navigation link automatically dismisses the menu drawer.
- **Global Keyboard ESC Dismissal**: Pressing `Escape` closes open 360 panorama modal, STEAM lab modal, Route chapter dossiers, and mobile navigation drawer, and restores body scroll (`overflow = ''`). ESC key is idempotent when no overlay is open.
- **Header Scroll Progress Bar**: Scrolling window updates `#scrollProgressBar` width from `0%` to `100%` and unhides the floating Back-to-Top HUD button.

### Tier 4: Real-World Application Scenarios (5 Tests)
- **Full Student Learning Journey**: Simulates a complete visitor path: Arrive at `#top` → select Tour 2 (Đồi A1) → open 360 panorama modal → perform touch panning and zoom → close modal via ESC → open Campaign dossier → explore all 10 tactical hotspots on the map → verify `SiteAudio.playSuccess()` celebration sound chord upon reaching 10/10 → open STEAM lab station S and adjust slider → close via backdrop click → click Back-to-Top button to return to top.
- **Historical Researcher Discovery**: Filters 3D tours by category ("Chiến trường"); verifies that non-matching tour cards are hidden (`display: none`) and matching cards remain visible.
- **User Directives Compliance ("BỎ SLIDE 0")**: Verifies `#slide0-overlay` is completely omitted (0 occurrences in DOM); verifies no `lock-scroll` on body at initial load; verifies site opens directly into `#top`.
- **Footer Copyright Pill**: Verifies `.footer-copyright-pill` exists with required author attribution ("DESIGN BY VUONGGIA"), copyright year 2026, and responsive flex wrapping.
- **Accessibility & SVG Iconography**: Strict audit confirming zero raw emoji characters are used as icons in `index.html` or script files (100% vector SVGs).

---

## 4. Feature Inventory & Test Mapping Table

| # | Feature / Contract | Milestones | Primary Test Tier | Test File |
|---|--------------------|------------|-------------------|-----------|
| 1 | Node.js Syntax Integrity | M1 | Tier 1 | `tests/tier1_feature_coverage.test.cjs` |
| 2 | Physical Assets & SVGs | M1 | Tier 1 | `tests/tier1_feature_coverage.test.cjs` |
| 3 | Navigation Anchors | M1 | Tier 1 | `tests/tier1_feature_coverage.test.cjs` |
| 4 | TOURS_DATA (8 Tours) | M1 | Tier 1 | `tests/tier1_feature_coverage.test.cjs` |
| 5 | HOTSPOTS_DATA (10 Points) | M1 | Tier 1 | `tests/tier1_feature_coverage.test.cjs` |
| 6 | Web Audio Synthesizer API | M1 | Tier 1 | `tests/tier1_feature_coverage.test.cjs` |
| 7 | STEAM Slider Math Boundaries | M1, M2 | Tier 2 | `tests/tier2_boundary_corner.test.cjs` |
| 8 | Storage Sandbox Resilience | M2 | Tier 2 | `tests/tier2_boundary_corner.test.cjs` |
| 9 | Rapid Toggle Idempotency | M2 | Tier 2 | `tests/tier2_boundary_corner.test.cjs` |
| 10 | Tour Stepper Wrap-Around | M1, M2 | Tier 2 | `tests/tier2_boundary_corner.test.cjs` |
| 11 | Audio & Modal Coordination | M1, M2 | Tier 3 | `tests/tier3_cross_feature.test.cjs` |
| 12 | Map Modes & Visited Pins | M1, M2 | Tier 3 | `tests/tier3_cross_feature.test.cjs` |
| 13 | Mobile Menu & Link Dismissal | M1 | Tier 3 | `tests/tier3_cross_feature.test.cjs` |
| 14 | Global ESC Key Dismissals | M1 | Tier 3 | `tests/tier3_cross_feature.test.cjs` |
| 15 | Header Scroll Progress Bar | M2 | Tier 3 | `tests/tier3_cross_feature.test.cjs` |
| 16 | Full Student Learning Path | M3 | Tier 4 | `tests/tier4_real_world_scenarios.test.cjs` |
| 17 | Researcher Category Filters | M3 | Tier 4 | `tests/tier4_real_world_scenarios.test.cjs` |
| 18 | User Directive "BỎ SLIDE 0" | M1, M2, M3 | Tier 4 | `tests/tier4_real_world_scenarios.test.cjs` |
| 19 | Footer Copyright Pill | M2, M3 | Tier 4 | `tests/tier4_real_world_scenarios.test.cjs` |
| 20 | Zero-Emoji SVG Iconography | M1, M3 | Tier 4 | `tests/tier4_real_world_scenarios.test.cjs` |

---

## 5. How to Run the Tests

### Run Full Test Suite (All 4 Tiers — 41 Tests):
```bash
node tests/run_all_tests.cjs
```

### Run an Individual Tier:
```bash
node tests/run_all_tests.cjs --tier=1   # Feature Coverage only
node tests/run_all_tests.cjs --tier=2   # Boundary & Corner only
node tests/run_all_tests.cjs --tier=3   # Cross-Feature only
node tests/run_all_tests.cjs --tier=4   # Real-World Scenarios only
```

### Run with Verbose Stack Traces:
```bash
node tests/run_all_tests.cjs --verbose
```

### Expected Output:
```
Total Tests:    41
Passed:         41
Failed:         0
Total Duration: ~1000ms
```
Exits with return code `0`.
