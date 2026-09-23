import { summarize, parseRun, type LabConfig, type LabRun, type SourceIdentity, type Metric } from './model';
import { UnsupportedScenario, type Scenario } from './scenarios/types';

declare global { interface Window { performanceBrowserFlags?: string[] } }

export async function runScenario(
  scenario: Scenario, config: LabConfig, role: LabRun['role'], host: HTMLElement,
  signal: AbortSignal, progress: (text: string) => void,
): Promise<LabRun> {
  let source: SourceIdentity = __PERFORMANCE_BUILD__;
  if (import.meta.env.DEV) {
    const response = await fetch(`${import.meta.env.BASE_URL}__performance/source`, { cache: 'no-store', signal });
    if (!response.ok) throw new Error('현재 소스 식별값을 읽을 수 없습니다');
    source = await response.json() as SourceIdentity;
  }
  const run: LabRun = {
    schemaVersion: 1, runId: crypto.randomUUID(), scenarioId: scenario.id,
    scenarioVersion: scenario.version, requirementIds: scenario.requirementIds, role,
    kind: scenario.timed ? config.warmupMs >= 10000 && config.durationMs >= 30000 ? 'performance' : 'diagnostic' : 'functional',
    status: 'failed', source, config: { ...config },
    environment: {
      userAgent: navigator.userAgent, hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory ?? null, backend: 'not-used', adapter: null,
      gpuClass: 'unknown', foreground: document.visibilityState === 'visible',
      browserFlags: window.performanceBrowserFlags ?? null,
    },
    startedAt: new Date().toISOString(), endedAt: '', metrics: {}, assertions: [], errors: [], unsupportedReasons: [],
  };
  const samples = new Map<string, { values: number[]; unit: Metric['unit']; scope: string }>();
  const hidden = () => { if (document.visibilityState !== 'visible') run.environment.foreground = false; };
  document.addEventListener('visibilitychange', hidden);
  try {
    await scenario.run({
      host, config, signal, progress, role,
      assert: (id, expected, actual) => run.assertions.push({ id, expected, actual, pass: expected === actual }),
      sample: (name, value, unit, scope) => {
        let entry = samples.get(name);
        if (!entry) { entry = { values: [], unit, scope }; samples.set(name, entry); }
        if (entry.unit !== unit || entry.scope !== scope) throw new Error(`Metric contract changed: ${name}`);
        entry.values.push(value);
      },
      environment: (update) => Object.assign(run.environment, update),
      unavailable: (name, unit, scope, reason) => {
        if (!samples.has(name)) samples.set(name, { values: [], unit, scope });
        run.unsupportedReasons.push(`${name}: ${reason}`);
      },
    });
    if (signal.aborted) run.status = 'aborted';
    else run.status = run.assertions.length && run.assertions.every((assertion) => assertion.pass) ? 'passed' : 'failed';
  } catch (error) {
    if (error instanceof UnsupportedScenario) { run.status = 'unsupported'; run.unsupportedReasons.push(error.message); }
    else if (signal.aborted) run.status = 'aborted';
    else { run.status = 'failed'; run.errors.push(error instanceof Error ? error.message : String(error)); }
  } finally {
    document.removeEventListener('visibilitychange', hidden);
    run.endedAt = new Date().toISOString();
  }
  for (const [name, entry] of samples) run.metrics[name] = summarize(entry.values, entry.unit, entry.scope);
  return parseRun(run);
}
