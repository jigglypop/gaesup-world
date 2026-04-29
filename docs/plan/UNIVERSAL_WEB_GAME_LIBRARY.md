# Universal Web Game Library Plan

`gaesup-world`의 장기 목표는 특정 데모 게임 하나가 아니라, 브라우저에서 3D 웹게임을 빠르게 만들 수 있는 범용 라이브러리가 되는 것이다.

현재 코드베이스는 생활형 샌드박스 게임에 가까운 기능을 이미 많이 갖고 있다. 월드, 캐릭터, 카메라, 모션, 상호작용, 건축, 인벤토리, 카탈로그, 제작, 농사, NPC, 대화, 퀘스트, 시간, 날씨, 저장, 네트워크, 블루프린트가 모두 존재한다. 다음 단계의 핵심은 기능을 더 많이 넣는 것이 아니라, 이 기능들을 장르와 렌더링 방식이 바뀌어도 유지될 수 있는 안정적인 코어 모델로 재정렬하는 것이다.

## Product Positioning

권장 포지션은 다음과 같다.

> React Three Fiber 기반 범용 3D 웹게임 제작 키트

생활형 샌드박스 게임을 첫 번째 성공 사례로 삼되, 구조 자체는 다음 장르를 모두 수용해야 한다.

- 포코피아, 모동숲 같은 생활형 마을/집 꾸미기 게임
- 농사, 제작, 수집, NPC 호감도 중심 게임
- 탑다운, 쿼터뷰, 아이소메트릭 RPG
- 3인칭 어드벤처
- 슈팅 게임
- 하이그래픽 WebGPU/Three.js 게임
- 에디터가 포함된 UGC 월드 제작 도구

따라서 라이브러리는 특정 격자 방식, 특정 건축 방식, 특정 렌더링 스타일에 고정되면 안 된다.

## Core Principle

가장 중요한 원칙은 데이터, 규칙, 렌더링, 에디터를 분리하는 것이다.

```txt
Game Data
- 월드 데이터
- 엔티티
- 아이템
- 건축물
- NPC
- 퀘스트
- 저장 데이터

Game Rules
- 배치 가능 여부
- 충돌
- 상호작용
- 제작 조건
- 퀘스트 조건
- NPC 스케줄

Renderer
- Three.js mesh
- React Three Fiber component
- material
- animation
- postprocess
- shader

Editor
- 건축 UI
- 블루프린트 UI
- 디버그 패널
- 데이터 편집기
```

데이터 레이어는 React, Three.js, Rapier에 의존하지 않는 방향이 이상적이다. 렌더링 레이어는 데이터 레이어를 읽어서 시각화만 담당해야 한다. 이렇게 해야 저장, 멀티플레이, 서버 검증, 테스트, 다른 렌더링 스타일 전환이 쉬워진다.

## Recommended Package Surface

루트 export는 가볍게 유지하고, 기능별 subpath를 제공한다.

```txt
gaesup-world
gaesup-world/core
gaesup-world/world
gaesup-world/grid
gaesup-world/player
gaesup-world/camera
gaesup-world/input
gaesup-world/interactions
gaesup-world/inventory
gaesup-world/catalog
gaesup-world/building
gaesup-world/building/r3f
gaesup-world/building/editor
gaesup-world/farming
gaesup-world/crafting
gaesup-world/npc
gaesup-world/dialog
gaesup-world/quests
gaesup-world/time
gaesup-world/weather
gaesup-world/save
gaesup-world/network
gaesup-world/rendering
gaesup-world/rendering/toon
gaesup-world/rendering/high
gaesup-world/blueprints
gaesup-world/blueprints/editor
gaesup-world/admin
gaesup-world/style.css
```

예상 사용 방식:

```ts
import { createWorld } from 'gaesup-world/world';
import { SquareGridAdapter } from 'gaesup-world/grid';
import { createPlacementEngine } from 'gaesup-world/building';
import { BuildingRenderer } from 'gaesup-world/building/r3f';
```

무거운 UI, 에디터, postprocessing, admin, network는 루트 import에 섞이지 않게 한다.

## World Model

범용 웹게임 라이브러리의 중심은 `World`다. `World`는 단순한 3D 씬이 아니라 게임 상태의 데이터베이스 역할을 해야 한다.

권장 기본 모델:

```ts
type WorldId = string;
type EntityId = string;
type ZoneId = string;

interface GameWorld {
  id: WorldId;
  zones: Map<ZoneId, Zone>;
  entities: Map<EntityId, GameEntity>;
  resources: ResourceRegistry;
  version: number;
}

interface GameEntity {
  id: EntityId;
  type: string;
  transform: Transform;
  components: Record<string, unknown>;
  tags?: string[];
}

interface Transform {
  position: Vec3;
  rotation?: Vec3;
  scale?: Vec3;
}
```

생활형 게임에서는 `Zone`이 다음을 표현할 수 있다.

- 마을
- 집 내부
- 방
- 던전
- 상점
- 농장
- 친구 방문 월드

슈팅 게임에서는 `Zone`이 다음을 표현할 수 있다.

- 매치 맵
- 스테이지
- 스폰 구역
- 전투 구역
- 로비

즉 `World`는 장르 중립적이어야 하고, 생활형 게임의 마을도 하나의 구현일 뿐이어야 한다.

## Grid Abstraction

현재 building 시스템은 `GRID_CELL_SIZE`, `SNAP_GRID_SIZE`, `HEIGHT_STEP` 같은 상수와 월드 좌표 기반 배치를 사용한다. 생활형 건축 데모에는 충분하지만, 범용 라이브러리가 되려면 격자 시스템을 추상화해야 한다.

격자 방식은 나중에 얼마든지 바뀔 수 있다.

- 정사각형 격자
- 반칸 격자
- 아이소메트릭 격자
- 육각형 격자
- 자유 배치
- 타일 기반 실내 건축
- 모듈러 벽/바닥 건축
- 복셀 건축
- 스플라인 도로/울타리
- 슈팅 게임용 네비게이션 그리드
- 하이그래픽 게임용 navmesh

따라서 building이 직접 특정 격자를 알면 안 된다. `GridAdapter`를 통해 좌표 변환과 배치 쿼리를 위임해야 한다.

```ts
interface GridAdapter<TCoord = unknown> {
  id: string;
  toWorld(coord: TCoord): Vec3;
  fromWorld(position: Vec3): TCoord;
  getNeighbors(coord: TCoord): TCoord[];
  equals(a: TCoord, b: TCoord): boolean;
  key(coord: TCoord): string;
}
```

정사각형 격자는 다음처럼 구현할 수 있다.

```ts
interface SquareGridCoord {
  x: number;
  z: number;
  level?: number;
}

interface SquareGridSpec {
  cellSize: number;
  heightStep: number;
  origin: 'center' | 'corner';
}
```

자유 배치 방식은 격자 좌표 대신 월드 좌표를 그대로 쓸 수 있다.

```ts
interface FreePlacementCoord {
  position: Vec3;
  rotation?: Vec3;
}
```

육각형 격자는 axial/cube coordinate를 사용할 수 있다.

```ts
interface HexCoord {
  q: number;
  r: number;
  level?: number;
}
```

핵심은 building, farming, pathfinding, interaction이 특정 좌표 타입에 갇히지 않는 것이다.

## Cell, Edge, Corner

집 건축과 마을 꾸미기를 제대로 지원하려면 cell 하나만으로 부족하다. 벽, 문, 창문, 울타리, 기둥은 서로 다른 배치 단위를 가져야 한다.

정사각형 건축 기준 권장 좌표:

```ts
interface CellCoord {
  x: number;
  z: number;
  level: number;
}

interface EdgeCoord {
  x: number;
  z: number;
  level: number;
  side: 'north' | 'east' | 'south' | 'west';
}

interface CornerCoord {
  x: number;
  z: number;
  level: number;
}
```

역할:

```txt
Cell
- 바닥
- 땅
- 가구
- 작물
- 장식
- 상호작용 지점

Edge
- 벽
- 문
- 창문
- 울타리
- 절벽 경계
- 방 경계

Corner
- 기둥
- 코너 장식
- 지붕 연결점
- 울타리 코너
```

현재 `WallConfig.position + rotation` 방식은 렌더링에는 편하지만 데이터 모델로는 약하다. 장기적으로는 `EdgeCoord` 기반 벽 모델이 더 적합하다.

```ts
interface WallInstance {
  id: string;
  wallTypeId: string;
  edge: EdgeCoord;
  attachments?: WallAttachment[];
}

interface WallAttachment {
  id: string;
  type: 'door' | 'window' | 'decoration';
  offset?: number;
}
```

## Building Architecture

건축 시스템은 다음 계층으로 나눈다.

```txt
building/model
- 타입
- 저장 포맷
- 좌표
- footprint

building/rules
- 배치 가능 여부
- 충돌
- support
- 연결 규칙

building/store
- 현재 편집 상태
- 선택된 도구
- undo/redo

building/r3f
- 렌더링
- preview ghost
- grid helper

building/editor
- UI
- 패널
- 단축키
```

핵심 API:

```ts
interface PlacementEngine<TCoord = unknown> {
  canPlace(request: PlacementRequest<TCoord>): PlacementResult;
  place(request: PlacementRequest<TCoord>): PlacementTransaction;
  remove(target: PlacementTarget): PlacementTransaction;
  move(target: PlacementTarget, to: TCoord): PlacementTransaction;
  rotate(target: PlacementTarget, rotation: Rotation): PlacementTransaction;
}
```

`canPlace`는 모든 건축 시스템의 중심이다.

검사 항목:

- 같은 위치 점유 여부
- footprint 크기
- 회전 후 footprint
- 높이와 층
- 바닥 support
- 벽/문/창문 edge 충돌
- 실내/실외 제한
- 지형 타입 제한
- 아이템 태그 제한
- 접근 가능성
- 연결 규칙
- 게임별 커스텀 규칙

규칙은 플러그인처럼 추가 가능해야 한다.

```ts
interface PlacementRule<TCoord = unknown> {
  id: string;
  test(ctx: PlacementContext<TCoord>): PlacementResult;
}
```

예:

```ts
placementEngine.use(noOverlapRule);
placementEngine.use(requiresFloorRule);
placementEngine.use(wallMustUseEdgeRule);
placementEngine.use(doorMustAttachToWallRule);
placementEngine.use(furnitureMustFaceWalkableCellRule);
```

이 구조라면 같은 코어로 다음이 가능하다.

- 모동숲식 가구 배치
- 포코피아식 집 건축
- 심즈식 방/벽 편집
- 마인크래프트식 복셀 배치
- 타워디펜스식 타일 배치
- 슈팅 게임의 엄폐물/스폰 지점 배치

## Footprint Model

배치 가능한 모든 물체는 footprint를 가져야 한다.

```ts
interface Footprint<TCoord = unknown> {
  kind: 'cell' | 'edge' | 'corner' | 'free' | 'volume';
  cells?: TCoord[];
  width?: number;
  depth?: number;
  height?: number;
  anchor?: 'center' | 'corner' | 'edge';
}
```

가구 예:

```ts
interface FurnitureDefinition {
  id: string;
  footprint: {
    kind: 'cell';
    width: 2;
    depth: 1;
    height: 1;
  };
  rotations: Array<0 | 90 | 180 | 270>;
  tags: ['indoor', 'chair'];
}
```

벽 예:

```ts
interface WallDefinition {
  id: string;
  footprint: {
    kind: 'edge';
  };
  supportsAttachments: ['door', 'window'];
}
```

자유 배치 오브젝트 예:

```ts
interface BlockDefinition {
  id: string;
  footprint: {
    kind: 'volume';
    width: number;
    depth: number;
    height: number;
    anchor: 'corner';
  };
  materialId?: string;
  tags?: Array<'wall' | 'floor' | 'terrain' | 'structure'>;
}
```

중요한 결정:

- 벽은 한 종류가 아니다. 얇은 벽, 문/창문이 붙는 벽은 `edge` 모델이 맞다.
- 마인크래프트처럼 박스를 파고 올리는 건축은 `block`/`volume` 모델이 맞다.
- 포코피아/모동숲식 바닥과 가구는 `cell` 모델이 맞다.
- 따라서 building core는 특정 벽 방식을 강제하지 않고 `cell`, `edge`, `volume`, `free` footprint를 모두 PlacementEngine에 올린다.
- 게임 플러그인은 자기 게임에 맞는 배치 방식만 켜면 된다. 예: cozy-builder는 `cell + edge`, voxel-builder는 `volume`, shooter-map-editor는 `free + volume`.

자유 배치 오브젝트 예:

```ts
interface FreeObjectDefinition {
  id: string;
  footprint: {
    kind: 'free';
    width: 1.2;
    depth: 0.8;
    height: 1.6;
  };
}
```

## Catalog and Item Model

생활형 게임에서는 모든 배치물과 소지품이 catalog item이어야 한다. 타일, 벽, 가구, 작물, 도구, 장식, 옷, 재료를 모두 별도 시스템으로만 관리하면 확장이 어렵다.

권장 모델:

```ts
interface CatalogItem {
  id: string;
  name: string;
  category: string;
  tags: string[];
  stackable?: boolean;
  price?: Price;
  asset?: AssetRef;
  placeable?: PlaceableDefinition;
  craftable?: CraftingDefinition;
  consumable?: ConsumableDefinition;
  equippable?: EquippableDefinition;
}
```

배치 가능한 아이템:

```ts
interface PlaceableDefinition {
  kind: 'tile' | 'wall' | 'furniture' | 'decor' | 'crop' | 'structure' | 'free';
  footprint: Footprint;
  allowedSurfaces?: string[];
  allowedZones?: string[];
  rotations?: number[];
}
```

이 방식은 생활형 게임 외에도 슈팅 게임에서 사용할 수 있다.

- 무기
- 탄약
- 회복 아이템
- 설치형 터렛
- 엄폐물
- 스폰 포인트
- 맵 오브젝트

즉 `CatalogItem`은 장르 중립적인 게임 리소스 정의가 되어야 한다.

## Save Format

저장 포맷은 빨리 안정화해야 한다. 나중에 바꾸기 어렵기 때문이다.

저장 데이터에는 React 컴포넌트, Three.js 객체, material instance, function을 넣지 않는다. 오직 직렬화 가능한 데이터만 들어가야 한다.

권장 구조:

```ts
interface GameSaveData {
  version: number;
  world: WorldSaveData;
  player: PlayerSaveData;
  inventory?: InventorySaveData;
  quests?: QuestSaveData;
  time?: TimeSaveData;
}

interface WorldSaveData {
  id: string;
  zones: ZoneSaveData[];
  entities: EntitySaveData[];
}

interface BuildingSaveData {
  version: number;
  grid: SerializedGridSpec;
  cells: CellInstance[];
  edges: EdgeInstance[];
  corners?: CornerInstance[];
  objects: ObjectInstance[];
}
```

버전과 migration은 필수다.

```ts
interface SaveMigrator {
  from: number;
  to: number;
  migrate(data: unknown): unknown;
}
```

## Rendering Direction

렌더링은 최소 세 가지 모드로 분리하는 것이 좋다.

```txt
rendering/toon
- 생활형 게임
- 낮은 대비
- 명확한 실루엣
- 귀여운 색감
- 간결한 재질

rendering/standard
- 일반 Three.js PBR
- 기본 조명/그림자
- 대부분의 데모에 적합

rendering/high
- 고품질 조명
- 후처리
- 고해상도 텍스처
- WebGPU/TSL
- 고급 쉐이더
```

생활형 게임 렌더링은 사실적인 PBR보다 아트 디렉션이 더 중요하다.

필요한 요소:

- 낮은 roughness/metalness 의존도
- 부드러운 toon 또는 stylized shading
- 명확한 outline 또는 rim light
- 따뜻한 hemisphere light
- 부드러운 contact shadow
- 과하지 않은 ambient occlusion
- 낮은 디테일의 귀여운 모델링
- 큰 형태의 실루엣
- 채도가 통일된 팔레트
- 작은 텍스처 노이즈
- 카메라 거리/화각 고정
- 캐릭터와 건축물의 비율 통일

## Why It Does Not Look Like Pokopia or Animal Crossing Yet

현재 화면이 포코피아나 모동숲 같은 렌더링으로 보이지 않는 이유는 기술이 부족해서라기보다, 아트 파이프라인과 렌더링 규칙이 아직 하나의 방향으로 묶이지 않았기 때문이다.

주요 원인:

1. 아트 스타일의 일관성이 부족하다.

   생활형 게임은 모델, 색, 조명, 카메라, UI가 같은 규칙을 따라야 한다. 현재는 여러 기능 데모가 섞여 있고, 바닥/벽/오브젝트/캐릭터가 하나의 비주얼 언어로 통일되어 있지 않다.

2. 모델 실루엣이 충분히 귀엽게 설계되어 있지 않다.

   모동숲류는 기술적으로 고급이어서 예뻐 보이는 것이 아니라, 비율이 강하다. 캐릭터는 머리가 크고, 몸은 작고, 건물은 둥글고, 가구는 실제보다 두껍고 단순하다. 지금 시스템은 기능 중심 mesh가 많아서 toy-like한 형태가 약하다.

3. 재질이 stylized 규칙을 따르지 않는다.

   PBR 재질을 그대로 쓰면 웹 데모 특유의 플라스틱/기본 Three.js 느낌이 난다. 생활형 게임은 색 면이 크고, roughness가 안정적이며, 금속성은 적고, 텍스처 디테일은 절제되어야 한다.

4. 조명 프리셋이 게임 톤을 만들지 못한다.

   포근한 생활형 렌더링에는 hemisphere light, soft directional light, contact shadow, 낮은 대비의 ambient occlusion, 시간대별 색온도 관리가 필요하다. 단순 기본 조명은 장난감 같은 귀여움이 아니라 프로토타입 느낌을 낸다.

5. 카메라가 아트 스타일의 일부로 고정되어 있지 않다.

   모동숲 같은 인상은 카메라 각도와 거리에서 크게 나온다. 넓은 FOV, 너무 낮은 카메라, 자유로운 회전은 생활형 미니어처 느낌을 깨뜨릴 수 있다.

6. 월드 스케일과 그리드 스케일이 아직 미학적으로 튜닝되지 않았다.

   현재 `GRID_CELL_SIZE = 4`는 기능적으로 이해하기 쉽지만, 가구/캐릭터/벽/바닥 비율이 귀여운 생활형 게임 비율과 반드시 맞지는 않는다. 격자는 수학적으로 맞아도 화면 비율이 안 맞으면 모동숲 느낌이 나지 않는다.

7. 후처리와 색 보정이 스타일 가이드화되어 있지 않다.

   LUT, saturation, contrast, bloom, outline, fog, depth cue가 하나의 preset으로 관리되어야 한다. 기능은 있어도 기본 프리셋이 없으면 매번 화면 톤이 달라진다.

8. 에셋 제작 규칙이 없다.

   라이브러리 레벨에서 에셋을 강제할 수는 없지만, 예제와 기본 프리셋에는 다음 규칙이 있어야 한다.

   - 둥근 모서리
   - 단순한 큰 면
   - 제한된 팔레트
   - 낮은 텍스처 해상도 또는 hand-painted 느낌
   - 과도한 normal map 금지
   - 작은 디테일보다 큰 형태 우선

9. 애니메이션과 피드백이 아직 생활형 감성이 아니다.

   포근한 게임은 걷기, 점프, 상호작용, 배치, 회전, 수확, 대화 진입 같은 동작에 작은 squash, anticipation, easing이 들어간다. 현재는 기능 중심 상호작용이어서 감성적 피드백이 부족하다.

10. UI가 게임 세계와 같은 톤으로 묶이지 않았다.

    생활형 게임 UI는 아이콘, 패널, 글꼴, 간격, 색상, 사운드까지 화면 톤의 일부다. 일반 디버그/관리 UI가 섞이면 게임처럼 보이기보다 툴처럼 보인다.

정리하면, 지금은 "생활형 게임 시스템"은 있지만 "생활형 게임 아트 디렉션"이 아직 없다.

## Stylized Rendering Preset

생활형 샌드박스용 기본 프리셋을 따로 제공하는 것이 좋다.

```ts
interface StylizedRenderPreset {
  palette: ColorPalette;
  lighting: LightingPreset;
  material: MaterialPreset;
  camera: CameraPreset;
  postprocess: PostprocessPreset;
  shadow: ShadowPreset;
}
```

예:

```ts
const cozyToonPreset: StylizedRenderPreset = {
  palette: {
    grass: '#79c96b',
    soil: '#b98958',
    wood: '#c88755',
    roof: '#db6f65',
    water: '#68bfe8',
  },
  lighting: {
    hemisphereIntensity: 1.1,
    sunIntensity: 1.8,
    sunColor: '#fff1d1',
    shadowSoftness: 0.65,
  },
  material: {
    roughness: 0.85,
    metalness: 0,
    toonSteps: 3,
  },
  camera: {
    mode: 'isometric',
    fov: 35,
    distance: 18,
    pitch: 42,
  },
  postprocess: {
    saturation: 1.08,
    contrast: 0.92,
    bloom: 0.08,
    outline: 0.35,
  },
  shadow: {
    contact: true,
    opacity: 0.35,
  },
};
```

이런 preset이 있어야 사용자가 별도 아트팀 없이도 처음 실행했을 때 "게임 같다"는 느낌을 받을 수 있다.

## High Graphics Path

하이그래픽 버전은 생활형 toon preset과 다른 방향이다. 같은 코어 데이터를 쓰되 렌더러만 바뀌어야 한다.

하이그래픽 모드에 필요한 것:

- 고품질 PBR material
- environment map
- cascaded shadow 또는 안정적인 soft shadow
- screen-space reflection 또는 planar reflection
- SSAO/GTAO
- bloom
- color grading
- LOD
- instancing
- occlusion culling
- texture streaming
- WebGPU/TSL path

중요한 점은 high graphics가 core building API를 바꾸면 안 된다는 것이다.

```txt
same data
same placement rules
same save format
different renderer
```

## Shooter Path

슈팅 게임은 생활형 게임과 격자/건축/렌더링 요구가 다르다. 그래도 core는 재사용할 수 있어야 한다.

공통 재사용 가능 영역:

- world
- entity
- input
- camera
- interaction
- inventory
- item catalog
- save
- network
- audio
- UI
- spatial query

슈팅 게임에서 추가로 필요한 영역:

- weapon system
- projectile/hitscan
- health/damage
- team/match state
- spawn system
- cover system
- navmesh
- prediction/reconciliation
- server authoritative networking

따라서 `building`은 core가 아니라 optional domain module이어야 한다. 슈팅 게임은 `building` 없이 `world`, `entity`, `camera`, `input`, `network`, `rendering/high`만 사용할 수 있어야 한다.

## Blueprint Direction

Blueprint는 이 라이브러리의 중요한 차별점이 될 수 있다.

확장할 blueprint 종류:

- EntityBlueprint
- CharacterBlueprint
- ItemBlueprint
- BuildingBlueprint
- RoomBlueprint
- TownBlueprint
- QuestBlueprint
- DialogBlueprint
- NPCBlueprint
- RecipeBlueprint
- RenderPresetBlueprint

예:

```ts
defineBuildingBlueprint({
  id: 'cozy-cabin',
  grid: squareGridSpec,
  cells: [],
  edges: [],
  objects: [],
});
```

Blueprint editor는 optional package로 유지해야 한다.

```ts
import { BlueprintEditor } from 'gaesup-world/blueprints/editor';
```

## Plugin Architecture

범용 웹게임 라이브러리가 되려면 플러그인 시스템이 필요하다. 플러그인은 코어를 수정하지 않고 장르, 렌더링, 건축 방식, 아이템, NPC, 퀘스트, 에디터 패널을 추가할 수 있게 해준다.

중요한 원칙은 플러그인이 강력하되 코어를 망가뜨리지 못하게 하는 것이다.

플러그인이 확장할 수 있는 영역:

- grid adapter
- placement rule
- building tool
- catalog item type
- asset loader
- renderer
- material preset
- camera controller
- input binding
- interaction type
- NPC behavior
- dialog condition
- quest objective
- crafting recipe type
- save adapter
- network transport
- editor panel
- debug overlay
- blueprint node

권장 플러그인 모델:

```ts
interface GaesupPlugin {
  id: string;
  name: string;
  version: string;
  dependencies?: string[];
  optionalDependencies?: string[];
  setup(ctx: PluginContext): void | Promise<void>;
  dispose?(ctx: PluginContext): void | Promise<void>;
}
```

플러그인 context는 명시적인 registry만 제공한다.

```ts
interface PluginContext {
  grid: GridRegistry;
  placement: PlacementRegistry;
  catalog: CatalogRegistry;
  assets: AssetRegistry;
  rendering: RenderingRegistry;
  input: InputRegistry;
  interactions: InteractionRegistry;
  npc: NpcRegistry;
  quests: QuestRegistry;
  blueprints: BlueprintRegistry;
  editor?: EditorRegistry;
  save: SaveRegistry;
  events: EventBus;
  logger: Logger;
}
```

플러그인 사용 예:

```ts
import { createGame } from 'gaesup-world/core';
import { cozyLifePlugin } from '@gaesup/plugin-cozy-life';
import { squareGridPlugin } from '@gaesup/plugin-square-grid';
import { buildingPlugin } from '@gaesup/plugin-building';

const game = createGame({
  plugins: [
    squareGridPlugin(),
    buildingPlugin(),
    cozyLifePlugin(),
  ],
});
```

플러그인 등록 예:

```ts
export function hexGridPlugin(): GaesupPlugin {
  return {
    id: '@gaesup/plugin-hex-grid',
    name: 'Hex Grid',
    version: '1.0.0',
    setup(ctx) {
      ctx.grid.register('hex', new HexGridAdapter());
    },
  };
}
```

배치 규칙 플러그인 예:

```ts
export function animalCrossingPlacementPlugin(): GaesupPlugin {
  return {
    id: '@gaesup/plugin-cozy-placement',
    name: 'Cozy Placement Rules',
    version: '1.0.0',
    setup(ctx) {
      ctx.placement.registerRule(noOverlapRule);
      ctx.placement.registerRule(requiresFloorRule);
      ctx.placement.registerRule(furnitureMustFaceWalkableCellRule);
      ctx.placement.registerRule(wallAttachmentRule);
    },
  };
}
```

슈팅 게임 플러그인 예:

```ts
export function shooterPlugin(): GaesupPlugin {
  return {
    id: '@gaesup/plugin-shooter',
    name: 'Shooter Kit',
    version: '1.0.0',
    setup(ctx) {
      ctx.catalog.registerType('weapon', weaponItemType);
      ctx.interactions.register('damageable', damageableInteraction);
      ctx.input.registerBinding('fire', defaultFireBinding);
      ctx.blueprints.registerNode('weapon-spawner', weaponSpawnerNode);
    },
  };
}
```

하이그래픽 렌더링 플러그인 예:

```ts
export function highGraphicsPlugin(): GaesupPlugin {
  return {
    id: '@gaesup/plugin-high-graphics',
    name: 'High Graphics Renderer',
    version: '1.0.0',
    setup(ctx) {
      ctx.rendering.registerPreset('high-pbr', highPbrPreset);
      ctx.rendering.registerMaterialFactory('pbr', createPbrMaterial);
      ctx.rendering.registerPostprocess('cinematic', cinematicPostprocess);
    },
  };
}
```

## Plugin Package Strategy

플러그인은 npm 패키지로 배포할 수 있어야 한다.

권장 네이밍:

```txt
@gaesup/plugin-square-grid
@gaesup/plugin-hex-grid
@gaesup/plugin-free-placement
@gaesup/plugin-building
@gaesup/plugin-cozy-life
@gaesup/plugin-farming
@gaesup/plugin-shooter
@gaesup/plugin-high-graphics
@gaesup/plugin-blueprint-editor
```

서드파티 플러그인은 다음 네이밍을 권장한다.

```txt
gaesup-plugin-my-feature
@my-scope/gaesup-plugin-my-feature
```

플러그인 패키지는 가능한 한 peer dependency를 사용해야 한다. 예를 들어 렌더링 플러그인이 `postprocessing`이나 특정 shader 라이브러리에 의존한다면, 그 의존성은 해당 플러그인 안에만 있어야 한다. 코어 패키지의 dependency가 늘어나면 안 된다.

권장 plugin package export:

```json
{
  "name": "@gaesup/plugin-square-grid",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "peerDependencies": {
    "gaesup-world": "^1.0.0"
  }
}
```

## Plugin Safety

플러그인이 코어 내부 store나 private class를 직접 만지면 장기 유지보수가 어려워진다. 따라서 플러그인은 registry와 event bus를 통해서만 기능을 추가해야 한다.

금지해야 할 패턴:

```ts
// bad
import { useBuildingStore } from 'gaesup-world/internal';
useBuildingStore.setState(...);
```

권장 패턴:

```ts
// good
ctx.placement.registerRule(customRule);
ctx.catalog.registerItem(customItem);
ctx.events.emit('catalog:itemRegistered', customItem);
```

플러그인 시스템에는 다음 안전 장치가 필요하다.

- plugin id 중복 방지
- dependency 확인
- setup 순서 보장
- dispose 지원
- registry별 schema validation
- save data namespace 분리
- plugin version 기록
- migration hook 지원
- client/server 사용 가능 여부 표시
- editor-only plugin과 runtime plugin 구분

플러그인 메타데이터 예:

```ts
interface PluginManifest {
  id: string;
  name: string;
  version: string;
  runtime: 'client' | 'server' | 'both' | 'editor';
  capabilities: string[];
  dependencies?: Record<string, string>;
}
```

저장 데이터에는 어떤 플러그인이 사용되었는지 기록해야 한다.

```ts
interface GameSaveData {
  version: number;
  plugins: Array<{
    id: string;
    version: string;
  }>;
  world: WorldSaveData;
}
```

이 정보가 있어야 나중에 저장 데이터를 열 때 필요한 플러그인을 확인하고 migration을 실행할 수 있다.

## Extension Points

코어는 다음 extension point를 공식 API로 제공해야 한다.

```ts
interface ExtensionPoints {
  registerGridAdapter(adapter: GridAdapter): void;
  registerPlacementRule(rule: PlacementRule): void;
  registerCatalogItem(item: CatalogItem): void;
  registerAssetLoader(loader: AssetLoader): void;
  registerRenderer(renderer: RendererPlugin): void;
  registerCameraController(controller: CameraController): void;
  registerInputBinding(binding: InputBinding): void;
  registerInteraction(interaction: InteractionDefinition): void;
  registerNpcBehavior(behavior: NpcBehavior): void;
  registerQuestObjective(objective: QuestObjectiveDefinition): void;
  registerBlueprintNode(node: BlueprintNodeDefinition): void;
  registerEditorPanel(panel: EditorPanelDefinition): void;
  registerSaveAdapter(adapter: SaveAdapter): void;
}
```

이 extension point들이 안정화되면 `gaesup-world`는 단일 라이브러리가 아니라 작은 게임 엔진 생태계처럼 확장될 수 있다.

## API Design Rules

공개 API는 다음 기준을 따라야 한다.

1. data API는 React 없이 사용할 수 있어야 한다.
2. renderer API는 data API 위에 얹혀야 한다.
3. editor API는 renderer와 data API를 조합해야 한다.
4. optional dependency는 subpath 안에 가둔다.
5. 저장 포맷에는 함수와 class instance를 넣지 않는다.
6. 모든 장기 데이터에는 version을 둔다.
7. 좌표계는 adapter로 교체 가능해야 한다.
8. 배치 규칙은 plugin처럼 추가 가능해야 한다.
9. 기본 preset은 제공하되 강제하지 않는다.
10. examples는 라이브러리의 철학을 보여주는 제품 수준의 샘플이어야 한다.
11. 플러그인은 registry와 event bus를 통해서만 코어를 확장해야 한다.
12. runtime plugin과 editor-only plugin을 분리해야 한다.
13. 플러그인 save data는 namespace와 version을 가져야 한다.

## Current Platform Audit

현재 코드베이스는 초기 계획보다 이미 많이 진행되어 있다. `package.json`은 `./runtime`, `./editor`, `./assets`, `./network`, `./server-contracts`, `./blueprints` 같은 subpath export를 제공하고, `src/core/runtime/createGaesupRuntime.ts`는 plugin setup/dispose, asset loading, save binding 등록을 한 곳에서 묶는다. `src/core/plugins`에는 `PluginRegistry`, `PluginContext`, `ExtensionRegistry`, event bus, plugin manifest가 들어가 있으며, `building`, `camera`, `motions`는 플러그인 형태로 진입점을 갖고 있다.

따라서 다음 단계는 플러그인 시스템을 새로 만드는 것이 아니라, 이미 있는 runtime/plugin/save 구조를 실제 도메인 코드의 단일 통합 경로로 만드는 것이다.

### Already Strong

- `PluginRegistry`가 중복 plugin 방지, dependency setup 순서, optional dependency, dispose 역순 처리를 지원한다.
- `PluginContext`가 `grid`, `placement`, `catalog`, `assets`, `rendering`, `input`, `interactions`, `npc`, `quests`, `blueprints`, `editor`, `save`, `services`, `systems`, `components` registry를 제공한다.
- `createGaesupRuntime`이 plugin이 등록한 save binding을 `SaveSystem`에 연결한다.
- `building` plugin은 `grid`, `placement`, `save`, `services`를 등록해서 현재 가장 좋은 기준 구현에 가깝다.
- `server-contracts`와 `platform/snapshot`이 서버/스냅샷 방향의 최소 표면을 갖고 있다.
- TypeScript strict 설정이 강하다. `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`가 켜져 있다.

### Main Gaps

- 저장 경로가 `SaveSystem`과 `SaveLoadManager + window.__gaesupStores`로 나뉘어 있다.
- `camera` plugin은 system factory만 등록하고 save domain을 등록하지 않는다.
- `motions` plugin은 `physics.bridge`, `interaction.input`을 등록하지만, `usePhysicsBridge`는 여전히 `BridgeFactory.getOrCreate`, fallback singleton, DOM event를 직접 사용한다.
- `InteractionSystem`은 singleton 중심이라 input backend, replay input, network authority input을 교체하기 어렵다.
- `ExtensionRegistry<TValue = unknown>` 기본값이 너무 느슨해서 핵심 extension의 value contract가 약하다.
- `BuildingUI`가 `authStore`, `npcStore`, `buildingStore`를 직접 import해서 building UI, admin policy, NPC 선택 책임이 섞여 있다.
- `SaveSystem`은 serialize/hydrate 실패를 조용히 삼킨다. 플랫폼 품질 기준에서는 logger 또는 diagnostics가 필요하다.
- `SaveLoadManager`는 `localStorage`, `document`, `Blob`, `URL`에 직접 의존해서 서버/테스트/비브라우저 환경에서 재사용하기 어렵다.
- ESLint가 테스트 파일을 ignore하고 있어 테스트 코드 품질과 import boundary 문제가 숨어도 잡기 어렵다.

## Updated Execution Roadmap

### Phase 0: Baseline and Repository Hygiene

목표는 플랫폼 작업 전에 현재 상태를 신뢰 가능한 기준선으로 고정하는 것이다.

- `src/core/...`와 `src\core\...` 형태로 보이는 경로 중복을 확인하고 정리한다.
- `demo-dist` 같은 빌드 산출물 변경과 실제 소스 변경을 분리한다.
- `npm run lint`, `npm test`, `npm run build:types` 결과를 기준선으로 기록한다.
- 테스트 파일을 ESLint에서 전부 제외하는 정책을 재검토한다.
- 새 플랫폼 작업은 산출물 변경과 섞지 않는다.

완료 기준:

- 소스 변경과 빌드 산출물 변경이 분리되어 있다.
- lint/test/type build의 현재 실패 목록이 명확하다.
- 플랫폼 작업 PR 또는 commit이 리뷰 가능한 단위로 나뉜다.

### Phase 1: Persistence Unification

목표는 모든 게임 상태 저장/복원을 `SaveSystem` 중심으로 통합하는 것이다. 이 단계가 가장 먼저 필요하다. 저장 포맷은 나중에 바꾸기 어렵고, 멀티플레이/서버/에디터/방문 월드가 모두 저장 모델 위에 올라가기 때문이다.

현재 문제:

```txt
runtime path
- createGaesupRuntime
- SaveSystem
- ctx.save.register

world path
- persistenceSlice
- SaveLoadManager
- window.__gaesupStores
- localStorage 직접 접근
```

목표:

```txt
runtime
- plugin setup
- save domain registration
- world/player snapshot creation

save
- domain binding
- adapter
- migration
- diagnostics

world persistence
- SaveSystem 기반 facade
- file import/export만 별도 adapter로 분리
```

작업:

- `persistenceSlice`에서 `window.__gaesupStores` 의존을 제거한다.
- `building`, `camera`, `npc`, `time`, `weather`, `audio` 등을 domain binding으로 저장한다.
- `SaveLoadManager`는 legacy 또는 file import/export helper로 축소한다.
- `SaveSystem.save/load`가 domain별 실패를 diagnostics로 남기게 한다.
- world snapshot과 player progress를 `src/core/platform/snapshot.ts`의 domain 목록과 맞춘다.

완료 기준:

- world save/load가 `window.__gaesupStores` 없이 동작한다.
- building + camera + npc 최소 round-trip 테스트가 있다.
- serialize/hydrate 실패가 조용히 사라지지 않고 logger 또는 result로 드러난다.

### Phase 2: Camera Save Domain

목표는 `camera`를 `building`과 같은 수준의 plugin citizen으로 올리는 것이다.

작업:

- `createCameraPlugin`에 `saveExtensionId`와 `storeServiceId` 옵션을 추가한다.
- camera position, rotation, mode, settings를 `ctx.save.register('camera', ...)`로 등록한다.
- camera state 접근 경로를 service로 노출한다.
- `createGaesupRuntime` 통합 테스트에 camera save binding을 추가한다.

완료 기준:

- camera plugin setup 후 `runtime.save.getBindings()`에 `camera` domain이 포함된다.
- 저장 후 camera state를 변경하고 load하면 이전 상태로 복원된다.
- world persistence가 camera를 별도 window store에서 읽지 않는다.

### Phase 3: Motions Runtime Integration

목표는 motions가 plugin registry에 등록한 bridge/input을 실제 hook이 사용하게 만드는 것이다.

현재 문제:

```txt
usePhysicsBridge
- BridgeFactory.getOrCreate('physics')
- fallback new PhysicsBridge()
- createInteractionInputAdapter() 직접 호출
- window/document teleport event 직접 구독
```

목표:

```txt
usePhysicsBridge
- runtime context 또는 resolver에서 physics bridge 획득
- ctx.input의 adapter factory 사용
- ctx.events 기반 teleport 이벤트 사용
- singleton은 default adapter 내부로 격리
```

작업:

- `GaesupRuntime`에 plugin context 접근 또는 runtime resolver API를 추가한다.
- `usePhysicsBridge`가 `physics.bridge`와 `interaction.input`을 주입받을 수 있게 한다.
- DOM teleport event는 compatibility adapter로 분리하고 내부 기본 경로는 `ctx.events`로 바꾼다.
- bridge fallback 생성은 테스트 또는 non-runtime 환경에서만 명시적으로 사용한다.

완료 기준:

- motions plugin을 교체하면 hook이 교체된 bridge/input을 사용한다.
- runtime 미설정 fallback 경로가 명시적이고 테스트되어 있다.
- DOM event 없이도 teleport 요청이 처리된다.

### Phase 4: Interaction Backend Abstraction

목표는 interaction/input이 singleton 하나에 고정되지 않도록 만드는 것이다.

작업:

- `InteractionSystem.getInstance()`를 직접 쓰는 경로를 adapter 뒤로 숨긴다.
- keyboard/mouse/gamepad/replay/network input backend 공통 인터페이스를 정의한다.
- `ctx.input`에 backend 또는 adapter factory를 등록한다.
- motions, UI prompt, interaction target query가 같은 input source를 사용하게 한다.

완료 기준:

- default backend는 기존 동작을 유지한다.
- 테스트에서 fake input backend를 등록해 motions 또는 interaction을 구동할 수 있다.
- replay/network input을 추가할 수 있는 확장 지점이 생긴다.

### Phase 5: Typed Extension Registry

목표는 registry의 유연성은 유지하되 핵심 extension contract는 컴파일 타임에 잡는 것이다.

작업:

- 핵심 extension ID를 상수로 정의한다.
- `systems`, `input`, `save`, `services`에 타입 맵을 도입한다.
- `PluginManifest.dependencies`에 semver range를 반영한다.
- plugin setup 전 manifest validation을 추가한다.
- capability 충돌 또는 누락 진단을 제공한다.

완료 기준:

- `physics.bridge`, `interaction.input`, `building.store`, `camera.system`, `camera.store` 같은 핵심 extension은 잘못된 value를 등록하기 어렵다.
- plugin dependency version mismatch를 setup 전에 알 수 있다.
- registry 충돌 메시지가 plugin id와 extension id를 모두 포함한다.

### Phase 6: UI Decoupling

목표는 core domain UI가 앱 정책과 강하게 결합되지 않게 하는 것이다.

현재 문제:

```txt
BuildingUI
- useBuildingStore 직접 사용
- useAuthStore 직접 사용
- useNPCStore 직접 사용
- editor/admin/npc 선택 책임 혼합
```

작업:

- `BuildingUI`를 순수 building panel과 app/admin extension panel로 분리한다.
- auth, NPC template 선택, admin-only control은 optional props 또는 plugin-provided component로 분리한다.
- `ctx.components` 또는 `ctx.services`를 통해 UI capability를 주입하는 경로를 만든다.
- core building package는 building store/service contract만 알게 한다.

완료 기준:

- building UI를 auth/NPC 없이 사용할 수 있다.
- admin 기능을 꺼도 building panel이 깨지지 않는다.
- 다른 게임이 자체 NPC/auth 시스템을 주입할 수 있다.

### Phase 7: Network and Server Authority

목표는 `NetworkAdapter`를 단순 transport에서 게임 플랫폼 네트워크 계약으로 확장하는 것이다.

작업:

- `GameCommand`, `ServerEvent`, `StateDelta`, `SnapshotAck` 타입을 추가한다.
- `NetworkMessageType`을 domain별 command/event로 확장한다.
- `WorldSnapshot`과 visit room snapshot 형식을 정렬한다.
- server-side plugin host 설계를 시작한다.
- client-only, server-only, both plugin runtime을 실제 bootstrap에서 구분한다.

완료 기준:

- 클라이언트가 보내는 입력/명령과 서버가 확정하는 상태 변경이 타입으로 분리된다.
- visit world, multiplayer room, player progress가 같은 snapshot 원칙을 따른다.
- server contract가 클라이언트 구현 세부사항에 의존하지 않는다.

### Phase 8: Content and Plugin Ecosystem

목표는 외부 개발자가 코어를 건드리지 않고 게임 장르, 콘텐츠, 렌더러를 추가할 수 있게 하는 것이다.

작업:

- official plugin template을 만든다.
- plugin validation test utility를 제공한다.
- content catalog manifest에 schema version을 둔다.
- asset loading fallback과 loaded catalog 상태를 구분한다.
- sample plugin을 최소 세 가지 제공한다: cozy-life, high-graphics, shooter-kit.

완료 기준:

- 새 plugin을 별도 package로 만들고 runtime에 등록하는 예제가 있다.
- manifest validation, dependency validation, save namespace validation이 테스트된다.
- core package dependency가 plugin-specific dependency로 오염되지 않는다.

## Quality Risk Register

| Risk | Impact | Fix |
| --- | --- | --- |
| 저장 경로 이중화 | 저장 데이터 shape 분기, 복원 실패, 서버 동기화 어려움 | `SaveSystem` 중심으로 통합 |
| `window.__gaesupStores` | 멀티 런타임, 테스트, SSR, 서버 검증 어려움 | runtime injection 또는 save domain binding 사용 |
| singleton/global bridge | plugin 교체 불가, 테스트 격리 어려움 | `ctx.systems`, `ctx.input`, `ctx.events` 사용 |
| 느슨한 registry 타입 | extension value mismatch를 런타임에서야 발견 | typed registry와 extension ID 상수 도입 |
| save error swallow | 데이터 손상 또는 실패가 사용자에게 숨음 | diagnostics/logger/result 추가 |
| DOM API 직접 의존 | 서버/worker/non-browser 재사용 불가 | adapter로 분리 |
| UI와 app policy 결합 | domain UI 재사용 어려움 | props/service/plugin component로 주입 |
| 테스트 lint 제외 | 테스트 코드 품질 저하 | 테스트 파일 lint 정책 재검토 |
| dependency version 미검증 | plugin 조합 실패를 늦게 발견 | manifest validation 추가 |
| logger noop 기본값 | 운영 관측성 부족 | runtime logger 주입과 plugin diagnostics 제공 |

## Immediate Recommendation

가장 먼저 할 작업은 `SaveSystem` 중심의 저장 통합이다. 이전 계획의 plugin core, grid, placement는 이미 상당 부분 들어와 있으므로, 지금은 새 구조를 더 만들기보다 실제 코드 경로를 하나로 정렬해야 한다.

권장 첫 작업 순서:

1. `persistenceSlice`의 `window.__gaesupStores` 제거 계획 수립
2. `camera` save binding 추가
3. `building + camera` runtime save round-trip 테스트 추가
4. `SaveSystem` diagnostics 추가
5. `SaveLoadManager`를 legacy/file helper로 축소
6. `usePhysicsBridge`가 plugin context의 bridge/input을 쓰도록 변경
7. `InteractionSystem` singleton을 default backend adapter 뒤로 이동

이 순서가 끝나면 `gaesup-world`는 단순 기능 묶음이 아니라, 런타임이 plugin을 조립하고, domain state를 저장하며, 입력/물리/상호작용을 교체 가능한 방식으로 연결하는 통합 게임 플랫폼에 가까워진다.
