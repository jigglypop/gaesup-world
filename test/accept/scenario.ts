import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export type Metrics = Record<string, number | boolean>;
export type Budget = Record<string, number | boolean | null>;
export type ScenarioStatus = 'green' | 'known-red' | 'pending';
export type ScenarioEntry = {
  title: string;
  runner: 'headless' | 'browser';
  item: string;
  status: ScenarioStatus;
  budget: Budget;
};

const ROOT = path.resolve(__dirname, '../..');

export const scenarios: Readonly<Record<string, ScenarioEntry>> = JSON.parse(
  readFileSync(path.join(__dirname, 'budgets.json'), 'utf8'),
).scenarios;

/** Budget violations: numbers are upper bounds, booleans must match, null is only recorded. */
export function violations(metrics: Metrics, budget: Budget): string[] {
  const found: string[] = [];
  for (const [name, limit] of Object.entries(budget)) {
    if (limit === null) continue;
    const value = metrics[name];
    if (value === undefined) found.push(`${name}: not measured`);
    else if (typeof limit === 'boolean' ? value !== limit : typeof value !== 'number' || value > limit) {
      found.push(`${name}: ${String(value)} (budget ${String(limit)})`);
    }
  }
  return found;
}

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
    record(id, { id, item: entry.item, status: entry.status, pass: over.length === 0, metrics, violations: over });
    if (entry.status === 'known-red') {
      if (over.length === 0) {
        throw new Error(`${id} now fits its budget: set its status to "green" in test/accept/budgets.json (${entry.item} landed).`);
      }
      return;
    }
    expect(over).toEqual([]);
  }, timeout);
}
