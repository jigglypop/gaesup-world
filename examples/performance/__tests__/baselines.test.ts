import * as fs from 'fs';
import * as path from 'path';

import { baselineScenarios } from '../baselines';

type StoredRun = { runId: string; scenarioId: string };

const DIRECTORY = path.join(__dirname, '../baselines');
const stored = fs.readdirSync(DIRECTORY).filter((name) => name.endsWith('.json')).map((name) => ({
  file: name.replace(/\.json$/, ''),
  runs: (JSON.parse(fs.readFileSync(path.join(DIRECTORY, name), 'utf8')) as { runs: StoredRun[] }).runs,
}));
const sorted = (ids: Iterable<string>) => [...new Set(ids)].sort();

test('the lazy loader lists every bundle with exactly the scenarios of its runs', () => {
  expect(Object.fromEntries(stored.map(({ file, runs }) => [file, sorted(runs.map((run) => run.scenarioId))])))
    .toEqual(Object.fromEntries(Object.entries(baselineScenarios).map(([file, ids]) => [file, sorted(ids)])));
});
