import { readFileSync } from 'node:fs';
import path from 'node:path';

import { scenarios } from './budget';
import { parseMilestones } from '../../examples/performance/accept/milestones';


const verification = readFileSync(path.resolve(__dirname, '../../prd/01-verification.md'), 'utf8');

test('the budget file lists exactly the scenarios the verification PRD defines', () => {
  const defined = [...verification.matchAll(/^\| (S-[HB]\d\d) \|/gm)].map((match) => match[1]).sort();
  expect(Object.keys(scenarios).sort()).toEqual(defined);
});

test('the /accept milestone checklist parses every milestone of the verification PRD with known scenarios', () => {
  const milestones = parseMilestones(verification);
  expect(milestones.map((milestone) => milestone.id)).toEqual(['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6']);
  for (const milestone of milestones) {
    expect(milestone.scenarios.length).toBeGreaterThan(0);
    for (const id of milestone.scenarios) expect(scenarios).toHaveProperty([id]);
  }
});

// Scenarios without a measurement yet stay visible in every run instead of silently missing.
for (const [id, entry] of Object.entries(scenarios)) {
  if (entry.runner === 'headless' && entry.status === 'pending') test.todo(`${id} ${entry.title} (${entry.item})`);
}
