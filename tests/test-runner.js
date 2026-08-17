/**
 * Minimal dependency-free test runner: no npm, no globals beyond what tests import.
 * Usage: register suites with describe/it, then call run() and report(results).
 */
const suites = [];

export function describe(name, body) {
  const tests = [];
  suites.push({ name, tests });
  body((testName, fn) => tests.push({ name: testName, fn }));
}

export function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      (message || 'Assertion failed') + `: expected ${expected}, got ${actual}`,
    );
  }
}

export function run() {
  const results = [];
  for (const suite of suites) {
    for (const test of suite.tests) {
      try {
        test.fn();
        results.push({ suite: suite.name, name: test.name, passed: true });
      } catch (error) {
        results.push({
          suite: suite.name,
          name: test.name,
          passed: false,
          error: error.message,
        });
      }
    }
  }
  return results;
}

export function report(results, container) {
  const failed = results.filter((result) => !result.passed);
  const summary = `${results.length - failed.length}/${results.length} passing`;

  for (const result of results) {
    const line = `${result.passed ? 'PASS' : 'FAIL'} ${result.suite} — ${result.name}` +
      (result.passed ? '' : `\n  ${result.error}`);
    if (result.passed) console.log(line);
    else console.error(line);
  }
  console.log(summary);

  if (container) {
    container.textContent = '';
    const heading = document.createElement('p');
    heading.className = failed.length === 0 ? 'summary pass' : 'summary fail';
    heading.textContent = summary;
    container.appendChild(heading);
    const list = document.createElement('ul');
    for (const result of results) {
      const item = document.createElement('li');
      item.className = result.passed ? 'pass' : 'fail';
      item.textContent = `${result.suite} — ${result.name}`;
      if (!result.passed) item.textContent += `: ${result.error}`;
      list.appendChild(item);
    }
    container.appendChild(list);
  }

  return failed.length === 0;
}
