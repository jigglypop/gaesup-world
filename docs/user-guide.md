# gaesup-world 사용자 가이드

gaesup-world는 React Three Fiber 위에서 도는 웹판 Unity/Unreal이다. 렌더러는 WebGPU(`WebGPURenderer`, TSL)이고, 물리 캐릭터·카메라·건축·NPC·저장·멀티플레이·에디터를 한 월드 모델로 묶는다. 이 문서는 엔진으로 월드를 만드는 사람을 위한 것이다. 엔진 코드를 고치는 사람은 [개발자 가이드](developer-guide.md)를 본다.

> 엔진은 지금 정리 중이다. 바뀌는 순서와 이유는 루트 [`PRD.md`](../PRD.md)에 있다.

## 설치

```sh
npm install gaesup-world react@19 react-dom@19 three@0.186 three-stdlib @react-three/fiber@9 @react-three/drei@10 @react-three/rapier@2
```

- three는 r186에 맞춘다. r186은 `PCFSoftShadowMap`을 없앴고 `SunLight`(두 백엔드 CSM)를 더했다.
- WebGPU는 Chrome/Edge, Safari 26+, Firefox(Windows·Apple Silicon macOS), Android Chrome에서 기본으로 켜져 있다. 그 밖의 환경에서는 `WebGPURenderer`의 WebGL2 fallback이 같은 TSL 재질로 그린다.

## 최소 월드

```tsx
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CascadedSun, createRenderer, GaesupController, GaesupWorld, GaesupWorldContent, WorldPhysics } from 'gaesup-world';
import { BuildingController } from 'gaesup-world/building';

export function World() {
  return (
    <GaesupWorld urls={{ characterUrl: '/gltf/trainer_green.glb' }} cameraOption={{ type: 'thirdPerson' }}>
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

| 조각 | 위치 | 하는 일 |
|---|---|---|
| `GaesupWorld` | `Canvas` 바깥 | 월드 설정(모델 URL, 카메라 모드)을 월드 store에 넣는다 |
| `Canvas gl={createRenderer}` | | `WebGPURenderer`를 만들고 초기화한다. 빼면 WebGL 렌더러가 되어 TSL 경로가 꺼진다 |
| `shadows="percentage"` | | r186에서 사라진 `PCFSoftShadowMap` 대신 PCF 그림자를 쓴다 |
| `GaesupWorldContent` | `Canvas` 안 | 카메라, 프레임 단계 스케줄러, 품질 profile, 성능 수집, 후처리(켰을 때만 로드) |
| `CascadedSun` | | 해와 cascade 그림자 |
| `WorldPhysics` | | Rapier 물리와 고정 스텝 시계 |
| `GaesupController` | | 조작 캐릭터. 모델은 `GaesupWorld urls.characterUrl`에서 온다 |
| `BuildingController` | | 타일·벽·블록·오브젝트를 그리고 편집하며, NPC도 함께 올린다 |

`examples/minihome`이 이 구성에 마을 데이터와 NPC를 더한 예제다(`pnpm dev`).

## 월드와 런타임

- 월드의 상태는 도메인 store(건축, NPC, 시간, 카메라 등)에 있다. `GaesupRuntimeProvider`에 `createGaesupRuntime()`으로 만든 런타임을 주면 그 월드가 store를 소유한다. 여러 월드를 한 페이지에 띄우려면 월드마다 런타임을 둔다. 런타임은 `await runtime.setup()`으로 시작하고 `await runtime.dispose()`로 끝낸다.
- 런타임 없이 `GaesupWorld`만 쓰면 모듈 전역(legacy) store로 돌고 개발 모드에서 경고를 낸다. 이 경로는 곧 `GaesupWorld`가 런타임을 직접 소유하는 방식으로 바뀐다(PRD LIB-1).
- 컴포넌트 안에서는 hook(`useBuildingStore(selector)`, `useBuildingStoreApi()`)을 쓴다. `useBuildingStore.getState()` 같은 정적 호출은 legacy 전역 store를 가리키므로 런타임을 쓰는 월드에서는 쓰지 않는다.

## 매 프레임 코드

`useEngineFrame(phase, callback, { label })`로 등록한다. 단계는 `input` → `script` → `prePhysics` → `postPhysics` → `animation` → `lateUpdate` → `camera` → `effects` → `snapshot` 순서로 한 번씩 돈다. 한 콜백의 오류는 그 콜백만 막고, 같은 오류는 초당 한 번만 보고된다.

## 캐릭터와 카메라

- `GaesupController`: `clickToMove`로 바닥 클릭 이동, `enableKeyboard`로 키 입력을 켠다. 기본 키는 WASD·방향키 이동, Space 점프, Shift 달리기, E 상호작용이다. 터치 기기는 `<TouchControls />`를 한 번 올린다.
- 카메라 모드: `thirdPerson`, `firstPerson`, `topDown`, `sideScroll`, `isometric`, `fixed`, `chase`. `cameraOption.type`으로 시작 모드를 정하고, 실행 중에는 `useGaesupStore((s) => s.setMode)`로 `setMode({ control })`을 호출한다.
- 카메라 충돌은 캐릭터 몸 중심에서 카메라 쪽으로 구를 쓸어 가려지면 앞으로 당긴다. 장식용 메시는 `userData.intangible = true`로 빼 둔다.
- 상호작용: `<Interactable onActivate range>`로 대상을 감싸고 `<InteractionPrompt />`를 한 번 올린다.

## 건축

데이터는 `BuildingSerializedState` 하나다. 타일(바닥, `objectType`: grass·water·sand·snowfield, `shape`: box·stairs·round·ramp), 벽(`wallKind`: solid·window·door·arch·half·railing·glass), 블록(복셀형 상자), 오브젝트(tree·sakura·flag·fire·billboard·model)로 이루어진다. 격자 한 칸은 4m다.

```ts
const building = useBuildingStoreApi(); // 월드 안의 컴포넌트에서
building.getState().hydrate(village);  // 통째로 넣기
building.getState().addTile(groupId, tile); // 한 칸씩 편집
```

편집 모드는 `setEditMode('tile' | 'wall' | 'block' | 'object' | 'world' | 'npc' | 'none')`이다. 편집 UI는 `gaesup-world/editor`의 패널(`BuildingPanel` 등)을 쓴다.

## NPC

템플릿과 인스턴스로 만든다. 인스턴스의 `behavior`가 배회·순찰을, `brain`이 결정을 맡는다. 시뮬레이션은 60Hz 고정 틱에서 결정적으로 돌아서, 같은 입력이면 모든 클라이언트가 같은 NPC를 본다.

```ts
npc.addTemplate({ id: 'villager', name: 'villager', category: 'humanoid', defaultAnimation: 'idle', clothingParts: [],
  baseParts: [{ id: 'body', type: 'body', url: '/gltf/trainer_red.glb', position: [0, 0, 0] }] });
npc.addInstance({ id: 'luru', templateId: 'villager', name: '루루', position: [-6, 0, 6], rotation: [0, 0, 0], scale: [0.75, 0.75, 0.75],
  brain: { mode: 'scripted' },
  behavior: { mode: 'wander', speed: 1.2, wanderRadius: 6, waitSeconds: 2, moveAnimation: 'walk', idleAnimation: 'idle' } });
```

대화는 `DialogBox`와 대화 트리(노드·선택지·플래그)로 붙인다.

## 저장

`SaveSystem`이 도메인마다 `serialize`/`hydrate` 바인딩을 모아 슬롯에 저장한다. 기본 저장소는 IndexedDB(없으면 localStorage)이고 어댑터를 바꿀 수 있다. 런타임을 쓰면 `runtime.save`가 그 월드의 저장 시스템이다.

## 멀티플레이

`useMultiplayer({ config })`의 `connect({ roomId, playerName, playerColor })`로 방에 들어가고, `players`를 `RemotePlayer`로 그린다. `sendChat(text, { range })`은 가까운 사람에게만 말풍선을 띄운다. 클라이언트는 WebSocket JSON 프로토콜(Join·Welcome·Update·Chat·Ping·Ack)을 쓰며, 이 프로토콜을 받는 서버는 직접 둔다.

## 진입점

| import | 내용 |
|---|---|
| `gaesup-world` | 월드, 런타임, 렌더러, 캐릭터·카메라, NPC, 저장, 멀티플레이 |
| `gaesup-world/building` | 건축 데이터·컴포넌트·store |
| `gaesup-world/editor` | 에디터 셸과 패널 |
| `gaesup-world/runtime` | `createGaesupRuntime`, 저장 시스템 |
| `gaesup-world/navigation` | 격자 길찾기(WASM A*) |
| `gaesup-world/network` | 멀티플레이 클라이언트 |
| `gaesup-world/postprocessing` | 후처리(월드가 후처리를 켤 때만 로드) |
| `gaesup-world/assets`, `/avatar`, `/plugins`, `/gameplay`, `/server-contracts` | 자산 파이프라인, 아바타, 플러그인, 게임플레이 규칙, 서버 계약 |

## 성능

- `GaesupWorldContent quality="auto"`는 기기를 감지해 픽셀 비율(최대 1.5), 그림자 해상도, 후처리 preset을 고른다. `'low' | 'medium' | 'high'`로 고정할 수 있다.
- 후처리는 `postProcessing`을 켠 월드만 내려받는다.
- 입력이 없을 때 `IdleFrameRate`를 올리면 캔버스를 낮은 fps로 그린다. 기본값은 아직 매 프레임이다.
- 잔디는 삼각형이 많다. 작은 마을(12×12칸)에서 약 230만 개가 나온다.
- 수치는 `GaesupWorldContent`의 성능 수집(개발 모드 기본 켜짐)이 월드 store `performance`와 `framePhases`에 넣는다. `readRendererStats(gl.info)`로 draw·삼각형·프로그램 수를 읽는다.

## 알려진 제한

- 라이브러리 빌드가 모듈을 큰 청크로 합쳐 트리셰이킹이 약하다. 함수 하나만 import해도 수백 KB가 딸려 온다(PRD LIB-1).
- 멀티플레이 서버는 저장소에 없다.
- 런타임을 명시하지 않은 월드는 전역 store를 공유한다.
