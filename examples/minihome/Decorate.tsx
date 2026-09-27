import { useEffect, useState } from 'react';

import {
  BUILDING_TILE_OBJECT_OPTIONS,
  BUILDING_TILE_PRESETS,
  BUILDING_WALL_KIND_OPTIONS,
  BUILDING_WALL_PRESETS,
  DEFAULT_BUILDING_OBJECT_CATALOG,
  useBuildingStore,
  useBuildingStoreApi,
  type BuildingObjectCatalogItem,
  type BuildingTool,
  type PlacedObjectType,
} from 'gaesup-world/building';

type Part = 'object' | 'tile' | 'wall';
type BuildingStoreApi = ReturnType<typeof useBuildingStoreApi>;

const PARTS: { id: Part; label: string }[] = [
  { id: 'object', label: '소품' },
  { id: 'tile', label: '바닥' },
  { id: 'wall', label: '벽' },
];
const TOOLS: { id: BuildingTool; label: string }[] = [
  { id: 'place', label: '놓기' },
  { id: 'paint', label: '칠하기' },
  { id: 'erase', label: '지우기' },
];
const shelf = (...categories: BuildingObjectCatalogItem['category'][]) =>
  DEFAULT_BUILDING_OBJECT_CATALOG.filter((item) => categories.includes(item.category));
const SHELVES = [
  { label: '가구', items: shelf('furniture') },
  { label: '생활', items: shelf('utility', 'structure', 'shop') },
  { label: '자연', items: shelf('nature') },
];
const LIVELY: [Exclude<PlacedObjectType, 'model' | 'billboard'>, string][] = [['tree', '나무'], ['sakura', '벚꽃'], ['flag', '깃발'], ['fire', '모닥불']];
/** The island's own floors first, so painted ground can go back to lawn. */
const ISLAND_FLOORS = [['lawn', '잔디밭', '#8ccd65'], ['flowers', '꽃밭', '#6fbf53'], ['field', '밭', '#8a5f3a'], ['floor', '마루', '#d3a36a']] as const;

const HINTS: Record<BuildingTool, Record<Part, string>> = {
  place: { object: '땅을 눌러 놓아요 · R 돌리기', tile: '빈 칸을 눌러 바닥을 넓혀요 · Q/E 높이', wall: '칸 가장자리를 눌러 벽을 세워요 · R 돌리기' },
  paint: { object: '소품은 칠할 수 없어요', tile: '바닥 칸을 눌러 고른 바닥으로 칠해요', wall: '벽을 눌러 고른 벽으로 바꿔요' },
  erase: { object: '지울 소품을 눌러요', tile: '지울 바닥 칸을 눌러요', wall: '지울 벽을 눌러요' },
};

/** Places the catalog item at its catalog size and color. */
function pickModel(store: BuildingStoreApi, item: BuildingObjectCatalogItem) {
  const state = store.getState();
  state.setSelectedPlacedObjectType('model');
  state.setSelectedModelObjectId(item.id);
  state.setModelScale(1);
  state.setModelColor(item.defaultColor);
  state.setModelUrl(item.modelUrl ?? '');
}

/**
 * The 꾸미기 tab: building edit mode with the island's decorating choices. It drives gaesup-world's building store:
 * the edit mode picks what a click works on, the tool what it does, and the current object, floor or wall what it uses.
 */
export function Decorate({ onDone, onReset }: { onDone: () => void; onReset: () => void }) {
  const store = useBuildingStoreApi();
  const mode = useBuildingStore((state) => state.editMode);
  const part: Part = mode === 'tile' || mode === 'wall' ? mode : 'object';
  const tool = useBuildingStore((state) => state.buildingTool);
  const piece = useBuildingStore((state) => (state.selectedPlacedObjectType === 'model' ? state.selectedModelObjectId : state.selectedPlacedObjectType));
  const cover = useBuildingStore((state) => state.selectedTileObjectType);
  const wallKind = useBuildingStore((state) => state.currentWallKind);
  const [floor, setFloor] = useState('lawn');
  const [wall, setWall] = useState('');

  useEffect(() => {
    const state = store.getState();
    state.setEditMode('object');
    if (state.selectedPlacedObjectType === 'none') pickModel(store, DEFAULT_BUILDING_OBJECT_CATALOG.find((item) => item.category === 'furniture')!);
    state.setCurrentTileMaterialId('lawn');
    return () => {
      store.getState().setBuildingTool('place');
      store.getState().setEditMode('none');
    };
  }, [store]);
  const choosePart = (next: Part) => {
    store.getState().setEditMode(next);
    if (next === 'object' && tool === 'paint') store.getState().setBuildingTool('place');
  };
  const rotate = () => {
    const state = store.getState();
    const quarter = Math.PI / 2;
    const turn = (angle: number) => (angle + quarter) % (Math.PI * 2);
    if (part === 'object') state.setObjectRotation(turn(state.currentObjectRotation));
    else if (part === 'tile') state.setTileRotation(turn(state.currentTileRotation));
    else state.setWallRotation(turn(state.currentWallRotation));
  };

  return (
    <section className="mh-decorate" aria-label="꾸미기">
      <div className="mh-decorate-bar">
        <div className="mh-segment" role="group" aria-label="무엇을">
          {PARTS.map((item) => (
            <button key={item.id} aria-pressed={part === item.id} onClick={() => choosePart(item.id)}>{item.label}</button>
          ))}
        </div>
        <div className="mh-segment" role="group" aria-label="어떻게">
          {TOOLS.map((item) => (
            <button
              key={item.id}
              aria-pressed={tool === item.id}
              disabled={item.id === 'paint' && part === 'object'}
              onClick={() => store.getState().setBuildingTool(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mh-decorate-actions">
          <button className="mh-chip-button" onClick={rotate} disabled={tool !== 'place'}>⟳ 돌리기</button>
          <button className="mh-done" onClick={onDone}>완료</button>
        </div>
      </div>

      <div className="mh-shelves">
        {part === 'object' && (
          <>
            {SHELVES.map((group) => (
              <div className="mh-shelf" key={group.label}>
                <span>{group.label}</span>
                {group.items.map((item) => (
                  <button key={item.id} className="mh-piece" aria-pressed={piece === item.id} onClick={() => pickModel(store, item)}>{item.label}</button>
                ))}
              </div>
            ))}
            <div className="mh-shelf">
              <span>살아 있는</span>
              {LIVELY.map(([type, label]) => (
                <button key={type} className="mh-piece" aria-pressed={piece === type} onClick={() => store.getState().setSelectedPlacedObjectType(type)}>{label}</button>
              ))}
            </div>
          </>
        )}
        {part === 'tile' && (
          <>
            <div className="mh-shelf">
              <span>바닥</span>
              {ISLAND_FLOORS.map(([id, label, color]) => (
                <button key={id} className="mh-piece" aria-pressed={floor === id} onClick={() => { store.getState().setCurrentTileMaterialId(id); setFloor(id); }}>
                  <i style={{ background: color }} />{label}
                </button>
              ))}
              {BUILDING_TILE_PRESETS.map((preset) => (
                <button key={preset.id} className="mh-piece" aria-pressed={floor === preset.id} onClick={() => { store.getState().applyTilePreset(preset.id); setFloor(preset.id); }}>
                  <i style={{ background: preset.color }} />{preset.labelKo}
                </button>
              ))}
            </div>
            <div className="mh-shelf">
              <span>덮개</span>
              {BUILDING_TILE_OBJECT_OPTIONS.map((option) => (
                <button key={option.type} className="mh-piece" aria-pressed={cover === option.type} onClick={() => store.getState().setSelectedTileObjectType(option.type)}>{option.labelKo}</button>
              ))}
            </div>
          </>
        )}
        {part === 'wall' && (
          <>
            <div className="mh-shelf">
              <span>벽지</span>
              {BUILDING_WALL_PRESETS.map((preset) => (
                <button key={preset.id} className="mh-piece" aria-pressed={wall === preset.id} onClick={() => { store.getState().applyWallPreset(preset.id); setWall(preset.id); }}>{preset.labelKo}</button>
              ))}
            </div>
            <div className="mh-shelf">
              <span>모양</span>
              {BUILDING_WALL_KIND_OPTIONS.map((option) => (
                <button key={option.type} className="mh-piece" aria-pressed={wallKind === option.type} onClick={() => store.getState().setWallKind(option.type)}>{option.labelKo}</button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mh-decorate-foot">
        <span>{HINTS[tool][part]} · 오른쪽 드래그로 시점</span>
        <button className="mh-link" onClick={onReset}>섬 처음 모습으로</button>
      </div>
    </section>
  );
}
