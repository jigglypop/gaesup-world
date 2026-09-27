# 건축

타일·벽·블록·배치 오브젝트로 이루어진 건축 데이터 모델, 단위와 좌표, store 액션, `BuildingController`가 그리고 편집하는 방식, 기본 카탈로그와 에디터 패널을 다룬다. 마을이나 방을 데이터로 만들고 편집 UI를 붙이려는 개발자를 위한 문서이며, 이름과 기본값은 현재 작업 트리의 소스에서 확인했다. import는 `gaesup-world/building`(건축만) 또는 루트 `gaesup-world`에서 한다.

## 구성

```tsx
<GaesupWorldContent>
  <WorldPhysics>
    <GaesupController position={[0, 2, 0]} />
    <BuildingController showGrid={false} />
  </WorldPhysics>
</GaesupWorldContent>
```

`BuildingController`(prop은 `showGrid` 하나)가 올리는 것(`src/core/building/components/BuildingController/index.tsx`):

| 조각 | 하는 일 |
|---|---|
| `BuildingRenderStateDriver` | 그리기 상태 store 갱신 |
| `BuildingVisibilityDriver` | 네이티브 WebGPU가 아닐 때 카메라 기준 그룹 가시성 계산 |
| `BuildingSystem` | 타일·벽·블록·오브젝트·날씨를 그리고 콜라이더를 만든다 |
| `NPCSystem` | NPC 렌더·편집 클릭·건축 장애물을 내비게이션에 넣는 드라이버([npc-dialog-gameplay.md](npc-dialog-gameplay.md)) |

- 콜라이더를 만들므로 `WorldPhysics` 안에 둔다.
- 처음 마운트될 때 store가 초기화되지 않았으면 `initializeDefaults()`가 기본 카탈로그와 **7×7 데모 광장**(대리석·나무 바닥, 잔디·눈밭·모래 타일, 벚꽃·깃발·모닥불)을 심는다. 자기 데이터만 쓰려면 마운트 전에 `hydrate(...)`를 호출한다(`hydrate`가 초기화 표시를 켠다).
- 격자 표시는 store의 `showGrid`(기본 `true`)를 따르고 prop이 있으면 prop이 이긴다. 플레이 화면에서 격자를 숨기려면 `showGrid={false}`를 준다.

## 단위와 좌표

출처: `src/core/building/types/constants.ts`, `src/core/building/model/placement.ts`, `src/core/building/model/footprint.ts`, `src/core/grid/SquareGridAdapter.ts`

| 항목 | 값 |
|---|---|
| 격자 한 칸 | 4m. 칸 `(x, z)`의 중심은 월드 `(4x, 4z)`이고 칸 경계는 `4k ± 2` |
| 높이 한 단계 | 1m. 칸 좌표의 `level = round(y / 1)` |
| 스냅 | `snapToGrid`가 켜져 있으면 편집 커서를 4m 격자점으로 맞춘다(`snapBuildingPosition`) |
| 벽 조각 | 길이 4m, 높이 4m, 두께 0.5m |

- **타일**: `position.x/z`는 타일 중심, `position.y`는 **윗면 높이**다. 타일은 땅(0)에서 `y`까지 채운 기둥으로 그려지고 충돌한다. `y = 0`이면 얇은 바닥이다. `size`는 한 변의 칸 수(없으면 1)이고, 홀수 크기는 칸 중심에, 짝수 크기는 격자 모서리에 맞춰 저장된다(`placeTileOnGrid`가 위치를 고치고 `cell`·`footprint`를 채운다).
- **계단·경사**(`shape: 'stairs' | 'ramp'`)는 0에서 `max(y, 1)`까지 로컬 +Z 방향으로 오른다. `rotation`(Y, 라디안)으로 방향을 돌린다.
- **벽**: `position`은 벽 상자의 중심이 아니라 기준점이다. `r = rotation.y`일 때 상자 중심은 `(x + 2·sin r, y + 2, z + 2·cos r)`, 즉 기준점에서 로컬 +Z로 2m, 위로 2m 떨어져 있다. `r = 0`이면 X축을 따라 서고(북·남 변), `π/2`면 Z축을 따라 선다(동·서 변). 편집기는 스냅된 격자점(4의 배수)을 기준점으로 써서 벽이 칸 경계에 선다. 코드로 격자 변에 세울 때는 직접 계산하지 말고 `edgeToWallTransform`을 쓴다.

  ```ts
  import { edgeToWallTransform } from 'gaesup-world/building';
  const { position, rotationY } = edgeToWallTransform({ x: 0, z: 0, level: 0, side: 'north' });
  store.addWall('house', { id: 'w-front', wallGroupId: 'house', position, rotation: { x: 0, y: rotationY, z: 0 } });
  ```

  저장된 `edge`는 위치·회전에서 다시 계산되며, 반대 방향을 보는 벽도 같은 변 이름(북 또는 서)을 받는다.
- **블록**: `position`은 첫 칸의 중심이고 `size`만큼 +X, +Y, +Z로 채운다(가로·세로는 칸, 높이는 1m 단위).
- **오브젝트**: 격자와 무관한 월드 좌표와 Y 회전(라디안)이다.
- 좌표 도우미: `worldToBuildingCell`, `buildingCellToWorld`, `tilePositionToCell`, `cellToTilePosition`, `createTileFootprint(cell, size)`, `createBlockFootprint(cell, size)`, `edgeToWallTransform`, `wallTransformToEdge`, `edgeSideToWallRotation`, `normalizeQuarterTurnRotation`, `snapBuildingPosition`.

## 데이터 모델 `BuildingSerializedState`

건축 상태 전체는 하나의 직렬화 객체다(`src/core/building/types/index.ts`).

| 필드 | 타입 | 설명 |
|---|---|---|
| `version` | `1` | |
| `meshes` | `MeshConfig[]` | 재질 정의. 타일·벽·블록이 id로 가리킨다 |
| `tileGroups` | `TileGroupConfig[]` | 바닥 묶음 |
| `wallGroups` | `WallGroupConfig[]` | 벽 묶음 |
| `blocks` | `BuildingBlockConfig[]` | 복셀형 상자 |
| `objects` | `PlacedObject[]` | 나무·깃발·불·간판·모델 |
| `showSnow`, `weatherEffect` | `boolean`, `'none' \| 'snow' \| 'rain' \| 'storm' \| 'wind'` | 건축에 붙은 날씨 효과(그린다) |
| `showFog`, `fogColor` | `boolean`, `string` | 켜면 `fogColor`를 기본 색으로 시간·날씨를 따르는 안개(`DynamicFog`)를 그린다 |
| `worldSurface` | `'ground' \| 'water'` | `water`면 월드 둘레에 카메라를 따라가는 바다를 깐다(섬 월드) |
| `wallCategories`, `tileCategories` | 선택 | 에디터 분류. 없으면 현재 분류를 유지한다 |

### `MeshConfig`

`{ id, color?, material?: 'STANDARD' | 'GLASS' | 'METAL', textureUrl?, mapTextureUrl?, normalTextureUrl?, roughness?, metalness?, opacity?, transparent?, materialParams?, assetId?, grass? }`. 최상위 값이 `materialParams`보다 우선하고, 텍스처는 `mapTextureUrl` → `textureUrl` → `materialParams.mapTextureUrl` 순이다. `GLASS`는 투과 재질이 되고 `METAL`은 표준 재질에 `metalness`를 그대로 쓴다. 기본값은 색 `#ffffff`, roughness 0.5, metalness 0이며, toon 모드(`setDefaultToonMode`)면 toon 재질로 바뀐다. 가리킨 id가 `meshes`에 없으면 벽은 검정(`#000000`)으로 그린다. 출처 `src/core/building/core/MaterialManager.ts`.

`grass: { profile?, density?, height?, color? }`를 주면 이 메시를 쓰는 모든 `box` 타일에 잔디 층이 자란다(노드 렌더러만, classic WebGL은 건너뛴다). `profile`은 `lawn`(기본, 짧고 부드러운 잔디, m²당 후보 16, 평균 0.25m)이나 `tall`(넓고 뻣뻣한 풀, 52, 0.55m)이다. `color`는 잎 뿌리의 지면 색이고, 없으면 메시 색(텍스처 메시는 잔디 초록)이다. 이 메시 위의 긴 풀 타일(`objectType: 'grass'`)은 칠한 초원 지면 대신 메시 표면을 그대로 둔다. 비용은 [performance.md](performance.md#잔디와-삼각형)에 있다.

### 타일 `TileGroupConfig` / `TileConfig`

- 그룹: `{ id, name, floorMeshId, tiles }`.
- 타일: `{ id, position, tileGroupId, materialId?, size?, rotation?, shape?, objectType?, objectConfig?, cell?, footprint? }`. `materialId`가 있으면 그룹의 `floorMeshId` 대신 쓴다. `cell`·`footprint`는 store가 채운다.
- `shape`: `'box'`(기본) · `'stairs'` · `'round'` · `'ramp'`.
- `objectType`(지형 덮개): `'none'` · `'grass'` · `'water'` · `'sand'` · `'snowfield'`. **`box` 타일에만 그려진다.** 잔디는 인스턴스 풀잎, 물은 인접 물 타일을 묶은 수면(물가 필드로 둑·젖은 모래·거품·수심을 그린다), 모래·눈밭은 전용 지면이다.
- `objectConfig`: `grassDensity`(m²당 풀잎, 기본 90), `terrainColor`, `terrainAccentColor`.

### 벽 `WallGroupConfig` / `WallConfig`

- 그룹: `{ id, name, frontMeshId?, backMeshId?, sideMeshId?, defaultWallKind?, walls }`. 앞면(로컬 +Z)은 `frontMeshId`, 뒷면은 `backMeshId`, 옆·위·아래는 `sideMeshId`로 그린다.
- 벽: `{ id, position, rotation, wallGroupId, materialId?, wallKind?, flipSides?, edge?, width?, height?, depth? }`. `materialId`가 있으면 여섯 면 모두 그 재질이다. `flipSides`는 앞·뒤 재질을 바꾼다. `width`·`height`·`depth`는 타입에만 있고 조각 크기는 고정(4×4×0.5m)이다.
- `wallKind`(없으면 그룹 `defaultWallKind`, 그것도 없으면 `solid`):

| 값 | 모양 | 몸체 충돌 | 내비게이션 |
|---|---|---|---|
| `solid` | 막힌 벽 | 막음 | 막음 |
| `window` | 창틀 + 유리 | 막음(유리 포함) | 막음 |
| `door` | 문틀 + 문짝 | 문짝은 통과 | 통과 |
| `arch` | 높은 아치 틀 + 문짝 | 문짝은 통과 | 통과 |
| `half` | 높이 46% 낮은 벽 | 막음 | 막음 |
| `railing` | 기둥·난간 | 막음 | 막음 |
| `glass` | 유리 벽 + 테두리 | 막음 | 막음 |

### 블록 `BuildingBlockConfig`

`{ id, position, size?: { x?, y?, z? }, materialId?, tags?, cell? }`. `materialId`가 없으면 기본 블록 재질이다. 편집기로 놓는 블록은 아래 타일의 지형(모래·눈밭) 색을 딴 재질을 자동으로 만든다.

### 배치 오브젝트 `PlacedObject`

`{ id, type, position, rotation?, config? }`, `type`은 `'tree' | 'sakura' | 'flag' | 'fire' | 'billboard' | 'model'`.

| type | 쓰는 `config` 필드 | 비고 |
|---|---|---|
| `tree` | `treeKind`, `size`(기본 4), `primaryColor`(잎·꽃), `secondaryColor`(줄기) | `treeKind`: `sakura` · `oak`(기본) · `pine` · `maple` · `birch` · `willow` · `cypress` · `dead`. 종류별 색 프리셋 `BUILDING_TREE_COLOR_PRESETS` |
| `sakura` | `size`, `primaryColor`, `secondaryColor` | 항상 벚꽃 |
| `flag` | `flagStyle`(`flag` · `banner` · `panel` · `placard`), `flagWidth`, `flagHeight`, `flagTexture` | 스타일별 기본 크기 `FLAG_STYLE_META` |
| `fire` | `fireIntensity`(1.5), `fireWidth`(1), `fireHeight`(1.5), `fireColor` | |
| `billboard` | `billboardText`, `billboardImageUrl`, `billboardColor`, `billboardWidth`, `billboardHeight`, `billboardScale`, `billboardOffsetY`, `billboardElevation`, `billboardIntensity` | |
| `model` | `modelUrl`, `modelScale`, `modelColor`, `modelFallbackKind`, `modelLabel`, `modelId` | GLB를 읽는 동안·실패했을 때·`modelUrl`이 없을 때 원시 도형 대체물을 그린다 |

`modelFallbackKind`: `door` · `window` · `fence` · `lamp` · `chair` · `table` · `bed` · `storage` · `mailbox` · `crafting` · `shop` · `generic`(기본). `modelColor`는 대체 도형에만 칠해진다. `lamp` 대체 도형은 풀링된 점광원을 켠다(GLB를 불러온 조명 모델에는 빛이 없다). 나무·깃발·불·간판은 종류별로 묶어 그린다. GLB 모델은 에디터 밖에서 정적 지오메트리로 그린다. 무늬 없는 모델은 32m 칸마다 한 메시로 합치고, 텍스처·투명 재질 모델과 많이 복사한 모델은 GLB마다 인스턴싱한다([rendering.md](rendering.md#정적-모델-병합)). 편집 중에는 하나씩 골라 옮길 수 있게 오브젝트마다 그린다. 오브젝트에는 **물리 콜라이더가 없다**(캐릭터가 통과한다). 대신 내비게이션 장애물로는 들어간다.

### 예시

```ts
import type { BuildingSerializedState } from 'gaesup-world/building';

export const plaza: BuildingSerializedState = {
  version: 1,
  meshes: [{ id: 'stone', color: '#b9b2a4', roughness: 0.8 }, { id: 'plaster', color: '#f3e3c3' }],
  tileGroups: [{ id: 'ground', name: 'ground', floorMeshId: 'stone', tiles: [
    { id: 't0', tileGroupId: 'ground', position: { x: 0, y: 0, z: 0 }, size: 3 },
    { id: 't1', tileGroupId: 'ground', position: { x: 12, y: 0, z: 0 }, objectType: 'grass' },
  ] }],
  wallGroups: [{ id: 'house', name: 'house', frontMeshId: 'plaster', backMeshId: 'plaster', sideMeshId: 'plaster', walls: [] }],
  blocks: [{ id: 'b0', position: { x: -8, y: 0, z: 0 }, size: { x: 1, y: 2, z: 1 } }],
  objects: [{ id: 'oak', type: 'tree', position: { x: 8, y: 0, z: 8 }, config: { treeKind: 'oak' } }],
  showSnow: false, showFog: false, fogColor: '#cfd8e3', weatherEffect: 'none', worldSurface: 'ground',
};
```

## store 읽고 쓰기

- 컴포넌트 안: `useBuildingStore(selector)`로 읽고 `useBuildingStoreApi().getState().액션()`으로 쓴다. 가장 가까운 런타임의 store를 쓴다.
- 런타임 밖 코드: `runtime.buildingStore.getState()`. 런타임 없이 쓰는 월드(legacy)는 `useBuildingStore.getState()`.
- store는 immer 기반이다. 액션이 바꾼 컬렉션만 새 참조가 되므로 selector는 필요한 필드만 고른다.

### 통째로 넣고 꺼내기

| 액션 | 설명 |
|---|---|
| `serialize()` | 현재 상태를 `BuildingSerializedState`로(깊은 복사) |
| `hydrate(data)` | **전체 교체.** 준 데이터에 없는 컬렉션은 비워지고, 설정 값은 기본값이 된다. 분류는 데이터에 없으면 유지한다. `null`·`undefined`는 아무것도 하지 않는다 |
| `prepareHydrate(data)` | 검증만 하고 적용 함수를 돌려준다(저장 복원에 쓰는 2단계 적용) |

검증: `version`은 1이거나 없어야 하고, 아는 키가 하나도 없으면 "Empty building snapshot"으로 거부한다. 좌표는 유한수, `size`는 양수여야 한다. 타일 위치는 격자에 맞게 고쳐지고, 벽의 `edge`는 다시 계산된다.

### 모델 액션 (`src/core/building/stores/buildingModelActions.ts`)

| 대상 | 액션 |
|---|---|
| 재질 | `addMesh(mesh)`, `updateMesh(id, patch)`, `removeMesh(id)` |
| 분류 | `addWallCategory` / `updateWallCategory` / `removeWallCategory` / `setSelectedWallCategory`, 타일 분류도 같은 이름(`Tile`) |
| 벽 그룹 | `addWallGroup(group)`, `updateWallGroup(id, patch)`, `removeWallGroup(id)` |
| 벽 | `addWall(groupId, wall)`, `updateWall(groupId, wallId, patch)`, `removeWall(groupId, wallId)`, `moveWallToGroup(wallId, groupId)` |
| 타일 그룹 | `addTileGroup(group)`, `updateTileGroup(id, patch)`, `removeTileGroup(id)` |
| 타일 | `addTile(groupId, tile)`, `updateTile(groupId, tileId, patch)`, `removeTile(groupId, tileId)` |
| 블록 | `addBlock(block)`, `updateBlock(id, patch)`, `removeBlock(id)` |
| 오브젝트 | `addObject(object)`, `updateObject(id, patch)`, `removeObject(id)` |

- 그룹이 없으면 `addWall`·`addTile`은 아무것도 하지 않는다.
- `addWall`은 `materialId`가 없으면 `currentWallMaterialId`를, `wallKind`가 없으면 `currentWallKind`(기본 `solid`)를 채운다. `addTile`은 `objectType`이 없으면 `selectedTileObjectType`(기본 `none`), `materialId`가 없으면 `currentTileMaterialId`를 채우고, `objectConfig`가 없으면 잔디는 밀도 90과 현재 지형 색, 모래·눈밭은 현재 지형 색을 넣는다. 데이터를 코드로 넣을 때는 이 값들을 명시하는 편이 안전하다.
- `add*`는 **겹침을 검사하지 않는다.** 겹치지 않게 하려면 먼저 검사한다: `checkTilePosition(position)`(현재 `currentTileMultiplier` 크기로), `checkBlockPosition({ position, size })`, `checkWallPosition(position, rotationY)`. 모두 겹치면 `true`다. 타일·블록 겹침은 같은 칸·같은 `level`일 때만 본다. `getSupportHeightAt(position)`은 그 자리에 새로 쌓을 높이를 준다: 겹치는 타일 윗면 + 1단계와 블록 윗면 중 큰 값, 없으면 0.
- `moveWallToGroup`은 벽의 `materialId`를 지운다.

### 편집 도구 상태 (`src/core/building/stores/buildingEditActions.ts`)

| 영역 | 필드 / 액션 |
|---|---|
| 모드 | `editMode`: `'none' \| 'world' \| 'wall' \| 'tile' \| 'block' \| 'object' \| 'npc'`. `setEditMode(mode)`(`none`이 아니면 격자를 켠다), `isInEditMode()` |
| 격자 | `setShowGrid`, `setGridSize`(기본 100m), `setSnapToGrid`(기본 켬), `snapPosition(position)` |
| 커서 | `hoverPosition`, `setHoverPosition` |
| 타일 | `currentTileMultiplier` / `setTileMultiplier`(패널은 1–4), `currentTileHeight` / `setTileHeight`(0–6 정수, 계단·경사는 최소 1), `currentTileShape` / `setTileShape`, `currentTileRotation` / `setTileRotation`, `currentTileMaterialId` / `setCurrentTileMaterialId`, `selectedTileObjectType` / `setSelectedTileObjectType`(지형별 기본 색도 바꾼다), `setTerrainColors(color, accent?)` |
| 벽 | `currentWallRotation` / `setWallRotation`, `currentWallKind` / `setWallKind`(선택한 벽이 있으면 그 벽도 바꾼다), `currentWallMaterialId` / `setCurrentWallMaterialId` |
| 오브젝트 | `selectedPlacedObjectType` / `setSelectedPlacedObjectType`, `currentObjectRotation`, 나무(`setTreeKind`는 색 프리셋도 넣는다, `setObjectPrimaryColor`, `setObjectSecondaryColor`), 깃발(`setFlagStyle`는 기본 크기도 넣는다, `setFlagWidth`, `setFlagHeight`, `setFlagImageUrl`), 불(`setFireIntensity`, `setFireWidth`, `setFireHeight`, `setFireColor`), 간판(`setBillboard*` 9개), 모델(`setSelectedModelObjectId`, `setModelUrl`, `setModelScale` 0.1–10, `setModelColor`) |
| 프리셋 | `applyTilePreset(presetId)` → 그룹 `<id>-floor`와 재질 `tile-<id>`를 만들고 선택한다. `applyWallPreset(presetId)` → 그룹 `<id>-walls`와 재질 세 개. `setCustomTileDraft({ name?, color?, textureUrl? })` + `applyCustomTile()` |
| 선택 | `selectedTileId` / `selectedWallId` / `selectedBlockId`와 setter. 하나를 고르면 나머지는 풀린다 |
| 환경 | `setShowSnow`(켜면 `weatherEffect: 'snow'`), `setWeatherEffect`(`showSnow`도 맞춘다), `setShowFog`, `setFogColor`, `setWorldSurface` |

## 편집 입력

`BuildingController`가 편집 모드에서 캔버스 입력을 받는다(`src/core/building/hooks/useBuildingEditor.ts`).

- 커서: 마우스 광선을 y=0 평면과 교차시키고 스냅한다. `tile`·`block`·`npc` 모드는 그 자리의 쌓기 높이를 `y`로 쓴다.
- 좌클릭(3px 넘게 끌면 무시, 연속 배치 간격 150ms)이 모드에 따라 배치한다.

| 모드 | 클릭 결과 |
|---|---|
| `wall` | 선택된 벽 그룹에 `currentWallRotation`·`currentWallKind`로 벽 추가. 같은 변에 벽이 있으면 무시 |
| `tile` | `box`·`round`는 쌓기 높이 + `currentTileHeight`, `stairs`·`ramp`는 높이 `max(1, currentTileHeight)`로 타일 추가. 겹치면 무시 |
| `block` | `currentTileMultiplier`×1×`currentTileMultiplier` 블록 추가. 겹치면 무시 |
| `object` | 선택된 종류의 오브젝트를 그 자리 가장 높은 타일 위에 추가 |
| `npc` | `NPCSystem`이 처리한다. 템플릿을 고른 상태면 NPC 생성, NPC를 고른 상태면 그곳으로 이동(Shift+클릭은 생성) |
| `world` | 배치 없음. 환경 설정만 |

- 키: 방향키가 `wall`·`tile`·`object` 모드의 회전을 0°/90°/180°/270°로 정하고, `tile`·`block` 모드에서 Q/E가 높이를 1단계 내리고 올린다.
- 에디터 패널의 타일 프리셋·커스텀 타일을 캔버스로 끌어다 놓으면 `tile` 모드로 바꾸고 그 자리에 놓는다(`BUILDING_TILE_PRESET_DRAG_TYPE`, `BUILDING_TILE_GROUP_DRAG_TYPE`).
- 편집 중 기존 타일·벽·블록의 강조 표시를 클릭하면 선택된다(같은 모드일 때). 삭제는 패널 버튼(또는 `remove*` 액션)으로 한다.
- 편집 모드(`none` 외)에서는 조작 캐릭터가 사라지고 키 입력이 막힌다.
- 콜라이더: 타일은 항상, 벽은 `wall` 모드가 아닐 때, 블록은 `block` 모드가 아닐 때 만든다(편집 중 클릭을 막지 않도록). 같은 높이·1칸·직각 타일은 사각형으로 합쳐 콜라이더 수를 줄인다.
- 그리기: 네이티브 WebGPU에서는 재질별 인스턴스 배치를 GPU에 상주시키고(`GpuBatchBridge`), 아니면 `BuildingVisibilityDriver`가 그룹 단위로 컬링한다. 자세한 내용은 [rendering.md](rendering.md).

## 카탈로그와 프리셋

`DEFAULT_BUILDING_OBJECT_CATALOG`(`src/core/building/catalog/objects.ts`)는 `model` 오브젝트의 기본 목록이다. `getDefaultBuildingObject(id)`로 찾는다.

| id | 이름 | fallbackKind | modelUrl |
|---|---|---|---|
| `door-basic` | 문 | `door` | `gltf/props/door.glb` |
| `window-basic` | 창문 | `window` | `gltf/props/window.glb` |
| `fence-basic` | 울타리 | `fence` | `gltf/props/fence.glb` |
| `lamp-basic` | 조명 | `lamp` | `gltf/props/lamp.glb` |
| `chair-basic` | 의자 | `chair` | `gltf/props/chair.glb` |
| `table-basic` | 탁자 | `table` | `gltf/props/table.glb` |
| `bed-basic` | 침대 | `bed` | `gltf/props/bed.glb` |
| `storage-basic` | 수납장 | `storage` | `gltf/props/storage.glb` |
| `mailbox-basic` | 우편함 | `mailbox` | `gltf/props/mailbox.glb` |
| `crafting-basic` | 제작대 | `crafting` | `gltf/props/crafting.glb` |
| `shop-stall-basic` | 가판대 | `shop` | `gltf/props/shop-stall.glb` |

`modelUrl`은 페이지 기준 상대 경로다. GLB는 패키지의 `public/gltf/props/`에 들어 있으므로, 앱이 그 파일을 `gltf/props/` 경로로 서빙해야 한다. 파일이 없으면 대체 도형이 보인다.

그 밖의 표(에디터 UI용): `BUILDING_TILE_PRESETS`(바닥 24종), `BUILDING_WALL_PRESETS`(벽 8종), `BUILDING_TILE_OBJECT_OPTIONS`, `BUILDING_TILE_SHAPE_OPTIONS`, `BUILDING_WALL_KIND_OPTIONS`, `BUILDING_TREE_OPTIONS`, `BUILDING_FLAG_STYLE_OPTIONS`, `BUILDING_BASIC_OBJECT_OPTIONS`, `BUILDING_PLACED_OBJECT_OPTIONS`, `BUILDING_WEATHER_EFFECT_OPTIONS`, `BUILDING_WORLD_SURFACE_OPTIONS`. 각 항목은 `labelEn`·`labelKo`를 갖는다.

## 에디터 패널

편집 UI는 DOM이므로 `GaesupWorld` 안, `Canvas` 밖에 둔다. 스타일은 `import 'gaesup-world/style.css'`로 넣는다.

### `BuildingPanel` (`gaesup-world/editor`)

모드 탭과 모드별 인스펙터(환경, 벽 프리셋·모듈·회전·삭제, 에셋 재질, 타일 프리셋·커스텀 타일·지형 덮개·배치 설정·색, 블록, 오브젝트 종류별 설정, NPC)를 가진다(`src/core/editor/components/panels/BuildingPanel/index.tsx`).

| prop | 설명 |
|---|---|
| `forcedEditMode` | 이 모드로 고정하고 탭을 숨긴다. 패널이 사라질 때 이전 모드로 돌려놓는다 |
| `disabledSections` | 숨길 섹션 id: `environment`, `wallPresets`, `wallModules`, `assetMaterials`, `tilePresets`, `customTile`, `terrainCover`, `objectPresets`, `modelSettings`, `placement`, `tileColor`, `objectRotation`, `treeSettings`, `fireSettings`, `billboardSettings`, `flagSettings` |
| `slots` | `header`, `beforeInspector`, `afterWallSettings`, `afterTileSettings`, `afterObjectSettings` 자리에 끼울 노드 |
| `actions` | `{ id, label, disabled?, onClick }[]` 커스텀 버튼 |
| `npcPanel` | NPC 탭 내용. `false`면 NPC 탭을 뺀다. 함수면 `{ editMode, layout, defaultPanel }`을 받는다 |
| `npcLayout` | `'default' \| 'split' \| 'sidebars'` |
| `hideHeader`, `className`, `style`, `children` | |

`BuildingPanelProps` 타입은 공개 export가 아니므로 `React.ComponentProps<typeof BuildingPanel>`을 쓴다. NPC 탭이 있으면 패널이 NPC store의 `initializeDefaults()`를 부른다([npc-dialog-gameplay.md](npc-dialog-gameplay.md) 참고).

### `Editor` / `EditorLayout`

`<Editor />`는 월드 조작을 멈추고(키·마우스 해제, 상호작용 비활성) 에디터 셸을 띄우며, 닫힐 때 모드·카메라 설정을 되돌린다. `EditorLayout`의 기본 패널 id는 `hierarchy`, `inspector`, `project-assets`, `world`, `wall`, `tile`, `block`, `object`, `npc`, `character`, `vehicle`, `animation`, `camera`, `motion`, `performance`, `gameplay-events`, `studio`다. 건축 쪽 `world`~`npc` 패널은 `BuildingPanel`에 `forcedEditMode`를 준 내부 래퍼이며 따로 export되지 않는다.

| prop | 설명 |
|---|---|
| `hiddenBuiltInPanels` | 뺄 기본 패널 id |
| `panels` | 추가 패널 `{ id, title, component, defaultSide?, ... }`. 기본 패널과 id가 같으면 덮어쓴다 |
| `defaultActivePanels`, `defaultPanelOpen`, `panelOrder`, `panelDefaults`, `sidebarPreset` | 배치 |
| `actions`, `shortcuts`, `commandPaletteItems`, `saveStatus`, `onSave`, `playMode`·`onEnterPlayMode` 등 | 셸 동작 |

```tsx
import 'gaesup-world/style.css';
import { Editor } from 'gaesup-world/editor';

<GaesupWorld urls={urls}>
  {editing && <Editor />}
  <Canvas gl={createRenderer}>{/* ... */}</Canvas>
</GaesupWorld>
```

### `BuildingUI` (`gaesup-world/building`)

에디터 셸 없이 쓰는 가벼운 떠 있는 건축 패널이다. props: `onClose?`, `canEdit?`(기본 `true`), `npcPanel?`(기본 `false`), `extensionPanel?`.

## 저장

`buildingPlugin`(`createBuildingPlugin()`)을 런타임에 등록하면 건축 상태가 저장 키 `building`으로 저장된다. `serialize`·`prepareHydrate`·`hydrate`를 쓰고, 저장할 필드의 참조가 바뀔 때만 revision이 올라 자동 저장이 바뀐 것만 쓴다. 저장본에 `building`이 없으면 초기 상태로 되돌린다. 런타임 없이 쓰는 월드는 직접 바인딩을 등록한다.

```ts
getSaveSystem().register({
  key: 'building',
  serialize: () => useBuildingStore.getState().serialize(),
  hydrate: (data) => useBuildingStore.getState().hydrate(data as Partial<BuildingSerializedState> | null | undefined),
});
```

자세한 흐름은 [save-network.md](save-network.md).

## 알려진 제한

- 실행 취소·다시 실행이 없다. 이동·복제 도구가 없고(코드로 `update*`는 된다) 선택은 한 번에 하나다.
- 배치 오브젝트는 에디터에서 선택하거나 지울 수 없다. `removeObject(id)`로만 지운다.
- `add*` 액션은 겹침을 검사하지 않는다.
- `hydrate`는 부분 병합이 아니라 전체 교체다.
- 오브젝트에는 물리 콜라이더가 없다.
- `BuildingController`가 `NPCSystem`까지 올린다. NPC만 쓰려면 `NPCSystem`을 직접 올릴 수 있지만 둘을 함께 올리면 NPC가 두 번 그려진다.
- 편집 한 번에 보이는 그룹 전체를 다시 분류하고(PRD PERF), 불·깃발·잔디 등에 GLSL·TSL 두 경로가 남아 있다(PRD GPU-1).
- 벽 `position`이 상자 중심이 아닌 기준점이라 손으로 계산하기 어렵다. `edgeToWallTransform`을 쓴다.

## 관련 문서

- [getting-started.md](getting-started.md) · [world-runtime.md](world-runtime.md) · [rendering.md](rendering.md)
- [character-camera-input.md](character-camera-input.md) · [npc-dialog-gameplay.md](npc-dialog-gameplay.md) · [save-network.md](save-network.md)
- [performance.md](performance.md) · [api-map.md](api-map.md)
- [../dev/architecture.md](../dev/architecture.md) · [../dev/module-status.md](../dev/module-status.md)
