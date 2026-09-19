import { comparisonProblems, DEFAULT_CONFIG, improvementPercent, parseRun, repetitionSummary, summarize, type LabRun } from '../model';

function run(): LabRun {
  return {
    schemaVersion: 1, runId: 'test', scenarioId: 'metrics', scenarioVersion: 1,
    requirementIds: ['R14'], role: 'baseline', kind: 'performance', status: 'passed',
    config: { ...DEFAULT_CONFIG },
    source: { commit: 'a'.repeat(40), contentHash: 'b'.repeat(64), lockfileHash: null, dirty: true, manifest: [], versions: { three: '0.185.0' }, host: { cpu: 'test', platform: 'test', node: 'test' } },
    environment: { userAgent: 'test', hardwareConcurrency: 4, deviceMemory: null, backend: 'webgpu', adapter: 'test', gpuClass: 'hardware', foreground: true },
    startedAt: '2026-09-19T00:00:00Z', endedAt: '2026-09-19T00:00:40Z',
    metrics: { cpu: summarize([8, 10, 12], 'ms', 'cpu-render-call') },
    assertions: [{ id: 'draws', expected: 1, actual: 1, pass: true }], errors: [], unsupportedReasons: [],
  };
}

it('round trips physical world speed with its unit and recomputes numeric aggregates', () => {
  const saved = run(); saved.metrics['speed'] = summarize([5, 10], 'world/s', 'rapier-linear-velocity');
  const restored = parseRun(JSON.parse(JSON.stringify(saved)));
  expect(restored.metrics['speed']).toMatchObject({ unit: 'world/s', samples: [5, 10], p50: 5 });
});

it('round trips raw samples and recomputes untrusted aggregates', () => {
  const saved = run(); saved.metrics['cpu']!.p95 = 999;
  const restored = parseRun(JSON.parse(JSON.stringify(saved)));
  expect(restored.metrics['cpu']!.p95).toBe(12);
  expect(restored.metrics['cpu']!.samples).toEqual([8, 10, 12]);
});

it('distinguishes unsupported metrics from real zero and rejects contradictory success', () => {
  expect(summarize([], 'ms', 'gpu').p95).toBeNull();
  expect(summarize([0], 'count', 'errors').p95).toBe(0);
  const broken = run(); broken.assertions[0]!.pass = false;
  expect(() => parseRun(broken)).toThrow('모순');
  expect(() => parseRun({ ...run(), schemaVersion: 2 })).toThrow('schema');
  expect(() => summarize([Number.NaN], 'ms', 'bad')).toThrow();
});

it('allows source changes but refuses unmatched environments, failures and short diagnostics', () => {
  const baseline = run(); const candidate = run(); candidate.role = 'candidate';
  candidate.source.contentHash = 'c'.repeat(64);
  candidate.metrics['cpu'] = summarize([6, 7, 9], 'ms', 'cpu-render-call');
  expect(improvementPercent(baseline, candidate, 'cpu')).toBe(25);
  candidate.config.count++;
  expect(improvementPercent(baseline, candidate, 'cpu')).toBeNull();
  candidate.config.count--;
  candidate.status = 'failed';
  expect(improvementPercent(baseline, candidate, 'cpu')).toBeNull();
  candidate.status = 'passed'; candidate.kind = 'diagnostic';
  expect(improvementPercent(baseline, candidate, 'cpu')).toBeNull();
});

it('compares imported object keys independent of JSON insertion order', () => {
  const baseline = run(); const candidate = run(); candidate.role = 'candidate';
  candidate.config = Object.fromEntries(Object.entries(candidate.config).reverse()) as typeof candidate.config;
  expect(comparisonProblems(baseline, candidate)).toEqual([]);
  candidate.environment.foreground = false;
  expect(comparisonProblems(baseline, candidate)).toContain('백그라운드 실행');
});

it('groups matching repetitions while retaining failed attempts and excluding changed source/config', () => {
  const first = run(); const second = run();
  second.metrics['cpu'] = summarize([18, 20], 'ms', 'cpu-render-call');
  const failed = run(); failed.status = 'failed';
  const differentSource = run(); differentSource.source.contentHash = 'c'.repeat(64);
  const differentCount = run(); differentCount.config.count++;
  expect(repetitionSummary([first, second, failed, differentSource, differentCount], first, 'cpu')).toEqual({
    attempts: 3, measured: 2, samples: 5, min: 12, max: 20, median: 16,
  });
  first.kind = 'diagnostic';
  expect(repetitionSummary([first], first, 'cpu')).toBeNull();
});
