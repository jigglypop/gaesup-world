import { useEffect, useRef, useState } from 'react';

import type { SceneDocumentController } from 'gaesup-world';

import { mountMiniroom, type MiniroomEngine, type RoomCamera, type RoomView } from './room';
import { RoomDiagnostics } from './RoomDiagnostics';
import type { RoomLighting, RoomQuality } from './roomTypes';

declare global { interface Window { miniroom?: Pick<MiniroomEngine, 'diagnostics' | 'projectPoint'> } }

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Miniroom({ controller, view, onSelect }: { controller: SceneDocumentController; view: RoomView; onSelect: (id: string | null) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null); const shell = useRef<HTMLDivElement>(null);
  const latestView = useRef(view); latestView.current = view;
  const [engine, setEngine] = useState<MiniroomEngine | null>(null);
  const [backend, setBackend] = useState(''); const [error, setError] = useState('');
  const [stage, setStage] = useState('렌더러 초기화'); const [generation, setGeneration] = useState(0);
  const [quality, setQuality] = useState<RoomQuality>('balanced'); const [lighting, setLighting] = useState<RoomLighting>('day');
  const [camera, setCamera] = useState<RoomCamera>('isometric'); const [diagnostics, setDiagnostics] = useState(false);
  const [exporting, setExporting] = useState(false); const [notice, setNotice] = useState(''); const [fullScreen, setFullScreen] = useState(false);
  useEffect(() => {
    if (!canvas.current) return;
    const abort = new AbortController(); let mounted: MiniroomEngine | null = null;
    setBackend(''); setError(''); setStage('렌더러 초기화');
    void mountMiniroom(canvas.current, controller, onSelect, value => { if (!abort.signal.aborted) setBackend(value); }, abort.signal, {
      onProgress: value => { if (!abort.signal.aborted) setStage(value); },
      onNotice: value => { if (!abort.signal.aborted) setNotice(value); },
      onError: failure => { if (!abort.signal.aborted) setError(failure.message); },
    }).then(instance => {
      if (abort.signal.aborted) { instance?.dispose(); return; }
      mounted = instance; setEngine(instance); instance?.update(latestView.current);
      if (instance) window.miniroom = instance;
    }).catch((failure: unknown) => { if (!abort.signal.aborted) setError(failure instanceof Error ? failure.message : String(failure)); });
    return () => { abort.abort(); mounted?.dispose(); if (window.miniroom === mounted) delete window.miniroom; };
  }, [controller, onSelect, generation]);
  useEffect(() => { engine?.update(view); }, [engine, view]);
  useEffect(() => { engine?.setQuality(quality); }, [engine, quality]);
  useEffect(() => { engine?.setLighting(lighting); }, [engine, lighting]);
  useEffect(() => { engine?.setCamera(camera); }, [engine, camera]);
  useEffect(() => {
    const changed = () => setFullScreen(document.fullscreenElement === shell.current);
    document.addEventListener('fullscreenchange', changed); return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  async function exportRoom(format: 'glb' | 'png') {
    if (!engine || exporting) return; setExporting(true); setNotice('');
    try { download(format === 'glb' ? new Blob([await engine.exportGlb()], { type: 'model/gltf-binary' }) : await engine.capture(), format === 'glb' ? 'mini-room.glb' : 'mini-room.png'); }
    catch (failure) { setNotice(failure instanceof Error ? failure.message : '내보내기에 실패했습니다.'); }
    finally { setExporting(false); }
  }
  async function expand() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await shell.current?.requestFullscreen(); }
    catch { setNotice('이 브라우저에서는 전체 화면을 사용할 수 없습니다.'); }
  }
  return <div className="miniroom-shell" ref={shell}>
    <div className="miniroom-view" data-renderer={backend || 'loading'}>
      <canvas key={generation} ref={canvas} tabIndex={0} aria-label="나의 3D 미니룸. 바닥을 클릭하면 미니미가 이동합니다." aria-describedby="miniroom-controls" />
      {!backend && !error && <div className="room-loading" role="status">{stage}…</div>}
      {error && <div className="room-loading" role="alert">방을 열지 못했습니다. {error}<button onClick={() => { setEngine(null); setGeneration(value => value + 1); }}>다시 열기</button></div>}
      <div className="room-badge"><span /> {lighting === 'day' ? '낮' : '저녁'} · {view.editing ? '편집' : '둘러보기'}</div>
      <button className="reset-camera" onClick={() => { setCamera('isometric'); engine?.resetCamera(); }} aria-label="미니룸 시점 초기화">⌂</button>
      <div className="room-caption" id="miniroom-controls">{view.editing ? '가구 드래그 · 방향키 이동 · Esc 취소' : '바닥 클릭·방향키 이동'}<span>오른쪽 드래그·한 손가락 회전 · 휠·두 손가락 확대</span></div>
    </div>
    <div className="room-view-controls" aria-label="미니룸 보기 설정">
      <label>시점<select aria-label="미니룸 카메라" value={camera} onChange={event => setCamera(event.target.value as RoomCamera)}><option value="isometric">입체</option><option value="front">정면</option><option value="top">위에서</option></select></label>
      <label>조명<select aria-label="미니룸 조명" value={lighting} onChange={event => setLighting(event.target.value as RoomLighting)}><option value="day">낮</option><option value="evening">저녁</option></select></label>
      <label>화질<select aria-label="미니룸 화질" value={quality} onChange={event => setQuality(event.target.value as RoomQuality)}><option value="economy">절전</option><option value="balanced">균형</option><option value="high">고화질</option></select></label>
      <button disabled={!engine || exporting} onClick={() => void exportRoom('png')}>사진 저장</button>
      <button disabled={!engine || exporting} onClick={() => void exportRoom('glb')}>{exporting ? '내보내는 중…' : '3D 방 내보내기 (.glb)'}</button>
      <button onClick={() => void expand()}>{fullScreen ? '화면 축소' : '화면 확대'}</button>
      <button aria-expanded={diagnostics} onClick={() => setDiagnostics(value => !value)}>API·성능</button>
    </div>
    {notice && <p className="room-notice" role="status">{notice}</p>}
    {diagnostics && <RoomDiagnostics engine={engine} />}
  </div>;
}
