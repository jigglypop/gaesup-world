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

## Roadmap

### Phase 1: Library Boundary

- 루트 export 최소화
- subpath exports 확장
- optional dependency 격리
- README import 문서 최신화
- npm package size 유지

### Phase 2: Plugin Core

- `PluginContext` 추가
- plugin registry 추가
- setup/dispose lifecycle 추가
- dependency resolution 추가
- runtime/editor plugin 구분
- plugin manifest 타입 추가
- plugin save namespace 설계

### Phase 3: Grid Core

- `src/core/grid` 추가
- `GridAdapter` 추가
- `SquareGridAdapter` 추가
- `FreePlacementAdapter` 추가
- `CellCoord`, `EdgeCoord`, `CornerCoord` 추가
- `gridToWorld`, `worldToGrid` 테스트 추가

### Phase 4: Placement Engine

- `PlacementEngine` 추가
- `PlacementRule` 추가
- no-overlap rule
- support rule
- wall-edge rule
- footprint rotation
- placement transaction
- undo/redo 기반 마련

### Phase 5: Building Refactor

- 기존 `buildingStore`의 `checkTilePosition`, `checkWallPosition`, `snapPosition`을 grid/placement로 이동
- `WallConfig.position + rotation`에서 `EdgeCoord` 기반 모델로 migration path 제공
- `TileConfig.position`에서 `CellCoord` 기반 모델로 migration path 제공
- renderer는 변환된 world position만 사용

### Phase 6: Cozy Game Preset

- `rendering/toon` preset 추가
- cozy camera preset 추가
- stylized material preset 추가
- contact shadow/default light rig 추가
- tile/furniture sample asset 규칙 정리
- 생활형 example 재구성

### Phase 7: Genre Expansion

- `rendering/high` path 정리
- shooter에 필요한 entity/input/camera/network extension 설계
- building 없는 minimal game example 추가
- high graphics example 추가

### Phase 8: Plugin Ecosystem

- official plugin template 추가
- plugin authoring guide 추가
- plugin validation test utility 추가
- sample plugins 추가
- third-party plugin naming/documentation 정리
- marketplace 또는 registry metadata 설계

## Immediate Recommendation

가장 먼저 할 작업은 plugin core, `grid`, `placement`를 독립 모듈로 만드는 것이다.

현재:

```txt
buildingStore
- grid constant
- snap
- tile collision
- wall collision
- edit state
- demo data
- object state
```

목표:

```txt
plugin
- setup
- dispose
- registry
- extension point

grid
- coordinate
- conversion
- neighbor query

placement
- canPlace
- place
- remove
- rotate
- rules

building/store
- selected tool
- current mode
- editor state

building/r3f
- visual preview
- mesh rendering
```

이 분리를 하면 포코피아/모동숲식 건축뿐 아니라 다른 격자 방식, 자유 배치, 슈팅 게임 맵 오브젝트 배치까지 같은 코어로 확장할 수 있다. 또한 외부 개발자가 코어를 건드리지 않고 새 장르, 새 렌더러, 새 건축 방식, 새 에디터 도구를 추가할 수 있다.
