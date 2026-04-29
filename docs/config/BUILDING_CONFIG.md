# Building 설정

이 문서는 현재 코드 기준의 building 설정과 타입을 정리합니다.

## 상수

`src/core/building/types/constants.ts`의 `TILE_CONSTANTS`가 grid와 기본 치수를 정의합니다.

```ts
const TILE_CONSTANTS = {
  GRID_CELL_SIZE: 4,
  SNAP_GRID_SIZE: 4,
  HEIGHT_STEP: 1,
  TILE_MULTIPLIERS: {
    SMALL: 1,
    MEDIUM: 2,
    LARGE: 3,
    HUGE: 4,
  },
  WALL_SIZES: {
    WIDTH: 4,
    HEIGHT: 4,
    THICKNESS: 0.5,
    MIN_LENGTH: 0.5,
    MAX_LENGTH: 10,
  },
  GRID_DIVISIONS: 25,
  DEFAULT_GRID_SIZE: 100,
};
```

## Store 설정/상태

`useBuildingStore`가 edit state와 배치 데이터를 관리합니다.

주요 설정 성격의 값:

- `editMode`
- `showGrid`
- `gridSize`
- `snapToGrid`
- `currentTileMultiplier`
- `currentTileHeight`
- `currentTileShape`
- `currentTileRotation`
- `selectedTileObjectType`
- `selectedPlacedObjectType`
- object별 색상/크기/텍스처 설정

## 데이터 타입

현재 building 도메인은 아래 타입을 중심으로 동작합니다.

- `MeshConfig`
- `WallConfig`
- `WallGroupConfig`
- `TileConfig`
- `TileGroupConfig`
- `BuildingBlockConfig`
- `PlacedObject`
- `BuildingSerializedState`

## 재질 preset

`MATERIAL_PRESETS`는 floor/wall 계열 기본 material parameter를 제공합니다.

```ts
MATERIAL_PRESETS.FLOOR.wood;
MATERIAL_PRESETS.WALL.glass;
```

## Placement 설정

`buildingGridAdapter`와 `buildingPlacementAdapter`는 4m square grid와 cell/edge 배치를 정의합니다.

- tile/block: cell 기반
- wall: edge 기반
- height: `HEIGHT_STEP` 기준 level 변환

## 현재 없는 설정

아래 설정들은 예전 설계안에 있었지만 현재 구현된 config API가 아닙니다.

- `ConstructionSettings`
- `BuildingToolSettings`
- `BuildingRenderQuality`
- `BuildingEditorSettings`
- 자동 undo/redo 설정
- vertex/edge/face snap 설정
- Unreal/ProBuilder 스타일 material instance 설정

필요하면 실제 store/type에 추가한 뒤 문서를 갱신합니다.
