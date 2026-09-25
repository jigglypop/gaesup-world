import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { scenarios } from './budget';

const read = (relative: string) => readFileSync(path.resolve(__dirname, relative), 'utf8');
const judged = Object.entries(scenarios).filter(([, entry]) => entry.status !== 'pending');
const suite = read('../../examples/performance/accept/suite.ts');
const inSuite = new Set([...suite.matchAll(/^ {2}'(S-B\d\d)': /gm)].map((match) => match[1]!));
const runnerOnly = new Set([...(suite.match(/RUNNER_ONLY = \[([^\]]*)\]/)?.[1] ?? '').matchAll(/'(S-B\d\d)'/g)].map((match) => match[1]!));

test('every scenario entry is well formed', () => {
  for (const [id, entry] of Object.entries(scenarios)) {
    expect([id, entry.runner]).toEqual([id, id.startsWith('S-H') ? 'headless' : 'browser']);
    expect(['green', 'known-red', 'pending']).toContain(entry.status);
    for (const limit of Object.values(entry.budget)) {
      if (limit === null || typeof limit === 'number' || typeof limit === 'boolean') continue;
      const { min, max } = limit;
      expect(min !== undefined || max !== undefined).toBe(true);
      if (min !== undefined && max !== undefined) expect(min).toBeLessThanOrEqual(max);
    }
  }
});

test('every judged headless scenario is measured by an acceptance test', () => {
  const measured = new Set(readdirSync(__dirname).filter((file) => file.endsWith('.test.ts'))
    .flatMap((file) => [...read(file).matchAll(/acceptScenario\('(S-H\d\d)'/g)].map((match) => match[1]!)));
  expect(judged.filter(([id, entry]) => entry.runner === 'headless' && !measured.has(id)).map(([id]) => id)).toEqual([]);
});

test('every judged browser scenario runs on /accept or in pnpm accept, and the suite runs only known scenarios', () => {
  expect(judged.filter(([id, entry]) => entry.runner === 'browser' && !inSuite.has(id) && !runnerOnly.has(id)).map(([id]) => id)).toEqual([]);
  expect([...inSuite, ...runnerOnly].filter((id) => !scenarios[id])).toEqual([]);
});

// Scenarios without a measurement yet stay visible in every run instead of silently missing.
for (const [id, entry] of Object.entries(scenarios)) {
  if (entry.status === 'pending') test.todo(`${id} ${entry.title} (${entry.item}, ${entry.runner})`);
}
