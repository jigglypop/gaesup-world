import { readFileSync } from 'node:fs';
import path from 'node:path';

import { scenarios } from './scenario';

const verification = readFileSync(path.resolve(__dirname, '../../prd/01-verification.md'), 'utf8');

test('the budget file lists exactly the scenarios the verification PRD defines', () => {
  const defined = [...verification.matchAll(/^\| (S-[HB]\d\d) \|/gm)].map((match) => match[1]).sort();
  expect(Object.keys(scenarios).sort()).toEqual(defined);
});

// Scenarios without a measurement yet stay visible in every run instead of silently missing.
for (const [id, entry] of Object.entries(scenarios)) {
  if (entry.runner === 'headless' && entry.status === 'pending') test.todo(`${id} ${entry.title} (${entry.item})`);
}
