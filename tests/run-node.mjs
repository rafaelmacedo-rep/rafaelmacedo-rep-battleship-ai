/**
 * Runs the same suites as tests/tests.html, without a browser or any dependencies:
 *   node tests/run-node.mjs
 */
import { run, report } from './test-runner.js';
import './board.test.js';
import './game.test.js';
import './ai.test.js';

process.exit(report(run()) ? 0 : 1);
