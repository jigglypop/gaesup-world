export type SourceIdentity = {
  commit: string;
  contentHash: string;
  lockfileHash: string | null;
  dirty: boolean;
  manifest: { path: string; sha256: string }[];
  versions: Record<string, string>;
  host: { cpu: string; platform: string; node: string };
};

export type LabConfig = {
  backend: 'webgpu' | 'webgl';
  seed: number;
  count: number;
  width: number;
  height: number;
  dpr: number;
  warmupMs: number;
  durationMs: number;
};

export const DEFAULT_CONFIG: LabConfig = {
  backend: 'webgpu', seed: 271828, count: 1000,
  width: 960, height: 540, dpr: 1, warmupMs: 10000, durationMs: 30000,
};

export type Assertion = { id: string; expected: string | number | boolean; actual: string | number | boolean; pass: boolean };
export type Metric = { unit: 'ms' | 'count' | 'bytes' | 'world' | 'world/s'; scope: string; samples: number[]; p50: number | null; p95: number | null; p99: number | null };
export type RunEnvironment = {
  userAgent: string;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  backend: string;
  adapter: string | null;
  gpuClass: 'hardware' | 'software' | 'unknown';
  foreground: boolean;
  browserFlags?: string[] | null;
};
export type LabRun = {
  schemaVersion: 1;
  runId: string;
  scenarioId: string;
  scenarioVersion: number;
  requirementIds: string[];
  role: 'baseline' | 'candidate';
  kind: 'functional' | 'performance' | 'diagnostic';
  status: 'passed' | 'failed' | 'unsupported' | 'aborted';
  source: SourceIdentity;
  config: LabConfig;
  environment: RunEnvironment;
  startedAt: string;
  endedAt: string;
  metrics: Record<string, Metric>;
  assertions: Assertion[];
  errors: string[];
  unsupportedReasons: string[];
};

export function summarize(samples: number[], unit: Metric['unit'], scope: string): Metric {
  if (samples.some((value) => !Number.isFinite(value) || value < 0)) throw new Error('Invalid metric sample');
  const sorted = [...samples].sort((a, b) => a - b);
  const percentile = (p: number) => sorted[Math.max(0, Math.ceil(sorted.length * p) - 1)] ?? null;
  return { samples: [...samples], unit, scope, p50: percentile(0.5), p95: percentile(0.95), p99: percentile(0.99) };
}

/** A comparison can change source content, but never silently change the workload or environment. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}

export function comparisonProblems(baseline: LabRun, candidate: LabRun): string[] {
  const problems: string[] = [];
  if (baseline.role !== 'baseline' || candidate.role !== 'candidate') problems.push('baseline/candidate 역할 불일치');
  if (baseline.scenarioId !== candidate.scenarioId || baseline.scenarioVersion !== candidate.scenarioVersion) problems.push('시나리오 버전 불일치');
  if (canonical(baseline.config) !== canonical(candidate.config)) problems.push('장면·측정 조건 불일치');
  if (canonical(baseline.environment) !== canonical(candidate.environment)) problems.push('브라우저·GPU 환경 불일치');
  if (canonical(baseline.source.host) !== canonical(candidate.source.host)) problems.push('실행 기기 불일치');
  if (canonical(baseline.source.versions) !== canonical(candidate.source.versions)) problems.push('의존성 버전 불일치');
  if (!baseline.environment.foreground || !candidate.environment.foreground) problems.push('백그라운드 실행');
  return problems;
}

export function improvementPercent(baseline: LabRun, candidate: LabRun, metric: string): number | null {
  if (comparisonProblems(baseline, candidate).length || baseline.status !== 'passed' || candidate.status !== 'passed') return null;
  if (baseline.kind !== 'performance' || candidate.kind !== 'performance') return null;
  if (baseline.config.warmupMs < 10000 || baseline.config.durationMs < 30000) return null;
  const a = baseline.metrics[metric];
  const b = candidate.metrics[metric];
  if (!a || !b || a.unit !== b.unit || a.scope !== b.scope || a.p95 === null || b.p95 === null || a.p95 <= 0) return null;
  return ((a.p95 - b.p95) / a.p95) * 100;
}

/** Repetitions require identical source, role, workload and environment; failed attempts stay counted. */
export function repetitionSummary(runs: LabRun[], selected: LabRun, metricName: string) {
  if (selected.kind !== 'performance' || selected.config.warmupMs < 10000 || selected.config.durationMs < 30000) return null;
  const key = (run: LabRun) => canonical([run.source.contentHash, run.source.host, run.source.versions,
    run.scenarioId, run.scenarioVersion, run.config, run.environment, run.role, run.kind]);
  const selectedKey = key(selected);
  const group = runs.filter(run => key(run) === selectedKey);
  const reference = selected.metrics[metricName];
  const values = group.filter(run => run.status === 'passed').map(run => run.metrics[metricName])
    .filter((metric): metric is Metric => !!metric && metric.p95 !== null && metric.unit === reference?.unit && metric.scope === reference.scope);
  const sorted = values.map(metric => metric.p95!).sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length ? (sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2) : null;
  return { attempts: group.length, measured: values.length, samples: values.reduce((sum, metric) => sum + metric.samples.length, 0),
    median, min: sorted[0] ?? null, max: sorted[sorted.length - 1] ?? null };
}

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((v) => typeof v === 'string');
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const scalar = (value: unknown) => typeof value === 'string' || typeof value === 'boolean' || finite(value);

/** Validate all imported fields used by the UI and recompute aggregates from raw samples. */
export function parseRun(value: unknown): LabRun {
  if (!record(value) || value['schemaVersion'] !== 1) throw new Error('지원하지 않는 run schema');
  for (const key of ['runId', 'scenarioId', 'startedAt', 'endedAt']) if (typeof value[key] !== 'string') throw new Error(`잘못된 ${key}`);
  if (!finite(value['scenarioVersion']) || !strings(value['requirementIds']) || !strings(value['errors']) || !strings(value['unsupportedReasons'])) throw new Error('잘못된 run metadata');
  if (!['baseline', 'candidate'].includes(String(value['role'])) || !['functional', 'performance', 'diagnostic'].includes(String(value['kind'])) || !['passed', 'failed', 'unsupported', 'aborted'].includes(String(value['status']))) throw new Error('잘못된 run 상태');
  const config = value['config'];
  if (!record(config) || !['webgpu', 'webgl'].includes(String(config['backend']))) throw new Error('잘못된 config');
  for (const key of ['seed', 'count', 'width', 'height', 'dpr', 'warmupMs', 'durationMs']) if (!finite(config[key]) || config[key] < 0) throw new Error(`잘못된 config.${key}`);
  const env = value['environment'];
  if (!record(env) || typeof env['userAgent'] !== 'string' || typeof env['backend'] !== 'string' || !finite(env['hardwareConcurrency']) || (env['deviceMemory'] !== null && !finite(env['deviceMemory'])) || (env['adapter'] !== null && typeof env['adapter'] !== 'string') || typeof env['foreground'] !== 'boolean' || !['hardware', 'software', 'unknown'].includes(String(env['gpuClass']))) throw new Error('잘못된 environment');
  if (env['browserFlags'] !== undefined && env['browserFlags'] !== null && !strings(env['browserFlags'])) throw new Error('잘못된 browser flags');
  const source = value['source'];
  if (!record(source) || typeof source['commit'] !== 'string' || typeof source['contentHash'] !== 'string' || (source['lockfileHash'] !== null && typeof source['lockfileHash'] !== 'string') || typeof source['dirty'] !== 'boolean' || !record(source['host']) || !record(source['versions']) || !Object.values(source['versions']).every((v) => typeof v === 'string')) throw new Error('잘못된 source identity');
  for (const key of ['cpu', 'platform', 'node']) if (typeof source['host'][key] !== 'string') throw new Error('잘못된 host');
  if (!Array.isArray(source['manifest']) || !source['manifest'].every((entry) => record(entry) && typeof entry['path'] === 'string' && typeof entry['sha256'] === 'string')) throw new Error('잘못된 source manifest');
  if (!Array.isArray(value['assertions']) || !value['assertions'].every((entry) => record(entry) && typeof entry['id'] === 'string' && typeof entry['pass'] === 'boolean' && scalar(entry['expected']) && scalar(entry['actual']))) throw new Error('잘못된 assertions');
  if (!record(value['metrics'])) throw new Error('잘못된 metrics');
  const metrics: Record<string, Metric> = {};
  for (const [name, metric] of Object.entries(value['metrics'])) {
    if (!record(metric) || !['ms', 'count', 'bytes', 'world', 'world/s'].includes(String(metric['unit'])) || typeof metric['scope'] !== 'string' || !Array.isArray(metric['samples']) || metric['samples'].length > 100000 || !metric['samples'].every(finite)) throw new Error(`잘못된 metric: ${name}`);
    metrics[name] = summarize(metric['samples'], metric['unit'] as Metric['unit'], metric['scope']);
  }
  const result = { ...value, metrics, environment: { ...env, browserFlags: env['browserFlags'] ?? null } } as LabRun;
  if (result.status === 'passed' && (result.errors.length || !result.assertions.length || result.assertions.some((a) => !a.pass))) throw new Error('통과 상태와 검증 결과가 모순됩니다');
  return result;
}
