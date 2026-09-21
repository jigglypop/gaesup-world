import { useEffect, useRef, useState } from 'react';

import { runMinihomeApiChecks, type ApiCheck } from './apiChecks';
import { minihomeFeatures } from './features';
import type { MiniroomEngine } from './room';
import type { RoomDiagnostics as Diagnostics } from './roomTypes';
import { downloadJson } from './sharing';

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
    <div className="room-diagnostic-heading"><strong>프레임 드로우콜 상세</strong><span>{stats?.backend ?? '준비 중'} · {stats?.pendingFrame ? '렌더링 중' : '대기'}</span></div>
    <dl className="room-metrics">
      <div><dt>Draw call</dt><dd>{stats?.frame?.stats.drawCalls ?? '—'}</dd></div>
      <div><dt>삼각형</dt><dd>{stats?.frame?.stats.triangles.toLocaleString() ?? '—'}</dd></div>
      <div><dt>CPU 제출</dt><dd>{stats?.frame ? `${stats.frame.submitMs.toFixed(2)} ms` : '—'}</dd></div>
      <div><dt>프레임 루프 누적</dt><dd>{stats?.loopCallbacks ?? '—'}</dd></div>
      <div><dt>가구</dt><dd>{stats?.visibleObjects ?? 0} / {stats?.objectCount ?? 0}</dd></div>
      <div><dt>해상도</dt><dd>{stats ? `${Math.round(stats.width * stats.dpr)}×${Math.round(stats.height * stats.dpr)}` : '—'}</dd></div>
      <div><dt>장면 Draw</dt><dd>{stats?.frame?.draws.filter(row => row.pass === 'scene').reduce((sum, row) => sum + row.calls, 0) ?? '—'}</dd></div>
      <div><dt>그림자 Draw</dt><dd>{stats?.frame?.draws.filter(row => row.pass === 'shadow').reduce((sum, row) => sum + row.calls, 0) ?? '—'}</dd></div>
      <div><dt>후처리·배경·기타</dt><dd>{stats?.frame?.otherCalls ?? '—'}</dd></div>
      <div><dt>Geometry / Texture</dt><dd>{stats?.frame ? `${stats.frame.stats.geometries} / ${stats.frame.stats.textures}` : '—'}</dd></div>
      <div><dt>셰이더 프로그램</dt><dd>{stats?.frame?.stats.programs ?? '—'}</dd></div>
      <div><dt>타일 / 인스턴스 배치</dt><dd>{stats ? `${stats.terrain.tiles} / ${stats.terrain.batches}` : '—'}</dd></div>
      <div><dt>Bloom 객체</dt><dd>{stats ? `${stats.bloom.objects} · ${stats.bloom.enabled ? '켜짐' : '꺼짐'}` : '—'}</dd></div>
      <div><dt>이동</dt><dd>{stats ? { idle: '대기', moving: '이동 중', arrived: '도착', blocked: '이동 불가' }[stats.movement.state] : '—'}</dd></div>
    </dl>
    <p>최근 프레임의 값입니다. CPU 제출 시간은 GPU 실행 시간이 아닙니다. 대기 중에는 프레임 루프가 멈춥니다.</p>
    <div className="draw-table-scroll"><table className="draw-table"><caption>실제 렌더러 카운터 증가량 · 같은 재질의 가구는 인스턴스로 묶어서 그립니다.</caption><thead><tr><th>객체·배치</th><th>패스</th><th>Draw</th><th>인스턴스</th><th>삼각형</th><th>재질</th></tr></thead><tbody>{stats?.frame?.draws.map(row => <tr key={row.id}><td>{row.name}</td><td>{row.pass === 'shadow' ? '그림자' : '장면'}</td><td>{row.calls}</td><td>{row.instances}</td><td>{row.triangles.toLocaleString()}</td><td>{row.material}</td></tr>)}</tbody></table></div>
    <p>후처리·배경·기타는 전체 Draw에서 위 객체·그림자 Draw를 뺀 값입니다. 그림자를 재사용하는 프레임에는 그림자 Draw가 0입니다.</p>
    <button disabled={!stats?.frame} onClick={() => downloadJson(stats, 'miniroom-frame.json')}>프레임 상세 JSON</button>
    <details className="room-feature-list"><summary>미니홈피 기능 연결 현황</summary>
      <p>제품 화면의 연결 상태입니다. 전체 기능의 검증 완료율은 아닙니다.</p>
      <ul className="room-api-checks">{minihomeFeatures.map(feature => <li key={feature.id}>
        <details><summary>{feature.title} · {{ connected: '연결됨', partial: '일부 연결', pending: '통합 예정' }[feature.status]}</summary>
          <p>{feature.location}</p><p>{feature.apis.join(' · ')}</p><p>남은 범위: {feature.remaining}</p>
        </details>
      </li>)}</ul>
    </details>
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
