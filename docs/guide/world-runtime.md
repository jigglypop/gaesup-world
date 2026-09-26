# 월드와 런타임

월드 하나가 실행 중에 어떻게 구성되는지 다룬다. `GaesupWorld`와 `GaesupWorldContent`의 props, `createGaesupRuntime`이 만드는 런타임과 그 수명, store가 어느 월드를 가리키는지(store 범위), 매 프레임 코드(`useEngineFrame`), 물리 고정 스텝 시계, 플러그인까지다. 엔진 위에 게임 코드를 얹는 개발자를 위한 문서이며, 최소 월드를 먼저 띄워 보려면 [getting-started.md](getting-started.md)부터 읽는다. 이름과 기본값은 현재 작업 트리의 소스에서 확인했다.

## 구성

```text
createGaesupRuntime()              월드 하나의 store·시계·입력·NPC 시뮬레이션·플러그인·저장
└─ <GaesupWorld runtime>           런타임 범위를 열고 urls·cameraOption·mode를 월드 store에 넣는다
   ├─ DOM UI (HUD, 패널)            hook으로 같은 월드의 store를 읽는다
   └─ <Canvas gl={createRenderer}>
      └─ <GaesupWorldContent>      품질 profile, 프레임 단계, 엔진 카메라, 성능 수집, 후처리
         └─ <WorldPhysics>         Rapier + 런타임의 60Hz 고정 스텝 시계
            └─ 게임 객체 (GaesupController, BuildingController, ...)
```

런타임을 생략하면 같은 트리가 모듈 전역(legacy) store로 돈다. 아래 "store 범위"를 본다.

## `GaesupWorld` (`WorldConfigProvider`)

`GaesupWorld`는 `WorldConfigProvider`를 루트에서 다시 내보낸 이름이다(`src/core/index.ts`). `gaesup-world/runtime`에는 `WorldConfigProvider`와 `World`로만 있다. `World`는 같은 컴포넌트의 별칭이고 삭제 예정이므로 쓰지 않는다. 출처: `src/core/world/components/WorldContainer/index.tsx`, `types.ts`.

| prop | 타입 | 동작 |
|---|---|---|
| `runtime` | `GaesupRuntime` | 이 월드가 쓸 런타임. 생략하면 바깥 `GaesupRuntimeProvider`의 런타임을 물려받고, 그것도 없으면 legacy store를 쓴다 |
| `runtimeRevision` | `number` | 런타임 자체 revision에 더해져 하위 트리에 전달된다. 값을 바꾸면 `mode`·`cameraOption`이 다시 적용된다 |
| `urls` | `WorldAssetUrls` | `characterUrl`·`vehicleUrl`·`airplaneUrl`(별칭 `character`·`vehicle`·`airplane`, 긴 이름 우선)을 월드 store `urls`에 넣는다. `wheelUrl`·`ridingUrl`·`terrain`·`skybox`는 타입에만 있고 적용되지 않는다 |
| `cameraOption` | `WorldCameraOption` | `type`(필수, 카메라 모드)과 `distance`·`xDistance`·`yDistance`·`zDistance`·`height`·`fov`·`zoom`·`enableZoom`·`minZoom`·`maxZoom`·`zoomSpeed`·`enableCollision`·`smoothness` |
| `mode` | `Partial<ModeState> & { type }` | `type`: `character`·`vehicle`·`airplane`, `controller`: `keyboard`·`clicker`·`gamepad`, `control`: 카메라 모드 |
| `children` | `ReactNode` | 그대로 렌더한다. DOM을 만들지 않는다 |

적용 규칙:

- `mode`와 `cameraOption`은 layout effect에서, `urls`는 effect에서 store에 들어간다. `cameraOption.type`은 `mode.control`을 덮어쓴다.
- `cameraOption` 거리: `distance` 기본 15. `xDistance`·`zDistance`는 따로 주지 않으면 `topDown`에서 0, `firstPerson`에서 그대로, 나머지 모드에서 `distance`다. `yDistance`는 따로 주지 않으면 `height`, 그것도 없으면 `topDown`에서 `distance`, 나머지는 8이다. `smoothness`는 위치·회전·fov 보간에 같은 값으로 들어간다.
- `cameraOption`을 적용할 때마다 현재 옵션에 합친 뒤 `target`·`offset`·`focusTarget`을 지운다. `zoom`을 주지 않았으면 줌을, 그리고 초점(`focus`)을 기본값으로 되돌린다.
- 세 객체는 참조가 바뀔 때마다 다시 적용된다. 부모가 자주 렌더된다면 모듈 상수나 `useMemo`로 고정한다.

## `GaesupWorldContent`

`Canvas` 안에 캔버스마다 하나 둔다. 출처: `src/core/world/components/WorldContainer/index.tsx`.

| prop | 타입 | 기본값 | 동작 |
|---|---|---|---|
| `quality` | `'auto' \| 'low' \| 'medium' \| 'high' \| PerfProfile` | 없음 | 품질 profile을 적용한다(캔버스 픽셀 비율 최대 1.5, 그림자 preset, 후처리 preset). 생략하면 각 컴포넌트가 자기 기본값을 쓴다. [rendering.md](rendering.md) |
| `postProcessing` | `boolean \| WorldPostProcessingProps` | 없음 | 켜면 `WorldPostProcessing`을 lazy로 내려받아 캔버스 렌더를 맡긴다. 끈 월드는 그 청크를 받지 않는다. profile의 `postprocess`가 false인 tier(`low`)에서는 켜도 올리지 않는다 |
| `performance` | `boolean` | production이 아니면 켜짐 | 렌더러 통계를 월드 store에 샘플링한다. `retainPerformanceSampling()`을 잡고 있는 소비자가 있으면 꺼 두어도 켜진다. [performance.md](performance.md) |
| `showGrid` | `boolean` | `false` | 100×100 `gridHelper` |
| `showAxes` | `boolean` | `false` | 길이 10의 `axesHelper` |

올리는 것: `QualityProfileProvider`, `FrameSchedulerHost`(production이 아니면 단계별 시간 측정 켬), 엔진 `Camera`, `PerformanceCollector`(조건부), `ShadowDepthMaterials`(classic WebGL에서만 일함), `WorldPostProcessing`(조건부, 자체 `Suspense`), 그리고 `<group name="gaesup-world">` 아래의 자식. 자식과 엔진 부품은 내부 `Suspense` 경계 안에 있다.

## 런타임: `createGaesupRuntime`

`createGaesupRuntime(options?)`는 월드 하나의 합성 루트를 만든다. 모든 부품을 즉시 만들지만 DOM에는 손대지 않고, `setup()` 전까지 시계·입력·NPC·오디오 재생을 멈춰 둔다. `gaesup-world`와 `gaesup-world/runtime` 양쪽에서 export한다. 출처: `src/core/runtime/createGaesupRuntime.ts`, `types.ts`.

### 옵션 (`GaesupRuntimeOptions`)

| 옵션 | 기본값 | 뜻 |
|---|---|---|
| `worldId` | 매번 새 id | 월드의 고정 식별자. 기본 저장 namespace로 쓰인다. 영속 월드는 반드시 고정한다. 빈 문자열이면 `TypeError` |
| `navigation` | 칸 2m, −200~200m 정사각, 오를 수 있는 단차 1.1m | `NavigationConfig` 일부(`cellSize`, `worldMinX`·`worldMinZ`·`worldMaxX`·`worldMaxZ`, `maxStepHeight`). 월드가 이 범위보다 크면 직접 넓힌다 |
| `inputExtensionId` | `'interaction.input'` | 기본 입력 백엔드를 제공하는 플러그인 입력 확장 id |
| `gamepad` | 켬 | `WorldGamepadOptions`(`enabled`, `index`, `deadzone`, `lookSpeed`, `mapping`, `bindings`) 또는 `false`. 켜져 있어도 월드 store의 `mode.controller`가 `gamepad`이고 건축 편집 중이 아닐 때만 입력을 받는다 |
| `plugins` | `[]` | 생성할 때 등록하고 `setup()`에서 설치할 플러그인 |
| `pluginRuntime` | `'client'` | 이 런타임의 대상(`client`·`server`·`editor`). 플러그인의 `runtime`이 같거나 `both`인 것만 등록한다 |
| `saveSystem` | 없음 | 직접 만든 `SaveSystem`을 쓴다 |
| `saveOptions` | 없음 | `saveSystem`이 없을 때 이 옵션으로 `SaveSystem`을 만든다. 둘 다 없으면 IndexedDB(없으면 localStorage)를 `worldId`로 namespace한 기본 저장소, 기본 슬롯 `main` |
| `saveBindings` | `[]` | `setup()`에서 저장 시스템에 등록할 도메인 바인딩(`DomainBinding`) |
| `saveDiagnostics` | 기본 | 저장 진단 서비스 옵션 |
| `assets` | 없음 | `{ source, loadOnCreate }`. `loadOnCreate`면 `setup()`이 `loadAssets()`로 이 런타임의 `assetStore`를 채울 때까지 기다린다 |
| `logger` | 출력 없음 | 플러그인(`ctx.logger`)과 런타임 경고(저장 진단, 거부된 저장 바인딩, 플러그인 capability 진단)를 받을 `PluginLogger` 일부(`debug`·`info`·`warn`·`error`). 주지 않으면 모두 버려진다 |
| `onError` | `console.error` | 이 런타임이 가진 경계(시계, 이 런타임 아래 캔버스의 프레임 콜백, 플러그인 이벤트, 저장, 상호작용 명령)에서 잡힌 오류를 `setup()`부터 `dispose()`가 끝날 때까지 받는다. 다른 월드의 오류는 오지 않는다. `(error, { source, label, suppressed }) => void` |

### 런타임이 가진 것

| 묶음 | 필드 |
|---|---|
| 월드 store | `store`(모드, URL, 카메라 옵션, 성능 수치, 상호작용), `worldObjectStore`, `worldBridge`, `worldViews` |
| 도메인 store | `buildingStore`, `npcStore`, `timeStore`, `weatherStore`, `dialogStore`·`dialogRegistry`, `assetStore`, `characterStore`, `sceneStore`, `roomVisibilityStore`, `interactablesStore`, `audioStore`·`audioEngine` |
| 건축 렌더 상태 | `buildingRenderStore`, `buildingCullingStore`, `buildingVisibilityStore`, `grassManager` |
| NPC | `npcScheduler`, `npcSimulation`, `npcBrainAdapters`, `npcReinforcement` |
| 시간·시뮬레이션 | `clockLoop`(`AnimationClockLoop`, 안에 60Hz `FixedStepClock`), `stateManager`, `motions`·`motionBridge`·`animationBridge`(처음 읽을 때 만든다) |
| 입력 | `inputAdapter`, `inputScope`, `inputActions`, `gamepad` |
| 길찾기 | `navigation`(`NavigationSystem`), `clickNavigation`, `navigationObstacles` |
| 게임플레이·연출 | `gameplayEventRegistry`, `gameplayEvents`, `cinematics` |
| 확장·저장 | `plugins`(`PluginRegistry`), `pluginRuntime`, `getService()`·`requireService()`, `save`(`SaveSystem`), `saveDiagnostics`, `loadAssets()` |
| 진단 | `worldId`, `stats`(`EngineStats`: `frames`, `fixedTicks`, `clockSystems`), `reportError(error, context)`(이 런타임의 `onError` 경로로 보고) |
| 수명 | `setup()`, `dispose()`, `isActive()`, `getLifecycleRevision()`, `subscribeLifecycle(listener)` |

### 수명: `setup()`과 `dispose()`

`setup()`이 하는 일, 순서대로:

1. 월드 상호작용과 월드 브리지를 켜고, 자기 store들을 플러그인 서비스로 등록한다(`BUILDING_STORE_SERVICE`, `NPC_STORE_SERVICE`, `RUNTIME_TIME_STORE_SERVICE_ID`, `RUNTIME_GAESUP_STORE_SERVICE_ID` 등).
2. 저장 진단, 저장 시스템 서비스, `saveBindings`를 등록한다. `assets.loadOnCreate`면 자산을 불러온다.
3. `plugins.setupAll()`로 플러그인을 의존성 순서대로 설치하고, 플러그인이 올린 저장 바인딩을 등록한다.
4. 입력 백엔드를 연결하고 게임플레이 이벤트, 장면 전환, 오디오, 입력, 잔디, NPC 시뮬레이션, 게임패드, 시계를 재개한다.
5. lifecycle revision을 올린다. `GaesupRuntimeProvider` 아래 트리가 다시 렌더되어 물리·시계가 돌기 시작한다.

- 중간에 실패하면 그때까지 한 일을 되돌리고 비활성 상태로 돌아간 뒤 예외를 다시 던진다.
- `dispose()`는 모두 멈추고 플러그인을 설치 역순으로 해제하고 서비스·저장 바인딩을 지운다. 도메인 store의 데이터(건축, NPC, 시간 등)는 남고, 파생 상태(건축 렌더·컬링·가시성 store, 열린 대화, 클릭 이동 경로)는 비우며 내비게이션은 해제한다.
- `dispose()` 뒤 `setup()`을 다시 부르면 같은 데이터로 재시작한다.
- 두 호출은 한 줄로 직렬화된다. React StrictMode의 setup → dispose → setup도 안전하다.
- `GaesupWorld`와 `GaesupRuntimeProvider`는 `setup()`을 부르지 않는다. setup 전에도 그려지지만 시계·물리·입력·NPC가 멈춰 있다.

```tsx
import { useEffect, useState } from 'react';

import { createGaesupRuntime, type GaesupRuntime } from 'gaesup-world';

export function useOwnedRuntime(worldId: string): GaesupRuntime {
  const [runtime] = useState(() => createGaesupRuntime({ worldId }));
  useEffect(() => {
    runtime.setup().catch((error: unknown) => console.error(error));
    return () => {
      runtime.dispose().catch((error: unknown) => console.error(error));
    };
  }, [runtime]);
  return runtime;
}
```

`onError`로 엔진 오류를 모으는 예:

```ts
import { createGaesupRuntime } from 'gaesup-world';

export const runtime = createGaesupRuntime({
  worldId: 'village',
  onError: (error, context) => {
    // context.source: 'frame', 'clock:physics' 등, context.label: 등록 label, context.suppressed: 억제된 횟수
    console.warn(context.source, context.label, context.suppressed, error.message);
  },
});
```

### `GaesupRuntimeProvider`

런타임 범위만 여는 provider다. `GaesupWorld`가 안에서 이것을 렌더하므로 보통은 `<GaesupWorld runtime={runtime}>`로 충분하다. 월드 설정 없이 런타임 store만 쓰는 트리(월드 밖에 띄운 에디터 패널, 컴포넌트 테스트)에 직접 쓴다. 출처: `src/core/runtime/context.tsx`.

| prop | 뜻 |
|---|---|
| `runtime` | 생략(`undefined`)하면 부모 월드를 물려받고, `null`이면 명시적으로 legacy 범위를 고른다 |
| `revision` | 런타임 revision에 더할 값 |
| `children` | 하위 트리 |

런타임의 `store`와 `timeStore`를 각각의 context로 내려 주고, 런타임 lifecycle이 바뀌면 하위 트리를 다시 렌더한다. `useGaesupRuntime()`은 현재 런타임(없으면 `null`), `useGaesupRuntimeRevision()`은 revision을 돌려준다.

## store 범위

도메인 store는 `lazyScopedStore(name, createLegacy, useOwnedStore)`로 내보낸다(`src/core/stores/scopedStore.ts`).

- **hook** `useXStore(selector)`와 `useXStoreApi()`: 가장 가까운 런타임의 store를 쓴다. 런타임이 없으면 legacy 전역 store를 쓴다.
- **정적 API** `useXStore.getState()`·`setState()`·`subscribe()`: 항상 legacy 전역 store다. 런타임을 쓰는 월드에서 부르면 화면에 그려지는 store가 아닌 다른 store를 바꾼다.
- legacy store는 처음 접근할 때 만들어진다. production이 아니면 그때 store마다 한 번 `[WARN] [useBuildingStore] No runtime owns this store here, so the legacy global store was created. Legacy stores are removed in 2.0: ...` 경고를 낸다. legacy store는 2.0에서 없앨 예정이다.

| hook | 런타임 필드 |
|---|---|
| `useGaesupStore`, `useGaesupStoreApi` | `store` |
| `useBuildingStore`, `useBuildingStoreApi` | `buildingStore` |
| `useNPCStore`, `useNPCStoreApi` | `npcStore` |
| `useTimeStore`, `useTimeStoreApi` | `timeStore` |
| `useWeatherStore`, `useWeatherStoreApi` | `weatherStore` |
| `useDialogStore`, `useDialogStoreApi` | `dialogStore` |
| `useDialogRegistry`(정적 API 없음, 없으면 `getDialogRegistry()`) | `dialogRegistry` |
| `useAssetStore`, `useAssetStoreApi` | `assetStore` |
| `useCharacterStore`, `useCharacterStoreApi` | `characterStore` |
| `useSceneStore`, `useSceneStoreApi` | `sceneStore` |
| `useRoomVisibilityStore`, `useRoomVisibilityStoreApi` | `roomVisibilityStore` |
| `useAudioStore`, `useAudioStoreApi` | `audioStore` |
| `useInteractablesStore`, `useInteractablesStoreApi` | `interactablesStore` |
| `useBuildingVisibilityStore`, `useBuildingRenderStateStore`, `useBuildingGpuCullingStore` (+`Api`) | `buildingVisibilityStore`, `buildingRenderStore`, `buildingCullingStore` |
| `useWorldObjectStore`, `useWorldObjectStoreApi` | `worldObjectStore`(같은 규칙이지만 정적 API가 없다) |

런타임과 상관없이 페이지 전역인 store: `usePerfStore`(품질 profile), `useI18nStore`, `useEditorStore`, `useToastStore`, `useUIConfigStore`.

## 월드 안에서 store 읽고 쓰기

```tsx
import { useGaesupRuntime, useGaesupStore } from 'gaesup-world';
import { useBuildingStore, useBuildingStoreApi } from 'gaesup-world/building';

export function TreeCount() {
  const trees = useBuildingStore((state) => state.objects.filter((object) => object.type === 'tree').length);
  return <span>나무 {trees}그루</span>;
}

export function PlantButton() {
  const building = useBuildingStoreApi();
  const plant = () =>
    building.getState().addObject({ id: `tree-${Date.now()}`, type: 'tree', position: { x: 0, y: 0, z: 0 } });
  return <button onClick={plant}>나무 심기</button>;
}

export function TopDownButton() {
  const setMode = useGaesupStore((state) => state.setMode);
  return <button onClick={() => setMode({ control: 'topDown' })}>위에서 보기</button>;
}

export function WorldLabel() {
  const runtime = useGaesupRuntime();
  return <span>{runtime?.worldId ?? 'legacy'}</span>;
}
```

- 이 컴포넌트들은 `GaesupWorld` 아래 어디에나(캔버스 안이든 옆 DOM이든) 둔다. `GaesupWorld` 바깥이면 legacy store를 본다.
- 렌더에 쓰는 값은 selector로 구독한다. selector가 매번 새 배열·객체를 돌려주면 매 업데이트마다 다시 렌더되므로 숫자·문자열로 줄이거나 `zustand/react/shallow`의 `useShallow`를 쓴다.
- 이벤트 핸들러와 effect 안의 읽기·쓰기는 `useXStoreApi()`로 받은 store의 `getState()`를 쓴다.
- React 밖(게임 로직 모듈, 테스트, 서버)에서는 런타임 필드를 직접 쓴다: `runtime.buildingStore.getState().addObject(...)`.

## 한 페이지에 여러 월드

월드마다 런타임을 하나씩 만든다.

```tsx
import { Canvas } from '@react-three/fiber';
import {
  createRenderer,
  GaesupWorld,
  GaesupWorldContent,
  WorldInputSurface,
  type GaesupRuntime,
} from 'gaesup-world';

// useOwnedRuntime과 WorldLabel은 위 예시의 것이다.
const URLS = { characterUrl: '/gltf/trainer_green.glb' };
const CAMERA = { type: 'thirdPerson' } as const;

function Room({ runtime }: { runtime: GaesupRuntime }) {
  return (
    <GaesupWorld runtime={runtime} urls={URLS} cameraOption={CAMERA}>
      <WorldInputSurface style={{ flex: 1, position: 'relative' }}>
        <Canvas shadows="percentage" gl={createRenderer}>
          <GaesupWorldContent quality="auto">{/* 월드 내용 */}</GaesupWorldContent>
        </Canvas>
        <WorldLabel />
      </WorldInputSurface>
    </GaesupWorld>
  );
}

export function TwoRooms() {
  const a = useOwnedRuntime('room-a');
  const b = useOwnedRuntime('room-b');
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Room runtime={a} />
      <Room runtime={b} />
    </div>
  );
}
```

| 월드마다 따로 | 페이지 전역(공유) |
|---|---|
| 모든 도메인 store, 월드 store, 자산 카탈로그와 대화 레지스트리, 60Hz 시계와 게임 시간, NPC 시뮬레이션, 내비게이션, 입력 상태, 플러그인 레지스트리, 저장 시스템(namespace = `worldId`), 오류 보고(`onError`), 캔버스별 `FrameScheduler` | 품질 profile(`usePerfStore`), glTF 캐시, 기본 툰 모드(`setDefaultToonMode`), WASM 모듈, 캔버스 밖 `useEngineFrame`용 전역 `frameScheduler`, 런타임 밖 경계의 오류 보고(console) |

키보드 입력은 한 월드로만 간다. 엔진 카메라가 각 캔버스 DOM을 그 월드의 입력 표면으로 자동 등록하므로, 캔버스를 누르거나 포커스하면 그 월드가 입력을 받는다. 캔버스 옆 DOM(HUD, 버튼)도 같은 월드 입력으로 묶으려면 `WorldInputSurface`로 감싼다. 활성 월드가 둘 이상일 때 아직 아무 표면도 고르지 않았거나 표면 밖을 누른 뒤라면 키 입력은 어느 월드로도 가지 않는다. 입력 창(`input`, `textarea`, contenteditable)에 포커스가 있으면 월드는 키를 받지 않는다(`src/core/input/WorldInputScope.ts`).

## 매 프레임 코드: 프레임 단계와 `useEngineFrame`

캔버스마다 `FrameScheduler`가 하나 있고, 한 프레임에 아래 단계를 순서대로 한 번씩 돈다(`FRAME_PHASES`, `src/core/runtime/frame`). raw `useFrame` 대신 `useEngineFrame`으로 등록하면 엔진 부품과의 순서가 보장된다.

| 단계 | 엔진이 여기서 하는 일(예) |
|---|---|
| `input` | `useInputActions`가 장치를 폴링하고 액션 맵을 평가 |
| `script` | 스크립트 런타임 `update` |
| `prePhysics` | 캐릭터 물리 브리지 입력 적용, 스크립트 `fixedUpdate`, 원격 플레이어 보간. 맨 끝(`order` = `Number.MAX_SAFE_INTEGER`)에 `WorldPhysics`가 고정 스텝 시계를 전진시킨다 |
| `postPhysics` | 맨 앞(`order` = `Number.MIN_SAFE_INTEGER`)에 물리 결과를 화면 객체에 보간해 반영, 플레이어 위치 추적, 상호작용 대상, 방 가시성 |
| `animation` | 애니메이션 믹서, 캐릭터 애니메이터 |
| `lateUpdate` | 뼈 부착물, 발자국, 스크립트 `lateUpdate`, WebGL 그림자 깊이 재질 |
| `camera` | 엔진 카메라 추적과 충돌 |
| `effects` | 해·하늘의 그림자 추적, 잔디·물·불·깃발·눈, NPC LOD, 건축 가시성·GPU 컬링 |
| `snapshot` | 성능 수집(`PerformanceCollector`) |

```tsx
import { useRef } from 'react';

import type { Mesh } from 'three';
import { useEngineFrame } from 'gaesup-world';

export function Spinner() {
  const mesh = useRef<Mesh>(null);
  useEngineFrame('lateUpdate', (delta) => {
    if (mesh.current) mesh.current.rotation.y += delta;
  }, { label: 'demo:spinner' });
  return (
    <mesh ref={mesh}>
      <boxGeometry />
      <meshStandardMaterial color="#f3e3c3" />
    </mesh>
  );
}
```

콜백은 `(delta, elapsedMs)`를 받는다. `delta`는 이번 프레임 간격(초), `elapsedMs`는 캔버스 시계의 경과 시간(ms)이다.

| 옵션 | 뜻 |
|---|---|
| `label` | 오류 보고와 측정에 쓰는 이름. 기본은 단계 이름 |
| `order` | 같은 단계 안의 순서. 오름차순, 같으면 등록 순. 기본 0. 엔진 이동 콜백 뒤에 돌려면 `AFTER_MOTION_FRAME_ORDER`(10) |
| `throttleMs` | 캔버스 시계 기준으로 이 간격보다 자주 부르지 않는다. 건너뛴 프레임의 시간은 `delta`에 쌓이지 않으므로 지난 호출 이후 시간은 `elapsedMs` 차이로 계산한다 |
| `enabled` | 매 프레임 확인하는 함수. false면 그 프레임을 건너뛴다 |
| `active` | false면 등록 자체를 하지 않는다(기본 true) |
| `scheduler` | 다른 `FrameScheduler`에 등록한다. 기본은 현재 캔버스의 것 |

- R3F 순서로는 `input`~`prePhysics`가 priority −100, `postPhysics`~`snapshot`이 −1에서 돈다. 기본 priority 0인 raw `useFrame`은 엔진 단계가 모두 끝난 뒤에 돈다.
- 콜백이 예외를 던져도 다음 프레임에 다시 불린다. 보고는 등록마다 첫 오류를 바로, 그 뒤로는 1초에 한 번씩 억제된 횟수와 함께 한다(`reportThrottled`, `src/core/utils/reportError.ts`). 보고는 런타임 `onError`, 없으면 `console.error`로 간다(production에서도 나온다).
- 인스턴스가 많은 컴포넌트는 `useSharedFrame(channel, callback)`으로 같은 채널을 하나의 등록에 묶는다. 콜백은 `(delta, elapsedSeconds, three)`를 받는다.
- 캔버스 밖 DOM 컴포넌트에서 쓴 `useEngineFrame`은 전역 `frameScheduler`에 등록되고, 처음 마운트된 월드의 `FrameSchedulerHost`가 그것도 돌린다.

## `WorldPhysics`와 고정 스텝 시계

`WorldPhysics`는 `@react-three/rapier`의 `Physics`를 감싸 런타임의 고정 스텝 시계로 스텝한다. 출처: `src/core/world/components/WorldPhysics/index.tsx`, `src/core/simulation/`.

- props: `PhysicsProps`에서 `timeStep`·`updateLoop`를 뺀 전부(`gravity`, `debug`, `colliders` 등). `paused`(기본 false), `interpolate`(기본 true)는 의미가 바뀐다.
- 시계: `FixedStepClock` 60Hz, 프레임당 최대 8스텝, 한 프레임 간격은 0.25초까지만 반영하고 밀린 시간도 0.25초까지만 보관한다(나머지는 버린다). 런타임 옵션으로 바꿀 수 없다.
- 구동: 캔버스 `frameloop`가 `always`면 캔버스가 `prePhysics` 끝에서 시계를 전진시킨다. `demand`·`never`(예: `IdleFrameRate`가 잡은 캔버스)면 시계 자체의 `requestAnimationFrame`이 전진시키므로 시뮬레이션은 그리기와 상관없이 계속 돈다.
- 표시: Rapier 자체 보간은 끄고, `postPhysics` 맨 앞에서 엔진이 마지막 두 물리 상태 사이를 보간해 화면 객체에 반영한다. `interpolate={false}`면 최신 상태를 그대로 쓴다.
- `paused`는 Rapier 스텝만 멈춘다. 같은 시계의 시간·NPC 시스템은 다른 소비자(예: NPC가 있으면 `NPCSimulation`)가 시계를 잡고 있는 동안 계속 돈다. 월드 전체를 멈추려면 `runtime.clockLoop.suspend()`·`resume()`을 쓴다(`setup()`도 시계를 재개한다).
- 런타임이 비활성(setup 전, dispose 뒤)이면 스텝하지 않는다. 런타임이 없으면 legacy 시간 store의 시계를 쓴다.

고정 틱 안의 시스템 단계(`SIMULATION_PHASES`): `commands` → `simulation` → `physics` → `postSimulation` → `publish`. 게임 시간(`time`)과 NPC 시뮬레이션은 `simulation`, Rapier 스텝은 `physics`에서 돈다.

고정 스텝 코드는 두 가지로 붙인다.

```tsx
import { useWorldPhysicsStep, type GaesupRuntime } from 'gaesup-world';

// React: WorldPhysics 안에서, 매 고정 틱의 simulation 단계(Rapier 스텝 직전)에 돈다
export function Wind() {
  useWorldPhysicsStep((_state, deltaSeconds) => {
    // 몸체에 힘을 준다. deltaSeconds는 1/60
    void deltaSeconds;
  });
  return null;
}

// React 밖: 런타임 시계에 시스템을 등록한다. 반환값을 부르면 해제된다
export function registerHunger(runtime: GaesupRuntime, hunger: { value: number }) {
  return runtime.clockLoop.clock.addSystem({
    id: 'my-game:hunger',
    phase: 'postSimulation',
    update: (tick) => {
      // tick: { tick, deltaSeconds, elapsedSeconds }. 객체가 재사용되므로 보관하지 말고 값만 쓴다
      hunger.value += tick.deltaSeconds;
    },
  });
}
```

- `useWorldPhysicsStep`은 `WorldPhysics` 밖에서는 아무것도 하지 않고 false를 돌려준다.
- 시계 시스템 id는 월드 안에서 유일해야 한다. 같은 id를 다른 소유자가 등록하면 예외가 난다. 한 시스템의 예외는 그 시스템만 건너뛰고 1초에 한 번 보고된다(`source: 'clock:<phase>'`).
- 물리 몸체의 화면 객체를 엔진 보간에 태우려면 `useWorldPhysicsInterpolation(bodyRef)`가 돌려주는 ref를 시각 그룹에 붙인다.

## 플러그인

플러그인은 서비스·이벤트·저장 바인딩·확장을 런타임에 붙이는 단위다. 출처: `src/core/plugins/`.

| 필드 | 뜻 |
|---|---|
| `id`, `name`, `version` | 필수. `version`은 semver여야 한다 |
| `runtime` | `client`(기본)·`server`·`both`·`editor`. 런타임의 `pluginRuntime`과 맞는 것만 등록된다 |
| `capabilities` | 제공 기능 이름. 레지스트리 진단(충돌, 누락)에 쓴다 |
| `dependencies`, `optionalDependencies` | 플러그인 id 또는 `{ id, version }`. 의존 대상이 먼저 설치된다. 필수 의존이 없으면 `MissingPluginDependencyError` |
| `setup(ctx)` | 설치. 비동기 가능 |
| `dispose(ctx)` | 해제. 플러그인 id로 등록한 확장·서비스·저장 항목은 레지스트리가 알아서 지운다. 이벤트 구독은 직접 푼다 |

`ctx`에는 `services`, `events`, `save`, `logger`(런타임 `logger` 옵션이 없으면 출력하지 않는다), `plugins`(조회용)와 `grid`·`placement`·`assets`·`rendering`·`input`·`interactions`·`npc`·`blueprints`·`editor`·`systems`·`components` 확장 레지스트리가 있다. 런타임은 플러그인보다 먼저 자기 store를 서비스로 등록하므로, 플러그인은 서비스 키로 그 월드의 store에 닿는다.

```ts
import { createBuildingPlugin, createGaesupRuntime, createTimePlugin } from 'gaesup-world';
import { BUILDING_STORE_SERVICE } from 'gaesup-world/building';
import { defineGaesupPlugin } from 'gaesup-world/plugins';

export function createMeadowPlugin() {
  let off: (() => void) | undefined;
  return defineGaesupPlugin({
    id: 'my-game.meadow',
    name: 'Meadow seed',
    version: '1.0.0',
    setup(ctx) {
      const building = ctx.services.require(BUILDING_STORE_SERVICE);
      if (building.getState().tileGroups.size === 0) building.getState().hydrate(createMeadow());
      off = ctx.events.on<{ id: string }>('my-game:planted', ({ id }) => ctx.logger.info(`planted ${id}`));
    },
    dispose() {
      off?.();
      off = undefined;
    },
  });
}

export const runtime = createGaesupRuntime({
  worldId: 'meadow',
  plugins: [createBuildingPlugin(), createTimePlugin(), createMeadowPlugin()],
});

// await runtime.setup();
// runtime.plugins.context.events.emit('my-game:planted', { id: 'oak-1' });
// runtime.plugins.status('my-game.meadow'); // 'ready'
```

저장할 도메인을 플러그인으로 더하는 예. 런타임은 `ctx.save`에 올라온 `DomainBinding`을 저장 시스템에 등록하고, 플러그인이 해제되면 지운다.

```ts
import type { DomainBinding } from 'gaesup-world';
import { defineGaesupPlugin } from 'gaesup-world/plugins';

export function createFlagsPlugin() {
  const flags = new Set<string>();
  const binding: DomainBinding<string[]> = {
    key: 'my-game.flags',
    serialize: () => [...flags],
    hydrate: (data) => {
      flags.clear();
      for (const flag of data ?? []) flags.add(flag);
    },
  };
  return defineGaesupPlugin({
    id: 'my-game.flags',
    name: 'Flags',
    version: '1.0.0',
    setup(ctx) {
      ctx.save.register(binding.key, binding, 'my-game.flags');
    },
  });
}
```

- 엔진 도메인도 플러그인으로 온다. `createBuildingPlugin`, `createNPCPlugin`, `createTimePlugin`, `createWeatherPlugin`, `createCameraPlugin`, `createCharacterPlugin`, `createAudioPlugin`, `createScenePlugin`, `createI18nPlugin`은 그 도메인의 저장 바인딩과 서비스를 등록한다(기본 인스턴스 `buildingPlugin`, `timePlugin` 등도 있다). 월드 상태를 저장하려면 저장할 도메인의 플러그인을 `plugins`에 넣는다. `createMotionsPlugin`은 이동 런타임 서비스를 등록한다.
- `defineGaesupPlugin`은 타입만 잡아 주는 항등 함수다. 루트와 `gaesup-world/plugins` 양쪽에 있다.
- 런타임 `setup()` 뒤에 플러그인을 더하려면 `await runtime.plugins.use(plugin)`(등록 + 설치)을 쓴다. 그 플러그인의 저장 바인딩도 자동으로 등록된다. 이 경로는 `pluginRuntime` 필터를 거치지 않는다.
- `createPluginRegistry(options?)`는 런타임 없이 레지스트리만 만든다. 도구·테스트용이다: `register(plugin)`, `await setupAll()`, `await use(plugin)`, `context`, `status(id)`, `getDiagnostics()`, `await disposeAll()`. 런타임 서비스(`BUILDING_STORE_SERVICE` 등)가 없으므로 그것을 `require`하는 플러그인은 여기서 실패한다.
- 같은 id를 두 번 등록하면 `DuplicatePluginError`, 버전 범위가 맞지 않으면 `PluginVersionMismatchError`, 순환 의존은 `CircularPluginDependencyError`다.

## 현재 제한

- `GaesupWorld`는 런타임을 스스로 만들지 않는다. `runtime`을 주지 않으면 모든 store가 legacy 전역 store로 돌고 개발 모드 경고가 난다. `GaesupWorld`가 런타임을 만들고 수명을 관리하게 바꾸는 일이 PRD LIB-1에 있다.
- 직접 만든 `saveSystem`을 넘기면 그 저장 시스템의 오류는 `onError`가 아니라 만들 때 준 `report`(없으면 console)로 간다. `new SaveSystem({ adapter, report: (error, context) => ... })`로 연결한다.
- `urls`의 `wheelUrl`·`ridingUrl`·`terrain`·`skybox`는 적용되지 않는다.
- 고정 스텝 주기(60Hz)는 설정할 수 없다.

## 관련 문서

- [getting-started.md](getting-started.md) · [rendering.md](rendering.md) · [performance.md](performance.md)
- [character-camera-input.md](character-camera-input.md) · [building.md](building.md) · [npc-dialog-gameplay.md](npc-dialog-gameplay.md) · [save-network.md](save-network.md) · [api-map.md](api-map.md)
- [../dev/architecture.md](../dev/architecture.md) · [../dev/module-status.md](../dev/module-status.md) · [../../PRD.md](../../PRD.md)
