import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { scenarios, verdict, violations, type Metrics } from './budget';

const ROOT = path.resolve(__dirname, '../..');

function record(id: string, result: object): void {
  const dir = path.join(ROOT, '.artifacts/accept/headless');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, `${id}.json`), `${JSON.stringify(result, null, 2)}\n`);
}

/**
 * Registers a headless acceptance scenario. The measurement always runs, so a broken measurement fails the test
 * whatever the status. A known-red scenario is expected to exceed its budget; once it fits, the test fails and asks
 * for the status to become green, which is how progress shows up on the board.
 */
export function acceptScenario(id: string, measure: () => Metrics | Promise<Metrics>, timeout?: number): void {
  const entry = scenarios[id];
  if (!entry || entry.runner !== 'headless') throw new Error(`Unknown headless scenario: ${id}`);
  test(`${id} ${entry.title} [${entry.status}]`, async () => {
    const metrics = await measure();
    const over = violations(metrics, entry.budget);
    const result = verdict(entry.status, over);
    record(id, { id, item: entry.item, status: entry.status, verdict: result, metrics, violations: over });
    if (result === 'fixed') {
      throw new Error(`${id} now fits its budget: set its status to "green" in test/accept/budgets.json (${entry.item} landed).`);
    }
    if (result === 'fail') expect(over).toEqual([]);
  }, timeout);
}
