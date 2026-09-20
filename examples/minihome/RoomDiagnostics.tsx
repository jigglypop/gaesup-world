import { useEffect, useRef, useState } from 'react';

import { runMinihomeApiChecks, type ApiCheck } from './apiChecks';
import type { MiniroomEngine } from './room';
import type { RoomDiagnostics as Diagnostics } from './roomTypes';

export function RoomDiagnostics({ engine }: { engine: MiniroomEngine | null }) {
  const [stats, setStats] = useState<Diagnostics | null>(null);
  const [checks, setChecks] = useState<ApiCheck[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const abort = useRef<AbortController | null>(null);
  useEffect(() => {
    const controller = new AbortController(); abort.current = controller;
    return () => { controller.abort(); if (abort.current === controller) abort.current = null; };
  }, []);
  useEffect(() => {
    const refresh = () => setStats(engine?.diagnostics() ?? null); refresh();
    const timer = window.setInterval(refresh, 1000); return () => clearInterval(timer);
  }, [engine]);
  async function verify() {
    const signal = abort.current?.signal;
    if (busy || !signal) return; setBusy(true); setError('');
    try { const results = await runMinihomeApiChecks(signal); if (!signal.aborted) setChecks(results); }
    catch (failure) { if (!signal.aborted) setError(failure instanceof Error ? failure.message : String(failure)); }
    finally { if (!signal.aborted) setBusy(false); }
  }
  return <section className="room-diagnostics" aria-label="미니룸 API·성능 검사">
    <div className="room-diagnostic-heading"><strong>API·성능 검사</strong><span>{stats?.backend ?? '준비 중'} · {stats?.pendingFrame ? '렌더링 중' : '대기'}</span></div>
    <dl className="room-metrics">
      <div><dt>Draw call</dt><dd>{stats?.frame?.stats.drawCalls ?? '—'}</dd></div>
      <div><dt>삼각형</dt><dd>{stats?.frame?.stats.triangles.toLocaleString() ?? '—'}</dd></div>
      <div><dt>CPU 제출</dt><dd>{stats?.frame ? `${stats.frame.submitMs.toFixed(2)} ms` : '—'}</dd></div>
      <div><dt>프레임 루프 누적</dt><dd>{stats?.loopCallbacks ?? '—'}</dd></div>
      <div><dt>가구</dt><dd>{stats?.visibleObjects ?? 0} / {stats?.objectCount ?? 0}</dd></div>
      <div><dt>해상도</dt><dd>{stats ? `${Math.round(stats.width * stats.dpr)}×${Math.round(stats.height * stats.dpr)}` : '—'}</dd></div>
    </dl>
    <p>최근 프레임의 값입니다. CPU 제출 시간은 GPU 실행 시간이 아닙니다. 대기 중에는 프레임 루프가 멈춥니다.</p>
    <div className="room-diagnostic-actions">
      <button disabled={busy || !engine} onClick={() => void verify()}>{busy ? 'API 검사 중…' : 'API 기능 검사 실행'}</button>
      <a href={`${import.meta.env.BASE_URL}performance?scenario=minihome-rendering`}>가구 부하·전후 성능 비교 ↗</a>
      <a href={`${import.meta.env.BASE_URL}engine`}>전체 패키지 API 목록 ↗</a>
    </div>
    {error && <p role="alert">{error}</p>}
    {checks.length > 0 && <>
      <p role="status">기능 {checks.filter(check => check.status === 'passed').length}/{checks.length} 통과 · 라이브러리 {new Set(checks.filter(check => check.scope === 'library').flatMap(check => check.apis)).size}개 · 예제 {new Set(checks.filter(check => check.scope === 'example').flatMap(check => check.apis)).size}개 호출 경로</p>
      <p>현재 방을 바꾸지 않는 별도 fixture 검사입니다. 전체 라이브러리 API의 통과율은 아닙니다.</p>
      <ul className="room-api-checks">{checks.map(check => <li key={check.id} data-status={check.status}>
        <details><summary><span>{check.status === 'passed' ? '통과' : '실패'}</span> {check.title}</summary><p>{check.apis.join(' · ')}</p><p>{check.detail}</p></details>
      </li>)}</ul>
    </>}
  </section>;
}
