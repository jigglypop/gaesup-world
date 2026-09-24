import { useCallback, useEffect, useRef, useState } from 'react';

import { loadBaselines } from './baselines';
import { DEFAULT_CONFIG, comparisonProblems, improvementPercent, parseRun, repetitionSummary, type LabConfig, type LabRun, type Metric } from './model';
import { requirements } from './requirements';
import { runScenario } from './runner';
import { scenarios } from './scenarios/registry';
import { loadRuns, saveRun } from './storage';
import './styles.css';

type RunRequest = { scenarioId?: string; config?: Partial<LabConfig>; role?: LabRun['role'] };
declare global {
  interface Window {
    performanceLab?: {
      run: (request?: RunRequest) => Promise<LabRun>;
      stop: () => void;
      runs: () => LabRun[];
      scenarioIds: string[];
    };
  }
}

const statusText = { passed: '시나리오 통과', failed: '실패 재현', unsupported: '미지원', aborted: '중지됨' };
const valueText = (value: number | null | undefined) => value == null ? '미측정' : value.toLocaleString('ko-KR', { maximumFractionDigits: 2 });

function Trace({ metric }: { metric: Metric | undefined }) {
  if (!metric?.samples.length) return <p className="lab-empty">표본이 없습니다.</p>;
  const stride = Math.max(1, Math.ceil(metric.samples.length / 240));
  const values = metric.samples.filter((_, i) => i % stride === 0);
  const max = Math.max(...values, 0.001);
  const points = values.map((value, i) => `${(i / Math.max(1, values.length - 1)) * 800},${100 - (value / max) * 90}`).join(' ');
  return <svg viewBox="0 0 800 110" role="img" aria-label={`${metric.scope} 시간순 표본, 최대 ${valueText(max)} ${metric.unit}`}>{values.length === 1 ? <circle cx="400" cy={100 - values[0]! / max * 90} r="4" fill="#74e1c2" /> : <polyline points={points} fill="none" stroke="#74e1c2" strokeWidth="1.5" />}</svg>;
}

export default function PerformanceLab() {
  const [scenarioId, setScenarioId] = useState(() => {
    const requested = new URLSearchParams(location.search).get('scenario');
    return scenarios.some(scenario => scenario.id === requested) ? requested! : 'metrics';
  });
  const [config, setConfig] = useState<LabConfig>(DEFAULT_CONFIG);
  const [role, setRole] = useState<LabRun['role']>('baseline');
  const [runs, setRuns] = useState<LabRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState('');
  const [baselineId, setBaselineId] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('시나리오를 선택해 실행하세요.');
  const [error, setError] = useState('');
  const [trace, setTrace] = useState('frame-interval');
  const host = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);
  const runRef = useRef<LabRun[]>([]);
  const scenario = scenarios.find((entry) => entry.id === scenarioId)!;
  const selected = runs.find((run) => run.runId === selectedRunId) ?? runs.find((run) => run.scenarioId === scenarioId);
  const baseline = runs.find((run) => run.runId === baselineId) ?? (selected?.role === 'candidate'
    ? runs.find(run => run.role === 'baseline' && comparisonProblems(run, selected).length === 0) : undefined);
  const problems = baseline && selected ? comparisonProblems(baseline, selected) : [];
  const traceName = selected?.metrics[trace] ? trace : Object.keys(selected?.metrics ?? {})[0] ?? '';
  const repetitions = selected ? repetitionSummary(runs, selected, traceName) : null;
  const intervals = selected?.metrics['frame-interval']?.samples ?? [];
  const averageFps = intervals.length ? 1000 * intervals.length / intervals.reduce((sum, value) => sum + value, 0) : null;

  const addRuns = useCallback((incoming: LabRun[]) => {
    const merged = new Map(runRef.current.map((run) => [run.runId, run]));
    for (const run of incoming) merged.set(run.runId, run);
    runRef.current = [...merged.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    setRuns(runRef.current);
  }, []);
  useEffect(() => {
    for (const load of [loadBaselines, loadRuns]) void load().then(addRuns).catch((e: unknown) => setError(String(e)));
  }, [addRuns]);
  useEffect(() => () => abort.current?.abort(), []);

  const execute = useCallback(async (request: RunRequest = {}) => {
    if (abort.current) throw new Error('실행 중인 시나리오를 먼저 중지하세요.');
    if (!host.current) throw new Error('재현 화면이 준비되지 않았습니다.');
    const target = scenarios.find((entry) => entry.id === (request.scenarioId ?? scenarioId));
    if (!target) throw new Error('연결되지 않은 시나리오');
    const nextConfig = { ...config, ...request.config };
    if (!Number.isInteger(nextConfig.count) || nextConfig.count < 1 || nextConfig.count > 100000) throw new Error('객체 수는 1~100,000 정수여야 합니다.');
    for (const key of ['width', 'height', 'dpr', 'durationMs'] as const) if (!Number.isFinite(nextConfig[key]) || nextConfig[key] <= 0) throw new Error(`잘못된 ${key}`);
    if (!Number.isFinite(nextConfig.warmupMs) || nextConfig.warmupMs < 0) throw new Error('잘못된 warmup');
    const controller = new AbortController(); abort.current = controller;
    setBusy(true); setError(''); setScenarioId(target.id); setConfig(nextConfig); setRole(request.role ?? role); setProgress('현재 소스 식별값 확인 중');
    host.current.replaceChildren();
    try {
      const run = await runScenario(target, nextConfig, request.role ?? role, host.current, controller.signal, setProgress);
      addRuns([run]); setSelectedRunId(run.runId);
      if (run.role === 'baseline') setBaselineId(run.runId);
      await saveRun(run);
      setProgress(`${statusText[run.status]} · ${run.runId.slice(0, 8)}`);
      return run;
    } finally { abort.current = null; setBusy(false); }
  }, [addRuns, config, role, scenarioId]);

  useEffect(() => {
    const api = { run: execute, stop: () => abort.current?.abort(), runs: () => runRef.current, scenarioIds: scenarios.map((entry) => entry.id) };
    window.performanceLab = api;
    return () => { if (window.performanceLab === api) delete window.performanceLab; };
  }, [execute]);

  const exportRun = () => {
    if (!selected) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `${selected.scenarioId}-${selected.runId}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  const importRun = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) throw new Error('JSON 파일은 20MB 이하여야 합니다.');
    const parsed: unknown = JSON.parse(await file.text());
    const imported = (Array.isArray(parsed) ? parsed : [parsed]).map(parseRun);
    for (const run of imported) await saveRun(run);
    addRuns(imported); setSelectedRunId(imported[0]?.runId ?? '');
    const firstBaseline = imported.find((run) => run.role === 'baseline');
    if (firstBaseline) setBaselineId(firstBaseline.runId);
  };
  const core = requirements.filter((entry) => entry.id.startsWith('R'));
  const linked = core.filter((entry) => scenarios.some((s) => s.id === entry.scenarioId));

  return <div className="performance-lab">
    <header className="lab-header"><div><a href={import.meta.env.BASE_URL}>gaesup world</a><h1>Runtime performance lab</h1><p>재현 → 수정 → 같은 조건으로 비교</p></div><nav><a href={`${import.meta.env.BASE_URL}engine`}>Engine</a><a href="https://github.com/mrdoob/three.js" target="_blank" rel="noreferrer">Three.js</a></nav></header>
    <div className="lab-summary">
      <span>구현 <b>{core.filter((entry) => entry.implementation === 'implemented').length}/{core.length}</b></span>
      <span>시나리오 연결 <b>{linked.length}/{core.length}</b></span>
      <span>전후 기능 비교 <b>{core.filter(entry => entry.evidence && runs.some(run => run.runId === entry.evidence?.candidateRunId) && runs.some(run => run.runId === entry.evidence?.baselineRunId)).length}/{core.length}</b></span>
      <span>전체 조건 검증 <b>{core.filter((entry) => entry.acceptedRunIds.length > 0).length}/{core.length}</b></span>
      <span>저장된 실행 <b>{runs.length}</b></span>
    </div>
    <main className="lab-layout">
      <aside className="lab-sidebar"><h2>개선 항목</h2><p>단일 시나리오 통과와 PRD 전체 완료는 구분합니다.</p>
        {requirements.map((entry) => {
          const available = scenarios.some((s) => s.id === entry.scenarioId);
          const latest = runs.find((run) => run.requirementIds.includes(entry.id));
          return <button key={entry.id} disabled={!available || busy} className={scenario.requirementIds.includes(entry.id) ? 'selected' : ''} onClick={() => { setScenarioId(entry.scenarioId); setSelectedRunId(''); }}>
            <span>{entry.id} · {entry.stage}</span><strong>{entry.title}</strong>
            <small>{entry.implementation === 'implemented' ? '구현됨' : entry.implementation === 'working' ? '일부 구현' : '미착수'} · {latest ? statusText[latest.status] : available ? '연결됨 · 미측정' : '시나리오 예정'}</small>
            {latest && <small>{latest.startedAt.slice(0, 10)} · {latest.runId.slice(0, 8)}</small>}
          </button>;
        })}
      </aside>
      <section className="lab-main">
        <div className="lab-card"><h2>{scenario.title}</h2><p>{scenario.description}</p>
          {requirements.filter(entry => scenario.requirementIds.includes(entry.id) && entry.evidence).map(entry => <p className="lab-note" key={entry.id}>{entry.evidence!.note}</p>)}
          <fieldset disabled={busy} className="lab-controls">
            <label>시나리오<select aria-label="재현 시나리오" value={scenarioId} onChange={(e) => { setScenarioId(e.target.value); setSelectedRunId(''); }}>{scenarios.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
            <label>Backend<select value={config.backend} onChange={(e) => setConfig({ ...config, backend: e.target.value as LabConfig['backend'] })}><option value="webgpu">WebGPU 요청</option><option value="webgl">WebGL</option></select></label>
            <label>객체 수<input type="number" min="1" max="100000" value={config.count} onChange={(e) => setConfig({ ...config, count: Number(e.target.value) })} /></label>
            <label>Warmup (초)<input type="number" min="0" value={config.warmupMs / 1000} onChange={(e) => setConfig({ ...config, warmupMs: Number(e.target.value) * 1000 })} /></label>
            <label>측정 (초)<input type="number" min="1" value={config.durationMs / 1000} onChange={(e) => setConfig({ ...config, durationMs: Number(e.target.value) * 1000 })} /></label>
            <label>실행 역할<select aria-label="실행 역할" value={role} onChange={(e) => setRole(e.target.value as LabRun['role'])}><option value="baseline">변경 전 baseline</option><option value="candidate">변경 후 candidate</option></select></label>
          </fieldset>
          <p className="lab-note">{config.width}×{config.height} · DPR {config.dpr} · seed {config.seed}. 짧은 측정은 진단용이며 개선율을 계산하지 않습니다.</p>
          <div className="lab-actions"><button disabled={busy} onClick={() => void execute().catch((e: unknown) => setError(String(e)))}>재현 실행</button><button disabled={!busy} onClick={() => abort.current?.abort()}>중지</button><button disabled={busy} onClick={() => { host.current?.replaceChildren(); setSelectedRunId(''); setProgress('재현 영역 초기화'); }}>화면 초기화</button></div>
          <p aria-live="polite" className="lab-progress">{progress}</p>{error && <p role="alert" className="lab-error">{error}</p>}
        </div>
        <div className="lab-viewport" ref={host} aria-label="실제 구현 재현 장면" />
        <div className="lab-card"><div className="lab-row"><h2>실행 결과</h2><div className="lab-actions"><button disabled={!selected} onClick={exportRun}>JSON 내보내기</button><label className="lab-file">JSON 불러오기<input type="file" accept="application/json,.json" onChange={(e) => void importRun(e.target.files?.[0]).catch((reason: unknown) => setError(String(reason)))} /></label></div></div>
          <div className="lab-controls"><label>표시할 실행<select aria-label="표시할 실행" value={selected?.runId ?? ''} onChange={(e) => setSelectedRunId(e.target.value)}><option value="">실행 선택</option>{runs.map((run) => <option key={run.runId} value={run.runId}>{run.scenarioId} · {run.role} · {run.status} · {run.runId.slice(0, 8)}</option>)}</select></label><label>비교 baseline<select aria-label="비교 baseline" value={baseline?.runId ?? ''} onChange={(e) => setBaselineId(e.target.value)}><option value="">자동 선택</option>{runs.filter((run) => run.role === 'baseline').map((run) => <option key={run.runId} value={run.runId}>{run.scenarioId} · {run.runId.slice(0, 8)}</option>)}</select></label></div>
          {!selected ? <p className="lab-empty">실행 결과가 없습니다. 측정하지 않은 값은 0으로 표시하지 않습니다.</p> : <>
            <p className={`lab-result ${selected.status}`}>{statusText[selected.status]} · {selected.kind} · {selected.environment.backend} · GPU {selected.environment.gpuClass}</p>
            <p className="lab-note">소스 {selected.source.contentHash.slice(0, 16)} · {selected.source.dirty ? '작업 트리 포함' : 'clean'} · {selected.environment.adapter ?? 'GPU 정보 미확인'}</p>
            <p className="lab-note">{selected.startedAt} · {selected.source.host.cpu} · {selected.environment.userAgent}</p>
            <p className="lab-note">실행 조건: {selected.config.width}×{selected.config.height}, DPR {selected.config.dpr}, 객체 {selected.config.count}, seed {selected.config.seed}, warmup {selected.config.warmupMs}ms, 측정 {selected.config.durationMs}ms</p>
            {intervals.length > 0 && <div className="lab-summary"><span>평균 FPS <b>{valueText(averageFps)}</b></span><span>프레임 p95 <b>{valueText(selected.metrics['frame-interval']?.p95)} ms</b></span><span>GPU p95 <b>{valueText(selected.metrics['gpu-render-time']?.p95)} ms</b></span></div>}
            {problems.length > 0 && <p className="lab-note">비교 불가: {problems.join(', ')}</p>}
            <table><thead><tr><th>지표 / 범위</th><th>단위</th><th>표본</th><th>p50</th><th>p95</th><th>p99</th><th>baseline p95</th><th>변화</th><th>감소율</th></tr></thead><tbody>{Object.entries(selected.metrics).map(([name, metric]) => {
              const percent = baseline ? improvementPercent(baseline, selected, name) : null;
              const previous = baseline?.metrics[name];
              const delta = baseline && !problems.length && metric.p95 !== null && previous?.p95 != null && metric.unit === previous.unit && metric.scope === previous.scope ? metric.p95 - previous.p95 : null;
              return <tr key={name} onClick={() => setTrace(name)}><td>{name}<small>{metric.scope}</small></td><td>{metric.unit}</td><td>{metric.samples.length}</td><td>{valueText(metric.p50)}</td><td>{valueText(metric.p95)}</td><td>{valueText(metric.p99)}</td><td>{valueText(previous?.p95)}</td><td>{delta === null ? '—' : valueText(delta)}</td><td>{percent === null ? '—' : `${percent.toFixed(1)}%`}</td></tr>;
            })}</tbody></table>
            <label className="lab-trace-select">시간순 표본<select value={traceName} onChange={(e) => setTrace(e.target.value)}>{Object.keys(selected.metrics).map((name) => <option key={name}>{name}</option>)}</select></label><Trace metric={selected.metrics[traceName]} />
            {repetitions && <p className="lab-note">동일 조건 반복 {repetitions.attempts}회 중 유효 측정 {repetitions.measured}회 · 총 {repetitions.samples.toLocaleString()}표본 · 실행별 p95 중앙값 {valueText(repetitions.median)}, 범위 {valueText(repetitions.min)}–{valueText(repetitions.max)} {selected.metrics[traceName]?.unit}. 전후 5쌍 비교와는 별도입니다.</p>}
            <table><thead><tr><th>기능 검증</th><th>기대값</th><th>실제값</th><th>결과</th></tr></thead><tbody>{selected.assertions.map((a) => <tr key={a.id}><td>{a.id}</td><td>{String(a.expected)}</td><td>{String(a.actual)}</td><td className={a.pass ? 'passed' : 'failed'}>{a.pass ? '통과' : '실패'}</td></tr>)}</tbody></table>
            {[...selected.errors, ...selected.unsupportedReasons].map((message, i) => <p className="lab-note" key={`${i}-${message}`}>{message}</p>)}
          </>}
        </div>
      </section>
    </main>
  </div>;
}
