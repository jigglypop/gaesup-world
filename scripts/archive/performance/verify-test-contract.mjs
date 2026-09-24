import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = path.resolve('.artifacts/performance', `test-contract-${new Date().toISOString().replace(/[:.]/g, '-')}`);
mkdirSync(output, { recursive: true });
const injection = path.join(output, 'fault.cjs');
// Patch only the test process. The repository's production source stays untouched.
writeFileSync(injection, `const { MessageQueue } = require(${JSON.stringify(path.join(root, 'src/core/networks/core/MessageQueue.ts'))});\nMessageQueue.prototype.enqueue = function () { return false; };\n`);
const resultFile = path.join(output, 'jest.json');
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/jest/bin/jest.js'),
  '--runInBand', '--runTestsByPath', 'src/core/networks/core/__tests__/MessageQueue.test.ts',
  '--json', '--outputFile', resultFile, '--setupFilesAfterEnv', path.join(root, 'jest.setup.js'), injection,
], { cwd: root, encoding: 'utf8', windowsHide: true });
writeFileSync(path.join(output, 'jest.log'), result.stdout + result.stderr);
assert.equal(result.status, 1, 'The real implementation fault must fail its tests');
const report = JSON.parse(readFileSync(resultFile, 'utf8'));
assert.ok(report.numFailedTests > 0, 'A loader/config error is not a detected mutation');
assert.ok(report.numPassedTests > 0, 'Unaffected tests must still run');
writeFileSync(path.join(output, 'summary.json'), JSON.stringify({ status: 'passed', mutationDetected: true, failedTests: report.numFailedTests, passedTests: report.numPassedTests }, null, 2));
console.log(`Production MessageQueue fault detected by ${report.numFailedTests} tests: ${output}`);
