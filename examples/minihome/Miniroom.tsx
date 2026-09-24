import { useEffect, useRef, useState } from 'react';

import type { SceneDocumentController } from 'gaesup-world';

import { mountMiniroom, type MiniroomEngine, type RoomCamera, type RoomView } from './room';
import { RoomAudio } from './RoomAudio';
import { RoomCameraControls } from './RoomCameraControls';
import { RoomDiagnostics } from './RoomDiagnostics';
import { DEFAULT_ROOM_SETTINGS, type RoomAvatarStyle, type RoomLighting, type RoomQuality, type RoomSettings } from './roomTypes';
import type { RoomPeer } from './roomVisitors';
import type { TileKind } from './terrain';
import type { FurnitureKind } from './types';

declare global { interface Window { miniroom?: Pick<MiniroomEngine, 'diagnostics' | 'projectPoint'> } }

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Miniroom({ controller, view, onSelect, settings, onSettingsChange, onPaint, onSculpt, onPlace, onZoom, peers }: { controller: SceneDocumentController; view: RoomView; onSelect: (id: string | null) => void; settings: RoomSettings; onSettingsChange: (patch: Partial<RoomSettings>) => void; onPaint: (indices: number[], kind: TileKind) => void; onSculpt: (indices: number[], shape: import('./terrain').TerrainShape) => void; onPlace: (kind: FurnitureKind, x: number, z: number) => void; onZoom: (zoom: number) => void; peers: RoomPeer[] }) {
  const canvas = useRef<HTMLCanvasElement>(null); const shell = useRef<HTMLDivElement>(null);
  const latestView = useRef(view); latestView.current = view;
  const callbacks = useRef({ onPaint, onSculpt, onPlace, onZoom }); callbacks.current = { onPaint, onSculpt, onPlace, onZoom };
  const [engine, setEngine] = useState<MiniroomEngine | null>(null);
  const [backend, setBackend] = useState(''); const [error, setError] = useState('');
  const [stage, setStage] = useState('렌더러 초기화'); const [generation, setGeneration] = useState(0);
  const { quality, lighting, camera } = settings;
  const setQuality = (value: RoomQuality) => onSettingsChange({ quality: value });
  const setLighting = (value: RoomLighting) => onSettingsChange({ lighting: value });
  const setCamera = (value: RoomCamera) => onSettingsChange({ camera: value });
  const [diagnostics, setDiagnostics] = useState(false);
  const [exporting, setExporting] = useState(false); const [notice, setNotice] = useState(''); const [fullScreen, setFullScreen] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false); const [avatarError, setAvatarError] = useState('');
  const [avatarAttempt, setAvatarAttempt] = useState(0);
  useEffect(() => {
    if (!canvas.current) return;
    const abort = new AbortController(); let mounted: MiniroomEngine | null = null;
    setBackend(''); setError(''); setStage('렌더러 초기화');
    void mountMiniroom(canvas.current, controller, onSelect, value => { if (!abort.signal.aborted) setBackend(value); }, abort.signal, {
      backend: new URLSearchParams(location.search).get('renderer') === 'webgl' ? 'webgl' : 'auto',
      onProgress: value => { if (!abort.signal.aborted) setStage(value); },
      onNotice: value => { if (!abort.signal.aborted) setNotice(value); },
      onError: failure => { if (!abort.signal.aborted) setError(failure.message); },
      onPaint: (indices, kind) => callbacks.current.onPaint(indices, kind),
      onSculpt: (indices, shape) => callbacks.current.onSculpt(indices, shape),
      onPlace: (kind, x, z) => callbacks.current.onPlace(kind, x, z),
      onCameraZoom: value => callbacks.current.onZoom(value),
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
  useEffect(() => { engine?.setSettings(settings); }, [engine, settings]);
  useEffect(() => { engine?.setDiagnostics(diagnostics); }, [engine, diagnostics]);
  useEffect(() => { engine?.setPeers(peers); }, [engine, peers]);
  useEffect(() => {
    if (!engine) return;
    let active = true; setAvatarLoading(true); setAvatarError('');
    void engine.setAvatar(settings.avatar).catch(failure => {
      if (active) setAvatarError(failure instanceof Error ? failure.message : '아바타를 불러오지 못했습니다.');
    }).finally(() => { if (active) setAvatarLoading(false); });
    return () => { active = false; };
  }, [engine, settings.avatar, avatarAttempt]);
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
      <button className="reset-camera" onClick={() => { setCamera(DEFAULT_ROOM_SETTINGS.camera); engine?.resetCamera(); }} aria-label="미니룸 시점 초기화">⌂</button>
      <div className="room-caption" id="miniroom-controls">{view.editing ? view.editor?.tool === 'tile' ? '드래그해서 타일 칠하기 · Esc 취소' : view.editor?.tool === 'furniture' ? '빈 타일을 클릭해 가구 배치' : '가구 드래그 · 방향키 이동 · Esc 취소' : '바닥 클릭·WASD·방향키 이동'}<span>드래그·휠 버튼 드래그 회전 · 오른쪽 드래그 이동 · 휠 확대</span></div>
      {!view.editing && <nav className="town-zones" aria-label="타운 장소">{([['광장', 0, 2], ['데크', 0, -8.5], ['호박밭', -5.5, 2], ['당근밭', 5.5, 2], ['수돗가', -9.6, -1.5]] as const).map(([label, x, z]) => <button key={label} onClick={() => engine?.goTo(x, z)}>{label}</button>)}</nav>}
    </div>
    <div className="room-orbit" aria-label="카메라 회전">
      <button aria-label="카메라 왼쪽 회전" disabled={!engine || !settings.rotate} onClick={() => engine?.moveCamera('rotateLeft')}>↶</button>
      <button aria-label="카메라 오른쪽 회전" disabled={!engine || !settings.rotate} onClick={() => engine?.moveCamera('rotateRight')}>↷</button>
      <button aria-label="내 위치 보기" disabled={!engine} onClick={() => engine?.moveCamera('focus')}>◎</button>
    </div>
    <details className="room-settings"><summary>환경·카메라</summary>
    <div className="room-view-controls" aria-label="미니룸 보기 설정">
      <label>시점<select aria-label="미니룸 카메라" value={camera} onChange={event => setCamera(event.target.value as RoomCamera)}><option value="garden">텃밭</option><option value="isometric">입체</option><option value="front">정면</option><option value="top">위에서</option><option value="back">뒤에서</option><option value="left">왼쪽</option><option value="right">오른쪽</option><option value="follow">아바타 따라가기</option></select></label>
      <label>조명<select aria-label="미니룸 조명" value={lighting} onChange={event => setLighting(event.target.value as RoomLighting)}><option value="day">낮</option><option value="evening">저녁</option></select></label>
      <label>화질<select aria-label="미니룸 화질" value={quality} onChange={event => setQuality(event.target.value as RoomQuality)}><option value="economy">절전</option><option value="balanced">균형</option><option value="high">고화질</option></select></label>
      <label>아바타<select aria-label="미니룸 아바타" value={settings.avatar} onChange={event => onSettingsChange({ avatar: event.target.value as RoomAvatarStyle })}><option value="classic">기본 미니미</option><option value="coral">코랄 니트</option><option value="blue">블루 재킷</option><option value="mint">민트 원피스</option></select></label>
      <button disabled={!engine || exporting} onClick={() => void exportRoom('png')}>사진 저장</button>
      <button disabled={!engine || exporting} onClick={() => void exportRoom('glb')}>{exporting ? '내보내는 중…' : '3D 방 내보내기 (.glb)'}</button>
      <button onClick={() => void expand()}>{fullScreen ? '화면 축소' : '화면 확대'}</button>
      <button aria-expanded={diagnostics} onClick={() => setDiagnostics(value => !value)}>드로우콜·성능</button>
      <label>날씨<select aria-label="날씨" value={settings.weather} onChange={event => onSettingsChange({ weather: event.target.value as RoomSettings['weather'] })}><option value="clear">맑음</option><option value="snow">눈</option><option value="blizzard">눈보라</option></select></label>
      <label className="editor-checkbox"><input type="checkbox" aria-label="바람과 물결" checked={settings.natureMotion} onChange={event => onSettingsChange({ natureMotion: event.target.checked })} />바람과 물결</label>
      <label className="editor-checkbox"><input type="checkbox" aria-label="축제 효과" checked={settings.festive} onChange={event => onSettingsChange({ festive: event.target.checked })} />축제 효과</label>
    </div>
    {notice && <p className="room-notice" role="status">{notice}</p>}
    <RoomCameraControls engine={engine} settings={settings} onChange={onSettingsChange} zoom={view.zoom} onZoom={onZoom} />
    <RoomAudio settings={settings} onChange={onSettingsChange} />
    </details>
    {avatarLoading && <p className="room-notice" role="status">아바타 불러오는 중…</p>}
    {avatarError && <p className="room-notice" role="alert">{avatarError} <button onClick={() => setAvatarAttempt(value => value + 1)}>아바타 다시 불러오기</button></p>}
    {diagnostics && <RoomDiagnostics engine={engine} />}
  </div>;
}
