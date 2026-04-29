# Building API

이 문서는 현재 코드 기준의 건설 도메인 공개 API를 정리합니다.

## 관련 경로

- `src/core/building/index.ts`
- `src/core/building/stores/buildingStore.ts`
- `src/core/building/hooks/useBuildingEditor.ts`
- `src/core/building/model/placement.ts`
- `src/core/building/plugin.ts`
- `src/core/building/render/*`
- `src/core/building/types/*`

## 공개 export

루트 엔트리 `gaesup-world`와 building 배럴을 통해 아래 성격의 API가 공개됩니다.

- UI/컴포넌트: `BuildingUI`, `BuildingController`, `BuildingSystem`, `TileSystem`, `WallSystem`, `BlockSystem`, `GridHelper`
- 편집 훅/store: `useBuildingEditor`, `useBuildingStore`
- 플러그인: `createBuildingPlugin`, `buildingPlugin`
- 배치 모델: `buildingGridAdapter`, `buildingPlacementAdapter`, `createBuildingPlacementEngine`
- 렌더 상태: `BuildingRenderStateDriver`, GPU mirror/upload/culling/indirect draw driver
- 타입: `WallConfig`, `TileConfig`, `BuildingBlockConfig`, `PlacedObject`, `BuildingSerializedState`
- 환경 mesh: `Grass`, `GrassDriver`, `Sakura`, `Sand`, `Snowfield`, `Water`, `Billboard`, `Fire`

## 데이터 모델

현재 building 도메인은 단순 block API가 아니라 tile, wall, block, object를 함께 다루는 grid 기반 모델입니다.

```ts
type TileObjectType = 'water' | 'grass' | 'sand' | 'snowfield' | 'none';
type PlacedObjectType = 'sakura' | 'flag' | 'fire' | 'billboard';
type TileShapeType = 'box' | 'stairs' | 'round' | 'ramp';
```

핵심 직렬화 단위는 `BuildingSerializedState`입니다.

```ts
type BuildingSerializedState = {
  version: 1;
  meshes: MeshConfig[];
  wallGroups: WallGroupConfig[];
  tileGroups: TileGroupConfig[];
  blocks: BuildingBlockConfig[];
  objects: PlacedObject[];
};
```

## Grid / Placement

건설 좌표는 `SquareGridAdapter` 기반의 cell/edge 모델을 사용합니다.

- `buildingGridAdapter`: 4m cell, 1m height step 기준의 square grid
- `buildingPlacementAdapter`: tile/block은 cell, wall은 edge로 다루는 placement adapter
- `createBuildingPlacementEngine(options)`: no-overlap rule을 포함할 수 있는 placement engine 생성
- `worldToBuildingCell(position)`, `buildingCellToWorld(coord)`: world/grid 변환
- `tileToPlacementEntry`, `wallToPlacementEntry`, `blockToPlacementEntry`: 렌더/저장 데이터를 placement entry로 변환

## useBuildingEditor

`useBuildingEditor`는 R3F canvas 안에서 마우스 raycast와 store command를 연결하는 편집 훅입니다.

```tsx
import { useBuildingEditor } from 'gaesup-world';

function BuildingInputLayer() {
  const {
    updateMousePosition,
    placeWall,
    placeTile,
    placeBlock,
    placeObject,
    handleWallClick,
    handleTileClick,
    handleBlockClick,
    getGroundPosition,
  } = useBuildingEditor();

  return null;
}
```

반환 함수:

- `updateMousePosition(event)`: canvas mouse position을 grid hover position으로 변환
- `placeWall()`: 현재 wall edit state 기준으로 wall 추가
- `placeTile()`: 현재 tile edit state 기준으로 tile 추가
- `placeBlock()`: 현재 block edit state 기준으로 block 추가
- `placeObject()`: 현재 object edit state 기준으로 sakura/flag/fire/billboard 추가
- `handleWallClick(id)`, `handleTileClick(id)`, `handleBlockClick(id)`: edit mode에 따른 선택 처리
- `getGroundPosition()`: 현재 mouse ray가 만나는 ground position 조회

`useBuildingEditor`는 `useThree()`를 사용하므로 `Canvas` 내부에서 호출해야 합니다.

## useBuildingStore

`useBuildingStore`는 편집 상태, 카탈로그, 배치 데이터, 직렬화/복원 함수를 가진 Zustand store입니다.

```tsx
import { useBuildingStore } from 'gaesup-world';

function EditModeLabel() {
  const editMode = useBuildingStore((state) => state.editMode);
  return <span>{editMode}</span>;
}
```

성능상 필요한 값만 selector로 구독하는 것을 권장합니다.

주요 상태:

- `editMode`: `'none' | 'wall' | 'tile' | 'block' | 'npc' | 'object'`
- `meshes`, `wallGroups`, `tileGroups`, `blocks`, `objects`
- `selectedWallGroupId`, `selectedTileGroupId`, `selectedBlockId`
- `currentTileMultiplier`, `currentTileHeight`, `currentTileShape`, `currentTileRotation`
- `selectedTileObjectType`, `selectedPlacedObjectType`
- `hoverPosition`, `showGrid`, `gridSize`, `snapToGrid`

주요 action:

- `addWall`, `removeWall`
- `addTile`, `removeTile`
- `addBlock`, `removeBlock`
- `addObject`, `removeObject`
- `setEditMode`
- `serialize`, `hydrate`

## UI 컴포넌트

### BuildingUI

건설 편집 패널입니다. store의 카탈로그와 edit state를 조작합니다.

```tsx
import { BuildingUI } from 'gaesup-world';

<BuildingUI onClose={() => setOpen(false)} />
```

### BuildingController

Canvas input layer와 `useBuildingEditor`를 연결하는 컨트롤러 컴포넌트입니다.

```tsx
import { BuildingController } from 'gaesup-world';

<BuildingController />
```

### BuildingSystem

현재 store의 wall/tile/block/object 데이터를 렌더링하는 3D 컴포넌트 집합입니다.

## Runtime Plugin

`createBuildingPlugin`은 runtime plugin context에 building 도메인을 등록합니다.

등록 항목:

- `ctx.grid`: `building.square`
- `ctx.placement`: `building.placement`
- `ctx.save`: `building`
- `ctx.services`: `building.store`

```ts
import { createBuildingPlugin, createGaesupRuntime } from 'gaesup-world';

const runtime = await createGaesupRuntime({
  plugins: [createBuildingPlugin()],
});
```

save binding은 `useBuildingStore.getState().serialize()`와 `hydrate()`를 사용합니다.

## 렌더링 및 성능 경로

대규모 building 데이터는 별도 render snapshot과 GPU driver 계층을 가집니다.

- `BuildingRenderStateDriver`: store 데이터를 render snapshot으로 동기화
- `BuildingGpuMirrorDriver`: CPU snapshot을 GPU-friendly buffer로 mirror
- `BuildingGpuUploadDriver`: GPU buffer upload
- `BuildingGpuCullingDriver`: WebGPU visibility flag readback 기반 culling
- `BuildingIndirectDrawDriver`: indirect draw 경로
- `parseBuildingGpuVisibilityFlags`: visibility flag buffer를 render visibility 결과로 변환

## 주의할 점

- 예전 문서의 `useBuildingSystem`, `BuildingTool`, `BuildingMaterial`, undo/redo 중심 API는 현재 공개 API 기준이 아닙니다.
- block 배치는 `position + size + materialId` 기반의 `BuildingBlockConfig`를 사용합니다.
- wall은 cell이 아니라 edge placement로 변환될 수 있습니다.
- tile은 footprint와 shape, object type을 함께 가집니다.
