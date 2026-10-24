/**
 * Lightweight, zero-dependency Test Runner & Assertion Library for Node.js
 * Provides formatted colored output, asynchronous lifecycle hooks,
 * granular assertions, and exit-code reporting.
 */

'use strict';

const isTTY = process.stdout.isTTY;
const colors = {
  reset: isTTY ? '\x1b[0m' : '',
  bold: isTTY ? '\x1b[1m' : '',
  dim: isTTY ? '\x1b[2m' : '',
  green: isTTY ? '\x1b[32m' : '',
  red: isTTY ? '\x1b[31m' : '',
  yellow: isTTY ? '\x1b[33m' : '',
  cyan: isTTY ? '\x1b[36m' : '',
  magenta: isTTY ? '\x1b[35m' : '',
  gray: isTTY ? '\x1b[90m' : ''
};

class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

const assert = (condition, message = 'Assertion failed') => {
  if (!condition) {
    throw new AssertionError(message, condition, true);
  }
};

const assertEqual = (actual, expected, message) => {
  if (actual !== expected) {
    const msg = message || `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`;
    throw new AssertionError(msg, actual, expected);
  }
};

const assertNotEqual = (actual, expected, message) => {
  if (actual === expected) {
    const msg = message || `Expected ${JSON.stringify(actual)} NOT to equal ${JSON.stringify(expected)}`;
    throw new AssertionError(msg, actual, expected);
  }
};

const assertDeepEqual = (actual, expected, message) => {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    const msg = message || `Deep equality mismatch:\n  Actual:   ${actualStr}\n  Expected: ${expectedStr}`;
    throw new AssertionError(msg, actual, expected);
  }
};

const assertIncludes = (haystack, needle, message) => {
  if (typeof haystack === 'string') {
    if (!haystack.includes(needle)) {
      throw new AssertionError(message || `Expected string to include "${needle}"`, haystack, needle);
    }
  } else if (Array.isArray(haystack)) {
    if (!haystack.includes(needle)) {
      throw new AssertionError(message || `Expected array to include item ${JSON.stringify(needle)}`, haystack, needle);
    }
  } else if (haystack && typeof haystack === 'object') {
    if (!(needle in haystack)) {
      throw new AssertionError(message || `Expected object to have key "${needle}"`, haystack, needle);
    }
  } else {
    throw new AssertionError(message || `Expected ${haystack} to include ${needle}`, haystack, needle);
  }
};

const assertMatches = (str, regex, message) => {
  if (!regex.test(str)) {
    throw new AssertionError(message || `Expected "${str}" to match regex ${regex}`, str, regex);
  }
};

const assertThrows = (fn, expectedError, message) => {
  let threw = false;
  let thrownError = null;
  try {
    fn();
  } catch (err) {
    threw = true;
    thrownError = err;
  }
  if (!threw) {
    throw new AssertionError(message || 'Expected function to throw an error, but it did not', null, expectedError);
  }
  if (expectedError) {
    if (typeof expectedError === 'function') {
      if (!(thrownError instanceof expectedError)) {
        throw new AssertionError(message || `Expected error of type ${expectedError.name}, got ${thrownError.name}`, thrownError, expectedError);
      }
    } else if (expectedError instanceof RegExp) {
      if (!expectedError.test(thrownError.message)) {
        throw new AssertionError(message || `Expected error message to match ${expectedError}, got "${thrownError.message}"`, thrownError.message, expectedError);
      }
    } else if (typeof expectedError === 'string') {
      if (!thrownError.message.includes(expectedError)) {
        throw new AssertionError(message || `Expected error message to include "${expectedError}", got "${thrownError.message}"`, thrownError.message, expectedError);
      }
    }
  }
};

const assertDoesNotThrow = (fn, message) => {
  try {
    fn();
  } catch (err) {
    throw new AssertionError(message || `Expected function not to throw, but it threw: ${err.message}`, err, null);
  }
};

const assertGreaterThan = (a, b, message) => {
  if (!(a > b)) {
    throw new AssertionError(message || `Expected ${a} > ${b}`, a, b);
  }
};

const assertLessThan = (a, b, message) => {
  if (!(a < b)) {
    throw new AssertionError(message || `Expected ${a} < ${b}`, a, b);
  }
};

// Test Suite Management
const suites = [];
let currentSuite = null;

function suite(name, fn) {
  const s = {
    name,
    tests: [],
    beforeEachFns: [],
    afterEachFns: [],
    beforeAllFns: [],
    afterAllFns: []
  };
  suites.push(s);
  const prev = currentSuite;
  currentSuite = s;
  try {
    fn();
  } finally {
    currentSuite = prev;
  }
}

function test(name, fn) {
  if (!currentSuite) {
    suite('Default Suite', () => {
      currentSuite.tests.push({ name, fn });
    });
  } else {
    currentSuite.tests.push({ name, fn });
  }
}

function beforeEach(fn) {
  if (currentSuite) currentSuite.beforeEachFns.push(fn);
}

function afterEach(fn) {
  if (currentSuite) currentSuite.afterEachFns.push(fn);
}

function beforeAll(fn) {
  if (currentSuite) currentSuite.beforeAllFns.push(fn);
}

function afterAll(fn) {
  if (currentSuite) currentSuite.afterAllFns.push(fn);
}

async function runSuites(options = {}) {
  const startTime = Date.now();
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const failures = [];

  const silent = !!options.silent;

  if (!silent) {
    console.log(`\n${colors.bold}${colors.cyan}======================================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}  DIEN BIEN 3D STEAM HERITAGE LAB — AUTOMATED E2E TEST RUNNER${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}\n`);
  }

  for (const s of suites) {
    if (!silent) {
      console.log(`${colors.bold}${colors.magenta}▶ Suite: ${s.name}${colors.reset}`);
    }

    for (const bAll of s.beforeAllFns) {
      await bAll();
    }

    for (const t of s.tests) {
      totalTests++;
      const testStart = Date.now();

      for (const bEach of s.beforeEachFns) {
        await bEach();
      }

      let error = null;
      try {
        await t.fn();
        passedTests++;
        const duration = Date.now() - testStart;
        if (!silent) {
          console.log(`  ${colors.green}✓${colors.reset} ${t.name} ${colors.gray}(${duration}ms)${colors.reset}`);
        }
      } catch (err) {
        failedTests++;
        error = err;
        const duration = Date.now() - testStart;
        if (!silent) {
          console.log(`  ${colors.red}✗${colors.reset} ${t.name} ${colors.gray}(${duration}ms)${colors.reset}`);
          console.log(`    ${colors.red}${err.message}${colors.reset}`);
          if (err.stack && options.verbose) {
            console.log(`    ${colors.dim}${err.stack.split('\n').slice(1, 4).join('\n    ')}${colors.reset}`);
          }
        }
        failures.push({ suite: s.name, test: t.name, error: err });
      }

      for (const aEach of s.afterEachFns) {
        try {
          await aEach();
        } catch (err) {
          console.error('Error in afterEach:', err);
        }
      }
    }

    for (const aAll of s.afterAllFns) {
      try {
        await aAll();
      } catch (err) {
        console.error('Error in afterAll:', err);
      }
    }

    if (!silent) console.log('');
  }

  const totalDuration = Date.now() - startTime;

  if (!silent) {
    console.log(`${colors.bold}----------------------------------------------------------------------${colors.reset}`);
    console.log(`${colors.bold}TEST RUN SUMMARY:${colors.reset}`);
    console.log(`  Total Tests:    ${colors.bold}${totalTests}${colors.reset}`);
    console.log(`  Passed:         ${colors.green}${colors.bold}${passedTests}${colors.reset}`);
    console.log(`  Failed:         ${failedTests > 0 ? colors.red : colors.gray}${colors.bold}${failedTests}${colors.reset}`);
    console.log(`  Total Duration: ${colors.dim}${totalDuration}ms${colors.reset}`);
    console.log(`${colors.bold}----------------------------------------------------------------------${colors.reset}`);

    if (failedTests > 0) {
      console.log(`\n${colors.red}${colors.bold}FAILURES (${failedTests}):${colors.reset}`);
      failures.forEach((f, idx) => {
        console.log(`  ${idx + 1}) [${f.suite}] ${f.test}:`);
        console.log(`     ${f.error.message}\n`);
      });
    } else {
      console.log(`\n${colors.green}${colors.bold}🎉 ALL ${totalTests} TESTS PASSED SUCCESSFULLY!${colors.reset}\n`);
    }
  }

  return {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    duration: totalDuration,
    failures
  };
}

function resetSuites() {
  suites.length = 0;
  currentSuite = null;
}

module.exports = {
  suite,
  test,
  describe: suite,
  it: test,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  assert,
  assertEqual,
  assertNotEqual,
  assertDeepEqual,
  assertIncludes,
  assertMatches,
  assertThrows,
  assertDoesNotThrow,
  assertGreaterThan,
  assertLessThan,
  runSuites,
  resetSuites,
  colors
};
