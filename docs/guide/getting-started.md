# 시작하기

gaesup-world를 설치하고, 저장소 예제를 실행하고, 캐릭터가 걷는 최소 월드를 만든 뒤 건축 데이터와 NPC를 넣는 데까지를 다룬다. 엔진으로 월드를 처음 만드는 개발자와 이 문서를 진입점으로 읽는 다음 작업 세션을 위한 문서다. 이름·props·경로는 현재 작업 트리(`package.json` `1.1.0`)의 소스에서 확인했고, 코드 예시는 소스에 대해 타입체크했다.

## 설치

### 피어 의존성

`package.json`의 `peerDependencies`와, 저장소가 개발·검증에 쓰는 버전(`devDependencies`)이다.

| 패키지 | 허용 범위(peer) | 저장소 검증 버전 |
|---|---|---|
| `react`, `react-dom` | `^18.0.0 \|\| ^19.0.0` | 19.2 |
| `three` | `^0.168.0 \|\| ^0.178.0 \|\| ^0.185.0 \|\| ^0.186.0` | 0.186.0 |
| `three-stdlib` | `^2.36.0` | 2.36 |
| `@react-three/fiber` | `^8.17.7 \|\| ^9.0.0` | 9.7 |
| `@react-three/drei` | `^9.112.0 \|\| ^10.0.0` | 10.7.8 |
| `@react-three/rapier` | `^1.4.0 \|\| ^2.0.0` | 2.2 |
| `@react-three/postprocessing` | `^2.16.0 \|\| ^3.0.0` | 3.1 |

```sh
npm install gaesup-world react@19 react-dom@19 three@0.186 three-stdlib @react-three/fiber@9 @react-three/drei@10 @react-three/rapier@2 @react-three/postprocessing@3
```

- three는 r186에 맞춘다. GPU 인스턴스 배치(`GpuBatchBridge`)와 비동기 파이프라인 컴파일(`CompileGate`)은 three r185·r186에서만 켜지고, 다른 버전에서는 일반 경로로 그린다(`src/core/rendering/gpuBatchRevision.ts`).
- `@react-three/postprocessing`은 WebGPU만 써도 필요하다. 루트 진입점이 WebGL 전용 `ColorGrade`·`LutOverlay`·`ToonOutlines`를 함께 내보내고, 이 모듈들이 그 패키지를 정적으로 import한다. 그 패키지의 peer인 `postprocessing`은 패키지 매니저가 peer를 자동 설치하지 않으면 직접 넣는다.
- `zustand`, `immer`, `simplex-noise`, `@xyflow/react`는 일반 의존성이라 함께 설치된다.
- React 18·Fiber 8 조합은 peer 범위에 있지만 저장소는 React 19·Fiber 9로만 검증한다.
- npm 배포 상태는 레지스트리에서 확인한다. 이 문서는 저장소 소스 기준이며 배포본과 다를 수 있다.

### 스타일과 정적 파일

| 파일 | 언제 필요한가 | 방법 |
|---|---|---|
| `gaesup-world/style.css` | UI 컴포넌트(NPC 이름표, 말풍선, 에디터 패널 등)를 쓸 때 | 앱 진입점에서 `import 'gaesup-world/style.css'`. 빌드된 JS는 CSS를 스스로 불러오지 않는다(모든 스타일이 `dist/index.css` 하나에 있다) |
| `dist/wasm/gaesup_core.wasm` | 잔디 속성 생성, 눈 입자, 길찾기 A*의 WASM 가속 | 앱 정적 폴더의 `wasm/`에 복사한다. 로더는 `document.baseURI` 기준 `wasm/gaesup_core.wasm`을 fetch하고, `globalThis.__GAESUP_WASM_BASE_URL__`이 있으면 그 주소를 기준으로 쓴다. 파일이 없으면 세 기능 모두 JS 경로로 돈다(`src/core/wasm/loader.ts`) |
| `public/gltf/trainer_green.glb`, `trainer_red.glb` | 예제 캐릭터를 그대로 쓸 때 | 패키지 `files`에 들어 있다. 앱 정적 폴더로 복사해 URL로 넘긴다 |

## 저장소 예제 실행

```sh
corepack pnpm install
corepack pnpm dev
```

- Node는 `^20.19.0 || >=22.12.0`(`engines`), pnpm은 `packageManager`의 9.15.1이다. `corepack`이 그 버전을 쓴다.
- `pnpm install`은 `prepare` 스크립트로 라이브러리 빌드(`dist/`)까지 한다.
- `pnpm dev`는 Vite 개발 서버를 `http://127.0.0.1:5174/`에 띄우고 브라우저를 연다(`vite.config.ts`의 `server.host`·`port`·`open`). 5174가 차 있으면 Vite가 다음 포트를 쓴다.
- `index.html` → `examples/main.tsx`가 `examples/minihome/Minihome.tsx`를 `React.lazy`로 연다. 첫 UI 청크에 three가 들어가지 않는다.
- 예제의 `gaesup-world` import는 tsconfig `paths`(Vite `resolve.tsconfigPaths`)로 `src/`를 가리킨다. 엔진 소스를 고치면 바로 반영된다.
- 조작: WASD나 방향키로 이동, Shift 달리기, Space 점프. 키는 기본 입력 액션 표(`createDefaultInputActions`)에서 온다.
- 빌드된 패키지로 예제를 돌려 보려면 환경 변수 `GAESUP_PACKAGE_ROOT`에 패키지 루트를 주고 `pnpm dev`를 실행한다. `vite.config.ts`가 `gaesup-world` 진입점을 그 설치본의 `exports`로 바꾼다.

예제 `examples/minihome`은 12×12 타일 마을(잔디, 연못과 모래, 길, 오두막 벽 네 개, 나무·벚꽃·모닥불·깃발), 플레이어, 배회하는 NPC 두 명으로 이루어져 있다. 공개 API만 쓴다.

## 최소 월드

```tsx
import { Suspense } from 'react';

import { Canvas } from '@react-three/fiber';
import {
  CascadedSun,
  createRenderer,
  GaesupController,
  GaesupWorld,
  GaesupWorldContent,
  WorldPhysics,
} from 'gaesup-world';
import { BuildingController } from 'gaesup-world/building';

export function World() {
  return (
    <GaesupWorld urls={{ characterUrl: '/gltf/trainer_green.glb' }} cameraOption={{ type: 'thirdPerson' }}>
      <Canvas
        shadows="percentage"
        gl={createRenderer}
        camera={{ position: [0, 12, 22], fov: 50 }}
        style={{ position: 'fixed', inset: 0 }}
      >
        <color attach="background" args={['#bfe3f2']} />
        <ambientLight intensity={1.2} />
        <Suspense fallback={null}>
          <GaesupWorldContent quality="auto">
            <CascadedSun position={[30, 50, 20]} intensity={2.2} />
            <WorldPhysics>
              <GaesupController position={[0, 2, 0]} />
              <BuildingController />
            </WorldPhysics>
          </GaesupWorldContent>
        </Suspense>
      </Canvas>
    </GaesupWorld>
  );
}
```

이 코드는 런타임을 주지 않으므로 모든 store가 모듈 전역(legacy) store로 돈다. 개발 모드에서는 store마다 한 번 `[WARN] [useGaesupStore] No runtime owns this store here, ...` 같은 경고가 나온다. 한 페이지에 월드가 하나뿐이면 동작에는 문제가 없고, 런타임을 쓰는 방법은 아래 "런타임을 먼저 만들고 넣기"와 [world-runtime.md](world-runtime.md)에 있다.

### 조각별 역할과 위치

| 조각 | 둘 곳 | 하는 일 |
|---|---|---|
| `GaesupWorld` | `Canvas` 바깥 | `WorldConfigProvider`의 export 이름이다. 런타임 범위(`GaesupRuntimeProvider`)를 열고 `urls`·`cameraOption`·`mode`를 월드 store에 넣는다. DOM을 만들지 않는다. 바깥에 두어야 캔버스 옆 DOM UI도 같은 월드를 본다(R3F `Canvas`가 바깥 React context를 안으로 이어 준다) |
| `Canvas gl={createRenderer}` | | 비동기 렌더러 팩토리. WebGPU 어댑터가 있으면 `WebGPURenderer`를 만들고 `init()`을 기다린다. 없으면 classic `WebGLRenderer`를 만든다([rendering.md](rendering.md)). `gl`을 빼면 R3F 기본 `WebGLRenderer`가 되어 TSL 경로, cascade 그림자, GPU 배치가 모두 꺼진다 |
| `shadows="percentage"` | `Canvas` prop | R3F의 `shadows`(`true`)는 `PCFSoftShadowMap`을 고르는데, three r186은 이 방식을 없애고 경고와 함께 `PCFShadowMap`으로 바꾼다. `"percentage"`는 처음부터 `PCFShadowMap`을 쓴다 |
| `camera` | `Canvas` prop | 초기 카메라다. 월드가 올라오면 엔진 카메라(`GaesupWorldContent` 안의 `Camera`)가 이어서 움직인다 |
| `<ambientLight>` | `Canvas` 안 | `CascadedSun`은 directional light 하나만 만든다. 그늘이 검게 죽지 않도록 환경광을 따로 둔다 |
| `GaesupWorldContent` | `Canvas` 안, 캔버스마다 하나 | 품질 profile, 프레임 단계 스케줄러(`FrameSchedulerHost`), 엔진 카메라, 성능 수집, 후처리(켰을 때만)를 올린다. 자식은 `<group name="gaesup-world">` 아래에 들어가고 내부 `Suspense`가 로딩을 받으므로 예제의 바깥 `Suspense`는 없어도 된다. 하나를 더 두면 두 번째 스케줄러 호스트가 경고를 내고 돌지 않는다 |
| `CascadedSun` | `GaesupWorldContent` 안 | 해와 그림자. 이 안에 두어야 월드 품질 profile의 tier를 그림자 preset으로 쓴다. 바깥이면 `medium`이다 |
| `WorldPhysics` | `GaesupWorldContent` 안 | Rapier `Physics`를 런타임의 60Hz 고정 스텝 시계로 돌린다. 물리 몸체를 가진 것은 모두 이 안에 둔다 |
| `GaesupController` | `WorldPhysics` 안 | 조작 캐릭터(`ControllerWrapper`). 모델은 prop이 아니라 월드 store `urls`에서 온다. `position`, `rotation`, `colliderSize` 같은 `PhysicsEntityProps`와 `clickToMove`, `enableKeyboard`를 받는다([character-camera-input.md](character-camera-input.md)) |
| `BuildingController` | `WorldPhysics` 안 | 건축 store의 타일·벽·블록·오브젝트를 그리고 충돌체를 만든다. 편집 모드 입력을 받고, `NPCSystem`으로 NPC도 올린다. prop은 `showGrid` 하나다 |

### 캐릭터 모델 URL이 흐르는 길

1. `<GaesupWorld urls={{ characterUrl }}>`: `WorldConfigProvider`가 `characterUrl`(짧은 별칭 `character`도 받고, 둘 다 있으면 긴 이름이 이긴다)을 커밋 뒤 effect에서 월드 store의 `setUrls`로 넣는다.
2. 월드 store `urls.characterUrl`: `useGaesupStore((s) => s.urls)`로 읽을 수 있다.
3. `GaesupController` → `EntityController`: `mode.type`이 `character`이면 `urls.characterUrl`을 모델로 쓴다. URL이 비어 있는 동안(첫 커밋 직후)과 건축 편집 모드(`editMode !== 'none'`)에서는 아무것도 그리지 않는다.
4. `PhysicsEntity`가 `useGLTFAsset`(공유 캐시 `gltfAssetCache`)으로 GLB를 불러온다. 로딩 중에는 가장 가까운 `Suspense`가 받는다.

- 나중에 모델을 바꾸려면 새 `urls`로 다시 렌더하거나, 월드 안 컴포넌트에서 `const setUrls = useGaesupStore((s) => s.setUrls)`로 받아 `setUrls({ characterUrl })`를 부른다.
- `WorldConfigProvider`는 store의 URL 네 개(`characterUrl`·`vehicleUrl`·`airplaneUrl`·`ridingUrl`, 앞의 셋은 별칭 `character`·`vehicle`·`airplane`)를 넣는다.
- `urls`·`cameraOption`·`mode`는 객체가 바뀔 때마다 다시 적용된다. 부모가 자주 렌더된다면 모듈 상수나 `useMemo`로 고정한다. `cameraOption`을 다시 적용하면 초점과, `zoom`을 주지 않았다면 줌도 기본값으로 돌아간다.
- 기본 애니메이터는 `idle`·`walk`·`run`·`jump`·`fall`·`ride` 이름의 클립을 찾는다(`src/core/animation/core/animator/defaultCharacterAnimator.ts`). 예제 모델 `trainer_green.glb`에는 `idle`·`walk`·`run`만 있다.

## 건축 데이터와 NPC 넣기

### 데이터 모양

건축 월드는 `BuildingSerializedState` 하나다. `hydrate(data)`가 통째로 넣고 `serialize()`가 꺼낸다.

```ts
import type { BuildingSerializedState, TileConfig } from 'gaesup-world/building';

export function createMeadow(): BuildingSerializedState {
  const tiles: TileConfig[] = [];
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      tiles.push({
        id: `tile-${x}-${z}`,
        tileGroupId: 'ground',
        size: 1,
        position: { x: x * 4, y: 0, z: z * 4 },
        objectType: 'grass',
        objectConfig: { grassDensity: 40 },
      });
    }
  }
  return {
    version: 1,
    meshes: [{ id: 'ground', color: '#8fbf5a' }],
    tileGroups: [{ id: 'ground', name: 'ground', floorMeshId: 'ground', tiles }],
    wallGroups: [],
    blocks: [],
    objects: [{ id: 'oak-1', type: 'tree', position: { x: 8, y: 0, z: -8 } }],
    showSnow: false,
    showFog: false,
    fogColor: '#dff1ff',
    weatherEffect: 'none',
    worldSurface: 'ground',
  };
}
```

- 격자 한 칸은 4m, 높이 한 단계는 1m다(`TILE_CONSTANTS`). `hydrate`는 타일 위치를 격자에 맞춘다. 크기가 홀수인 타일은 칸 중심(크기 1이면 4의 배수 좌표)에, 짝수인 타일은 격자 모서리에 놓인다(`snapTilePosition`).
- 타일 `objectType`은 `grass`·`water`·`sand`·`snowfield`·`none`, 오브젝트 `type`은 `tree`·`sakura`·`flag`·`fire`·`billboard`·`model`이다.
- `objectConfig.grassDensity`는 m²당 잔디 잎 수이고 기본 90이다. 잔디는 가장 비싼 요소이므로 처음에는 낮게 둔다([performance.md](performance.md)).
- `hydrate`는 `version`이 1이 아니거나 아는 필드가 하나도 없거나 좌표가 유한수가 아니면 예외를 던진다.
- 예제의 전체 마을은 `examples/minihome/village.ts`에 있다. 벽, 편집 액션, 카테고리는 [building.md](building.md)를 본다.

### 예제 방식: 런타임 없이 정적 API로

`examples/minihome/Minihome.tsx`는 이렇게 넣는다(URL 처리와 배경색만 줄였다).

```tsx
import { Suspense, useLayoutEffect } from 'react';

import { Canvas } from '@react-three/fiber';
import {
  CascadedSun,
  createRenderer,
  DEFAULT_NPC_SCALE,
  GaesupController,
  GaesupWorld,
  GaesupWorldContent,
  useNPCStore,
  WorldPhysics,
} from 'gaesup-world';
import { BuildingController, useBuildingStore } from 'gaesup-world/building';

import { createVillage } from './village';

// WorldPhysics 안에 둔다. 템플릿과 인스턴스를 넣고, 내려갈 때 지운다
function Villagers() {
  useLayoutEffect(() => {
    const npc = useNPCStore.getState();
    npc.addTemplate({
      id: 'villager', name: 'villager', category: 'humanoid', defaultAnimation: 'idle', clothingParts: [],
      baseParts: [{ id: 'villager-body', type: 'body', url: '/gltf/trainer_red.glb', position: [0, 0, 0] }],
    });
    const ids = [[-6, 6], [8, -4]].map(([x, z], index) => {
      const id = `villager-${index}`;
      npc.addInstance({
        id, templateId: 'villager', name: index ? '모모' : '루루', position: [x!, 0, z!], rotation: [0, 0, 0],
        scale: [DEFAULT_NPC_SCALE, DEFAULT_NPC_SCALE, DEFAULT_NPC_SCALE],
        brain: { mode: 'scripted' },
        behavior: { mode: 'wander', speed: 1.2, wanderRadius: 6, waitSeconds: 2, moveAnimation: 'walk', idleAnimation: 'idle' },
      });
      return id;
    });
    return () => {
      const current = useNPCStore.getState();
      for (const id of ids) current.removeInstance(id);
      current.removeTemplate('villager');
    };
  }, []);
  return null;
}

export default function Minihome() {
  // 캔버스 바깥에서 건축 데이터를 통째로 넣는다
  useLayoutEffect(() => { useBuildingStore.getState().hydrate(createVillage()); }, []);
  return (
    <GaesupWorld urls={{ characterUrl: '/gltf/trainer_green.glb' }} cameraOption={{ type: 'thirdPerson' }}>
      <Canvas shadows="percentage" gl={createRenderer} camera={{ position: [0, 12, 22], fov: 50 }} style={{ position: 'fixed', inset: 0 }}>
        <ambientLight intensity={1.2} />
        <Suspense fallback={null}>
          <GaesupWorldContent quality="auto">
            <CascadedSun position={[30, 50, 20]} intensity={2.2} />
            <WorldPhysics>
              <GaesupController position={[0, 2, 0]} />
              <BuildingController />
              <Villagers />
            </WorldPhysics>
          </GaesupWorldContent>
        </Suspense>
      </Canvas>
    </GaesupWorld>
  );
}
```

런타임이 없어서 정적 API(`useBuildingStore.getState()`)와 hook이 같은 legacy 전역 store를 가리키므로 동작한다. 런타임을 쓰는 월드에서는 정적 API가 월드가 그리는 store가 아닌 다른 store를 바꾸므로 이 방식을 쓰지 않는다.

`BuildingController`는 마운트할 때 store가 아직 `initialized`가 아니면 기본 재질·카테고리·프리셋과 데모 광장을 심는다(`seedBuildingDefaults`). `hydrate`는 `initialized`를 켜므로, hydrate가 먼저 돌면 데모 광장이 생기지 않고, 나중에 돌면 타일·벽·블록·오브젝트를 통째로 바꾼다. 어느 순서든 결과는 넣은 데이터다.

### 월드 안에서 넣기: 런타임이 있어도 없어도 동작

hook으로 받은 store API는 가장 가까운 런타임의 store를, 런타임이 없으면 legacy store를 가리킨다. 월드 안(`WorldPhysics` 안이나 `GaesupWorld` 아래 DOM)에 두는 컴포넌트로 넣으면 두 경우 모두 맞다.

```tsx
import { useLayoutEffect } from 'react';

import { DEFAULT_NPC_SCALE, useNPCStoreApi } from 'gaesup-world';
import { useBuildingStoreApi } from 'gaesup-world/building';

export function Seed() {
  const building = useBuildingStoreApi();
  const npcs = useNPCStoreApi();
  useLayoutEffect(() => {
    building.getState().hydrate(createMeadow());
    const npc = npcs.getState();
    npc.addTemplate({
      id: 'villager', name: 'villager', category: 'humanoid', defaultAnimation: 'idle', clothingParts: [],
      baseParts: [{ id: 'villager-body', type: 'body', url: '/gltf/trainer_red.glb', position: [0, 0, 0] }],
    });
    npc.addInstance({
      id: 'luru', templateId: 'villager', name: '루루', position: [-6, 0, 6], rotation: [0, 0, 0],
      scale: [DEFAULT_NPC_SCALE, DEFAULT_NPC_SCALE, DEFAULT_NPC_SCALE],
      brain: { mode: 'scripted' },
      behavior: { mode: 'wander', speed: 1.2, wanderRadius: 6, waitSeconds: 2, moveAnimation: 'walk', idleAnimation: 'idle' },
    });
    return () => {
      const current = npcs.getState();
      current.removeInstance('luru');
      current.removeTemplate('villager');
    };
  }, [building, npcs]);
  return null;
}
```

- NPC는 템플릿(`NPCTemplate`: 모델 파트)과 인스턴스(`NPCInstance`: 위치, `brain`, `behavior`)로 만든다. `behavior.mode`는 `idle`·`patrol`·`wander`이고, `moveAnimation`·`idleAnimation`은 NPC 모델 안의 클립 이름이다.
- `DEFAULT_NPC_SCALE`은 0.75다. NPC는 `BuildingController`가 올리는 `NPCSystem`이 그리고, 이동은 고정 스텝 시계에서 돈다. 카메라에서 120m(이미 보이던 NPC는 135m)보다 먼 NPC는 화면에서 내리지만 시뮬레이션은 계속된다.
- cleanup에서 지워 두면 월드가 내려간 뒤 store에 NPC가 남지 않는다. legacy store와 런타임 store는 컴포넌트보다 오래 산다.
- 두뇌·행동·대화는 [npc-dialog-gameplay.md](npc-dialog-gameplay.md)를 본다.

### 런타임을 먼저 만들고 넣기

월드를 영속적으로 저장하거나 한 페이지에 여러 월드를 띄울 때는 런타임을 직접 만든다. 런타임의 store는 만들자마자 존재하므로, 캔버스가 뜨기 전에 데이터를 넣을 수 있다.

```tsx
import { Suspense, useEffect, useState } from 'react';

import { Canvas } from '@react-three/fiber';
import {
  CascadedSun,
  createGaesupRuntime,
  createRenderer,
  GaesupController,
  GaesupWorld,
  GaesupWorldContent,
  WorldPhysics,
} from 'gaesup-world';
import { BuildingController } from 'gaesup-world/building';

const URLS = { characterUrl: '/gltf/trainer_green.glb' };
const CAMERA = { type: 'thirdPerson' } as const;

export function OwnedWorld() {
  const [runtime] = useState(() => {
    const created = createGaesupRuntime({ worldId: 'meadow' });
    created.buildingStore.getState().hydrate(createMeadow());
    return created;
  });

  useEffect(() => {
    runtime.setup().catch((error: unknown) => console.error(error));
    return () => {
      runtime.dispose().catch((error: unknown) => console.error(error));
    };
  }, [runtime]);

  return (
    <GaesupWorld runtime={runtime} urls={URLS} cameraOption={CAMERA}>
      <Canvas shadows="percentage" gl={createRenderer} camera={{ position: [0, 12, 22], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <Suspense fallback={null}>
          <GaesupWorldContent quality="auto">
            <CascadedSun position={[30, 50, 20]} intensity={2.2} />
            <WorldPhysics>
              <GaesupController position={[0, 2, 0]} />
              <BuildingController />
            </WorldPhysics>
          </GaesupWorldContent>
        </Suspense>
      </Canvas>
    </GaesupWorld>
  );
}
```

- `GaesupWorld`와 `GaesupRuntimeProvider`는 `setup()`을 부르지 않는다. 직접 부른다. setup 전에도 그려지지만 시계·물리·입력·NPC가 멈춰 있다.
- `worldId`는 기본 저장 namespace다. 생략하면 매번 새 id가 만들어져 새로고침 뒤에 저장을 찾지 못한다.
- `setup`/`dispose`는 순서대로 줄을 서므로 StrictMode의 setup → dispose → setup도 안전하다. 수명과 옵션은 [world-runtime.md](world-runtime.md)에 있다.

## 다음 단계

- 런타임 수명, store 범위, 매 프레임 코드(`useEngineFrame`), 물리 시계, 플러그인: [world-runtime.md](world-runtime.md)
- 렌더러 종류, 품질 tier, 해·하늘·안개, 후처리 켜기(`GaesupWorldContent postProcessing`): [rendering.md](rendering.md)
- 입력이 없을 때 fps 낮추기(`IdleFrameRate`), 측정과 기준선: [performance.md](performance.md)
- 카메라 모드, 클릭 이동, 상호작용, 터치: [character-camera-input.md](character-camera-input.md)
- 편집 UI(`gaesup-world/editor`의 `BuildingPanel` 등)와 건축 액션: [building.md](building.md)
- 저장 슬롯과 멀티플레이 클라이언트: [save-network.md](save-network.md). 멀티플레이 서버는 저장소에 없으므로 프로토콜을 받는 서버를 직접 둔다

## 관련 문서

- [world-runtime.md](world-runtime.md) · [rendering.md](rendering.md) · [performance.md](performance.md)
- [character-camera-input.md](character-camera-input.md) · [building.md](building.md) · [npc-dialog-gameplay.md](npc-dialog-gameplay.md) · [save-network.md](save-network.md) · [api-map.md](api-map.md)
- [../dev/architecture.md](../dev/architecture.md) · [../../PRD.md](../../PRD.md)
