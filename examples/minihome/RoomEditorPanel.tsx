import type { SceneDocumentController, SceneObject } from 'gaesup-world';

import { MAX_FURNITURE } from './model';
import { TILES, MAX_WORLD_SIZE, WORLD_EXPANSION, terrainHeight, type RoomTerrain, type RoomEditor, type TileKind } from './terrain';
import { FURNITURE, type FurnitureKind, type RoomTheme } from './types';

type Props = { editor: RoomEditor; onChange: (value: RoomEditor) => void; objects: SceneObject[]; selected: string | null; onSelect: (id: string | null) => void; controller: SceneDocumentController; undo: () => void; redo: () => void; canUndo: boolean; canRedo: boolean; onDuplicate: () => void; theme: RoomTheme; onTheme: (theme: RoomTheme) => void; terrain: RoomTerrain; onExpand: () => void };

export function RoomEditorPanel({ editor, onChange, objects, selected, onSelect, controller, undo, redo, canUndo, canRedo, onDuplicate, theme, onTheme, terrain, onExpand }: Props) {
  const half = terrain.size / 2;
  const object = objects.find(entry => entry.id === selected);
  const appearance = object?.components.find(component => component.type === 'miniroom.furniture');
  const update = (patch: Parameters<SceneDocumentController['dispatch']>[0] & { type: 'scene-object.update' }) => controller.dispatch(patch);
  const move = (axis: 0 | 2, value: number) => {
    if (!object || !Number.isFinite(value)) return;
    const position: [number, number, number] = [...object.transform.position]; position[axis] = Math.max(-half + 0.75, Math.min(half - 0.75, value));
    position[1] = terrainHeight(terrain, position[0], position[2]);
    update({ type: 'scene-object.update', objectId: object.id, patch: { transform: { position } } });
  };
  const glow = (patch: Record<string, boolean | number>) => {
    if (!object || !appearance) return;
    const document = controller.getSnapshot();
    controller.dispatch({ type: 'scene-document.replace', document: { ...document, objects: document.objects.map(entry => entry === object ? { ...entry, components: entry.components.map(component => component === appearance ? { ...component, data: { ...component.data, ...patch } } : component) } : entry) } });
  };
  return <aside className="town-editor" aria-label="공간 편집 도구">
    <div className="editor-heading"><strong>공간 편집</strong><span>{objects.length}/{MAX_FURNITURE} 가구</span></div>
    <div className="terrain-expansion"><div><strong>{terrain.size} × {terrain.size}</strong><span>{terrain.tiles.length.toLocaleString()} 타일</span></div><button aria-label="땅 확장" disabled={terrain.size >= MAX_WORLD_SIZE} onClick={onExpand}>{terrain.size >= MAX_WORLD_SIZE ? '최대 크기' : `＋ 땅 넓히기 · ${terrain.size + WORLD_EXPANSION} × ${terrain.size + WORLD_EXPANSION}`}</button></div>
    <div className="editor-history"><button onClick={undo} disabled={!canUndo}>↶ 실행 취소</button><button onClick={redo} disabled={!canRedo}>↷ 다시 실행</button></div>
    <div className="editor-tools" aria-label="편집 도구">{([['select', '선택'], ['tile', '타일 칠하기'], ['furniture', '가구 놓기']] as const).map(([tool, label]) => <button key={tool} aria-pressed={editor.tool === tool} onClick={() => onChange({ ...editor, tool })}>{label}</button>)}</div>
    <fieldset><legend>바닥 타일</legend><div className="tile-palette">{(Object.keys(TILES) as TileKind[]).map(kind => <button key={kind} aria-label={`${TILES[kind].name} 타일`} aria-pressed={editor.tool === 'tile' && editor.tile === kind} onClick={() => onChange({ ...editor, tool: 'tile', tile: kind })}><span style={{ background: TILES[kind].color }} />{TILES[kind].name}</button>)}</div>
      <label>브러시 크기<select aria-label="타일 브러시 크기" value={editor.brush} onChange={event => onChange({ ...editor, brush: Number(event.target.value) })}><option value={1}>1 × 1</option><option value={3}>3 × 3</option><option value={5}>5 × 5</option></select></label>
      <p>드래그해서 칠하기 · 한 번의 드래그는 한 번에 실행 취소</p>
    </fieldset>
    <fieldset><legend>높이·계단</legend>
      <label>바닥 높이<select aria-label="바닥 높이" value={editor.height} onChange={event => onChange({ ...editor, height: Number(event.target.value) })}>{Array.from({ length: 9 }, (_, index) => <option key={index} value={index * 0.5}>{index * 0.5} m</option>)}</select></label>
      <button aria-label="높이 칠하기" aria-pressed={editor.tool === 'height'} onClick={() => onChange({ ...editor, tool: 'height' })}>높이 칠하기</button>
      <label>계단 올라가는 방향<select aria-label="계단 방향" value={editor.stair ?? 'none'} onChange={event => onChange({ ...editor, stair: event.target.value === 'none' ? null : event.target.value as RoomEditor['stair'] })}><option value="north">북쪽 ↑</option><option value="east">동쪽 →</option><option value="south">남쪽 ↓</option><option value="west">서쪽 ←</option><option value="none">계단 지우기</option></select></label>
      <button aria-label="계단 놓기" aria-pressed={editor.tool === 'stairs'} onClick={() => onChange({ ...editor, tool: 'stairs', brush: 1 })}>계단 놓기</button>
      <p>계단은 선택한 높이에서 0.5m 올라갑니다.</p>
    </fieldset>
    <fieldset><legend>가구</legend><div className="editor-furniture">{(Object.keys(FURNITURE) as FurnitureKind[]).map(kind => <button key={kind} aria-label={`${FURNITURE[kind].name} 배치`} aria-pressed={editor.tool === 'furniture' && editor.furniture === kind} onClick={() => onChange({ ...editor, tool: 'furniture', furniture: kind })}><span>{FURNITURE[kind].icon}</span>{FURNITURE[kind].name}</button>)}</div><p>가구를 고른 뒤 바닥을 클릭해 배치합니다.</p></fieldset>
    <div className="editor-toggles"><label><input type="checkbox" checked={editor.grid} onChange={event => onChange({ ...editor, grid: event.target.checked })} />격자 표시</label><label><input type="checkbox" checked={editor.snap} onChange={event => onChange({ ...editor, snap: event.target.checked })} />격자에 맞추기</label></div>
    <div className="room-themes" aria-label="공간 테마">{(['peach', 'sage', 'lavender'] as const).map(value => <button key={value} className={`theme-dot ${value}`} aria-label={`${value === 'peach' ? '살구' : value === 'sage' ? '세이지' : '라벤더'} 테마`} aria-pressed={theme === value} onClick={() => onTheme(value)} />)}</div>
    <fieldset><legend>선택한 가구</legend>
      <select aria-label="선택한 가구" value={selected ?? ''} onChange={event => { onSelect(event.target.value || null); onChange({ ...editor, tool: 'select' }); }}><option value="">가구를 선택하세요</option>{objects.map(entry => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select>
      {object ? <>
        <label>이름<input aria-label="가구 이름" maxLength={60} value={object.name} onChange={event => update({ type: 'scene-object.update', objectId: object.id, patch: { name: event.target.value } })} /></label>
        <div className="editor-coordinates">{([0, 2] as const).map(axis => <label key={axis}>{axis === 0 ? 'X' : 'Z'}<input aria-label={`가구 ${axis === 0 ? 'X' : 'Z'} 위치`} type="number" step={0.5} min={-half + 0.75} max={half - 0.75} value={object.transform.position[axis]} onChange={event => move(axis, Number(event.target.value))} /></label>)}</div>
        <div className="editor-object-actions"><button aria-label="가구 회전" onClick={() => update({ type: 'scene-object.update', objectId: object.id, patch: { transform: { rotation: [0, object.transform.rotation[1] + Math.PI / 2, 0] } } })}>↻ 90°</button><button disabled={objects.length >= MAX_FURNITURE} onClick={onDuplicate}>복제</button><button aria-label="가구 삭제" onClick={() => controller.dispatch({ type: 'scene-object.delete', objectId: object.id })}>삭제</button></div>
        <div className="editor-object-actions"><button aria-label="가구 왼쪽 이동" onClick={() => move(0, object.transform.position[0] - 0.5)}>←</button><button aria-label="가구 뒤로 이동" onClick={() => move(2, object.transform.position[2] - 0.5)}>↑</button><button aria-label="가구 앞으로 이동" onClick={() => move(2, object.transform.position[2] + 0.5)}>↓</button><button aria-label="가구 오른쪽 이동" onClick={() => move(0, object.transform.position[0] + 0.5)}>→</button></div>
        <label className="editor-checkbox"><input aria-label="선택 가구 Bloom" type="checkbox" checked={appearance?.data['bloom'] === true} onChange={event => glow({ bloom: event.target.checked })} />Bloom 객체</label>
        <label>발광 세기 <output>{Number(appearance?.data['emissiveIntensity'] ?? 3).toFixed(1)}</output><input aria-label="가구 발광 세기" type="range" min={0} max={8} step={0.25} value={Number(appearance?.data['emissiveIntensity'] ?? 3)} onChange={event => glow({ emissiveIntensity: Number(event.target.value) })} /></label>
      </> : <p>선택 도구로 가구를 클릭하거나 목록에서 고르세요.</p>}
    </fieldset>
  </aside>;
}
