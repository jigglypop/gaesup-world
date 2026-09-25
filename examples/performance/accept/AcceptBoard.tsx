import { useEffect, useMemo, useRef } from 'react';

import { autoDetectProfile } from 'gaesup-world';

import verification from '../../../prd/01-verification.md?raw';
import { scenarios as entries, type ScenarioStatus } from '../../../test/accept/budget';
import type { LabRun } from '../model';
import { pageCounters } from './counters';
import { activeRenderer } from './instrument';
import { parseMilestones } from './milestones';
import { acceptScenarios, RUNNER_ONLY, runVerdict, type AcceptVerdict } from './suite';

const STATUS: Record<ScenarioStatus, string> = { green: 'green', 'known-red': 'known-red', pending: 'pending' };
const VERDICT: Record<AcceptVerdict['verdict'], string> = {
  pass: '통과', fail: '실패', 'known-red': '예상된 실패', fixed: '예산 안 · green으로 바꿀 것', pending: '판정 없음', error: '측정 오류',
};
const milestones = parseMilestones(verification);
const runnable = new Set(acceptScenarios.map((scenario) => scenario.id));
const ids = Object.keys(entries).sort();

/** Where a scenario is judged when this page cannot run it. */
function judgedBy(id: string): string | null {
  if (entries[id]!.runner === 'headless') return 'pnpm test:accept';
  if (RUNNER_ONLY.includes(id)) return 'pnpm accept';
  return runnable.has(id) ? null : '시나리오 예정';
}

/** Latest run per scenario and its verdict; `runs` is sorted newest first. */
export function useAcceptResults(runs: readonly LabRun[]) {
  return useMemo(() => {
    const results = new Map<string, { run: LabRun } & AcceptVerdict>();
    for (const run of runs) if (entries[run.scenarioId] && !results.has(run.scenarioId)) results.set(run.scenarioId, { run, ...runVerdict(run) });
    return results;
  }, [runs]);
}
type Results = ReturnType<typeof useAcceptResults>;

function download(results: Results) {
  const report = { generatedAt: new Date().toISOString(), userAgent: navigator.userAgent, results: ids.map((id) => {
    const result = results.get(id);
    return { id, ...entries[id]!, verdict: result?.verdict ?? null, violations: result?.violations ?? [], runId: result?.run.runId ?? null,
      metrics: result ? Object.fromEntries(Object.entries(result.run.metrics).map(([name, metric]) => [name, metric.samples.at(-1) ?? null])) : {} };
  }) };
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'accept-report.json'; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function AcceptBoard({ results, busy, onRun, onSelect }: { results: Results; busy: boolean; onRun: (ids: string[]) => void; onSelect: (id: string) => void }) {
  return <div className="lab-card">
    <div className="lab-row"><h2>수용 시나리오 보드</h2><div className="lab-actions">
      <button disabled={busy} onClick={() => onRun([...runnable])}>브라우저 시나리오 전체 실행</button>
      <button disabled={results.size === 0} onClick={() => download(results)}>보고서 JSON</button>
    </div></div>
    <p className="lab-note">예산과 상태는 test/accept/budgets.json 하나에 있습니다. known-red는 해당 항목이 끝날 때까지 예산을 넘는 것이 정상이고, 예산 안으로 들어오면 green으로 바꿔야 합니다.</p>
    <table><thead><tr><th>시나리오</th><th>항목</th><th>상태</th><th>판정</th><th>위반·측정</th><th /></tr></thead><tbody>{ids.map((id) => {
      const entry = entries[id]!;
      const result = results.get(id);
      const external = judgedBy(id);
      return <tr key={id} onClick={() => runnable.has(id) && onSelect(id)}>
        <td>{id}<small>{entry.title}</small></td>
        <td>{entry.item}</td>
        <td className={`accept-${entry.status}`}>{STATUS[entry.status]}</td>
        <td className={result ? `accept-${result.verdict}` : ''}>{result ? VERDICT[result.verdict] : external ?? '미실행'}</td>
        <td>{result?.violations.join(' · ') || (result ? '예산 안' : '')}</td>
        <td>{external ? null : <button disabled={busy} onClick={(event) => { event.stopPropagation(); onRun([id]); }}>실행</button>}</td>
      </tr>;
    })}</tbody></table>
  </div>;
}

export function MilestoneList({ results }: { results: Results }) {
  return <aside className="lab-sidebar"><h2>마일스톤</h2><p>녹색이어야 할 시나리오와 손으로 하는 확인(prd/01-verification.md 6절)입니다.</p>
    {milestones.map((milestone) => {
      const green = milestone.scenarios.filter((id) => entries[id]!.status === 'green').length;
      return <details key={milestone.id} className="accept-milestone"><summary>{milestone.id} · green {green}/{milestone.scenarios.length}</summary>
        <ul>{milestone.scenarios.map((id) => <li key={id} className={`accept-${entries[id]!.status}`}>{id} {entries[id]!.title}{results.get(id) ? ` · ${VERDICT[results.get(id)!.verdict]}` : ''}</li>)}</ul>
        <p>{milestone.note}</p><p>손으로 확인: {milestone.manual}</p>
      </details>;
    })}
  </aside>;
}

/** Live counters written straight to the DOM at 4Hz, so the HUD itself never commits or renders a frame. */
export function AcceptHud() {
  const list = useRef<HTMLDListElement>(null);
  useEffect(() => {
    const cells = new Map([...list.current!.querySelectorAll<HTMLElement>('dd[data-key]')].map((cell) => [cell.dataset['key']!, cell]));
    const write = (key: string, value: string) => { const cell = cells.get(key); if (cell && cell.textContent !== value) cell.textContent = value; };
    const { profile } = autoDetectProfile();
    write('tier', profile.tier);
    let frame = 0; let frames = 0; let worst = 0; let last = performance.now(); let shown = last;
    const tick = (time: number) => {
      frames++; worst = Math.max(worst, time - last); last = time;
      if (time - shown >= 250) {
        const counters = pageCounters();
        const renderer = activeRenderer();
        const stats = renderer?.stats();
        write('fps', String(Math.round((frames * 1000) / (time - shown))));
        write('frame', `${worst.toFixed(1)} ms`);
        write('draws', renderer ? String(renderer.frame.drawCalls) : '—');
        write('triangles', renderer ? renderer.frame.triangles.toLocaleString('ko-KR') : '—');
        write('programs', stats ? String(stats.programs) : '—');
        write('commits', String(counters.commits));
        write('longtasks', `${counters.longTasks} · ${Math.round(counters.longTaskMs)} ms`);
        write('requests', String(counters.requests));
        frames = 0; worst = 0; shown = time;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  const rows = [['fps', 'FPS'], ['frame', '최악 프레임'], ['draws', 'Draw'], ['triangles', '삼각형'], ['programs', '셰이더 프로그램'],
    ['commits', 'React commit 누적'], ['longtasks', 'Long task 누적'], ['requests', '요청 누적'], ['tier', '기기 등급(auto)']] as const;
  return <dl className="accept-hud" ref={list} aria-label="실시간 카운터">{rows.map(([key, label]) => <div key={key}><dt>{label}</dt><dd data-key={key}>—</dd></div>)}</dl>;
}
