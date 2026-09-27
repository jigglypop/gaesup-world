# NPC·대화·게임플레이 규칙

NPC 데이터(템플릿·인스턴스), 행동과 두뇌, 고정 틱 시뮬레이션, 내비게이션 연결, 대화 트리, 트리거→조건→액션 규칙 엔진을 다룬다. 마을 주민과 이벤트를 만드는 개발자를 위한 문서다. 엔진에는 아이템·퀘스트 같은 장르 규칙이 없고, 게임은 `custom` 확장점(대화 효과·조건, 규칙 조건·액션, NPC 두뇌 어댑터)으로 자기 규칙을 붙인다. 이름과 기본값은 현재 작업 트리의 소스에서 확인했다.

## 구성

| 조각 | 어디서 | 역할 |
|---|---|---|
| NPC store | `useNPCStore(selector)`, `useNPCStoreApi()`, `runtime.npcStore` | 템플릿·인스턴스·두뇌 블루프린트 등 저장되는 데이터 |
| `NPCSystem` | `BuildingController`가 올린다 | NPC 렌더, 거리 LOD와 가시 상한(`maxVisible`, 가까운 순), 화면 밖 NPC 숨기기, 편집 클릭, 건축 장애물을 내비게이션에 넣기 |
| `NPCSimulation` | `runtime.npcSimulation` | 이동·결정·말하기. 고정 틱(60Hz)에서 돈다 |
| 두뇌 어댑터 | `runtime.npcBrainAdapters`, `registerNPCBrainAdapter` | `scripted` 외 두뇌의 결정 |
| 대화 | `runtime.dialogRegistry`(legacy는 `getDialogRegistry()`), `useDialogRegistry()`, `useDialogStore`, `<DialogBox />` | 대화 트리와 실행 |
| 규칙 엔진 | `runtime.gameplayEvents`, `gaesup-world/gameplay` | 트리거→조건→액션 |

NPC·대화 API는 루트 `gaesup-world`에만 있다. 런타임 없이(legacy) 쓰면 시뮬레이션이 `NPCSystem` 안에서 만들어지고, 그 객체를 꺼내는 공개 API가 없어 `speak`·`setActor`·`getPose`를 쓸 수 없다. 이 문서의 시뮬레이션 기능은 `createGaesupRuntime()` 월드를 전제로 한다([world-runtime.md](world-runtime.md)).

## NPC 데이터

출처: `src/core/npc/types/index.ts`, `src/core/npc/stores/*`

### 템플릿 `NPCTemplate`

| 필드 | 설명 |
|---|---|
| `id`, `name`, `description?` | |
| `category` | `'humanoid' \| 'creature' \| 'robot'` |
| `fullModelUrl?` | 애니메이션을 가진 단일 모델. 있으면 이 경로로 그린다 |
| `baseParts`, `clothingParts`, `accessoryParts?` | `NPCPart[]`. `fullModelUrl`이 없을 때 부위를 조립해 그린다 |
| `defaultAnimation?`, `defaultClothingSet?` | |

`NPCPart`: `{ id, type: 'body' | 'hair' | 'top' | 'bottom' | 'shoes' | 'glasses' | 'hat' | 'accessory' | 'weapon', url, position?, rotation?, scale?, color?, category?, metadata? }`. 부위 GLB는 각자 애니메이션을 재생하며, 불러오지 못하면 반투명 상자로 대신한다.

그리는 경로는 두 가지다(`src/core/npc/components/NPCInstance/index.tsx`). `fullModelUrl`(또는 인스턴스 `metadata.modelUrl`)이 있으면 물리 엔티티 한 개(키네마틱 캡슐)로, 없으면 부위 목록(템플릿 부위 + 의상 세트 + `customParts`, 같은 `type`은 교체)으로 그린다.

### 인스턴스 `NPCInstance`

루트에서 이 데이터 타입은 `NPCInstanceData`라는 이름으로 가져온다(`NPCInstance`는 같은 이름의 렌더 컴포넌트가 쓴다).

| 필드 | 설명 |
|---|---|
| `id`, `templateId`, `name` | |
| `position`, `rotation`, `scale` | `[x, y, z]` 튜플. 새 NPC 기본 배율은 `DEFAULT_NPC_SCALE`(0.75) |
| `behavior?` | 이동 방식([행동](#행동-behavior)) |
| `brain?` | 결정 방식([두뇌](#두뇌-brain)) |
| `perception?` | `{ enabled, sightRadius, hearingRadius, fieldOfView? }`. 없으면 아무것도 보지 못한다 |
| `volume?` | `{ height, radius, interactionRadius }`, 기본 1.8 / 0.32 / 1.6m. 몸 캡슐은 `scale`을 따르고 상호작용 센서 반지름은 월드 m |
| `currentAnimation?`, `currentClothingSetId?`, `customParts?` | |
| `navigation?` | 시뮬레이션이 쓰는 이동 상태. 직접 넣지 않고 `setNavigation`을 쓴다 |
| `events?` | `NPCEvent[]`([NPC 이벤트](#npc-이벤트)) |
| `metadata?` | `modelUrl`, `nameTag`, `dialogue` 등 |

### 추가와 제거

```tsx
import { DEFAULT_NPC_SCALE, useNPCStoreApi } from 'gaesup-world';

function Villagers() {
  const npc = useNPCStoreApi();
  useLayoutEffect(() => {
    const store = npc.getState();
    store.addTemplate({ id: 'villager', name: 'villager', category: 'humanoid', fullModelUrl: '/gltf/trainer_red.glb',
      baseParts: [], clothingParts: [], defaultAnimation: 'idle' });
    store.addInstance({ id: 'luru', templateId: 'villager', name: '루루', position: [-6, 0, 6], rotation: [0, 0, 0],
      scale: [DEFAULT_NPC_SCALE, DEFAULT_NPC_SCALE, DEFAULT_NPC_SCALE],
      brain: { mode: 'scripted' },
      perception: { enabled: true, sightRadius: 8, hearingRadius: 4 },
      behavior: { mode: 'wander', speed: 1.2, wanderRadius: 6, waitSeconds: 2, moveAnimation: 'walk', idleAnimation: 'idle' } });
    return () => { const s = npc.getState(); s.removeInstance('luru'); s.removeTemplate('villager'); };
  }, [npc]);
  return null;
}
```

- 인스턴스 액션: `addInstance`, `updateInstance(id, patch)`, `removeInstance`, `createInstanceFromTemplate(templateId, position)`, `updateInstanceBehavior`·`updateInstanceBrain`·`updateInstancePerception`·`updateInstanceVolume`(부분 병합), `updateInstancePart`, `changeInstanceClothing`, `addInstanceEvent`·`removeInstanceEvent`, `executeInstanceAction(s)`, `setNavigation(id, waypoints, speed = 3)`, `clearNavigation`.
- 카탈로그 액션: `addTemplate`·`updateTemplate`·`removeTemplate`, 분류·의상 세트·의상 분류·애니메이션의 `add/update/remove`, `addBrainBlueprint`·`updateBrainBlueprint`·`removeBrainBlueprint`.
- `updateInstance`로 `position`을 바꾸면 시뮬레이션 자세와 배회 중심(home)이 그 자리로 옮겨진다.
- `createInstanceFromTemplate`은 기본 부피·지각(시야 8m)·행동(`idle`, 속도 2.2)과 기본 두뇌를 붙인다.

`initializeDefaults()`는 기본 애니메이션(idle·walk·run), 기본 블루프린트 두 개(`npc-blueprint-wander`, `npc-blueprint-greet-nearest`), 기본 템플릿(`trainer-green`, `trainer-red`, `/gltf/trainer_*.glb`)을 한 번 심고, **`brain`이 없는 인스턴스에 기본 두뇌(`mode: 'reinforcement'`, `policyId: 'openai'`)를 붙인다.** 에디터 `BuildingPanel`의 NPC 탭이 이 함수를 부른다. 두뇌를 의도대로 쓰려면 인스턴스마다 `brain`을 명시한다(`{ mode: 'none' }`도 명시로 인정된다).

## 행동 `behavior`

`NPCBehaviorConfig`: `{ mode: 'idle' | 'patrol' | 'wander', speed, loop?, waypoints?, wanderRadius?, home?, waitSeconds?, pauseSeconds?, turnSpeed?, faceOnInteract?, glance?, gestures?, greetAnimation?, strideSpeed?, idleAnimation?, moveAnimation?, arriveAnimation? }`.

- 행동은 두뇌가 `scripted`(또는 정책 서버가 없는 `reinforcement`)일 때 결정의 기본값이 된다. 두뇌가 없거나 `none`이면 NPC는 결정하지 않고 서 있다.
- `wander`: 이동 중이 아닐 때마다 `home`(없으면 처음 놓인 자리)에서 `wanderRadius`(기본 4m) 안의 한 점으로 간다. 점은 NPC id와 시뮬레이션 시각으로 정해져 같은 시계에서는 늘 같다.
- `patrol`: `waypoints`를 차례로 걷는다. 끝에 닿으면 다음 결정 때 처음부터 다시 걷는다. `loop: false`면 가까운 끝에서 거꾸로 되짚어 걷는다(왕복). 점을 좌우로 번갈아 두면 지그재그가 된다.
- 출발점이나 목표가 장애물 칸 안이면 가장 가까운 빈 칸(3칸 안)으로 빠져나와 걷는다. 전에는 경로가 비어 목표를 건너뛰어 배회 NPC가 제자리에 서 있었다.
- `pauseSeconds`: 한 경로(배회 목표, 순찰 끝)에 닿은 뒤 쉬는 시간.
- `waitSeconds`: 결정 간격(최소 0.5초, 기본 1초). NPC마다 간격 안의 위상이 달라 한 틱에 몰리지 않는다.
- 애니메이션: 걸을 때 `moveAnimation`(없으면 속도 3.8 이상 `run`, 아니면 `walk`), 멈추면 `idleAnimation` → `arriveAnimation` → `idle`. 클립 이름은 대소문자 무시, 부분 일치로 찾는다.
- 연출(시뮬레이션의 일시 상태라 store에 쓰거나 저장하지 않는다):
  - `turnSpeed`(rad/s): 방향을 부드럽게 바꾼다. 없으면 바로 돈다.
  - `faceOnInteract`(기본 true): 플레이어가 말을 걸면 멈추고 0.3초 안에 돌아본다. 3초 또는 대사가 끝날 때까지 그 자리에 선다.
  - `glance`(rad): 서 있는 동안 가끔 양옆을 본다.
  - `gestures: { clips, everySeconds? }`: 서 있는 동안 약 `everySeconds`(기본 20초)마다 한 번씩 재생한다. 시각과 순서는 NPC id로 정해져 모든 클라이언트가 같다.
  - `greetAnimation`: 말을 걸면 재생한다. 모델에 클립이 없으면 폴짝 뛴다.
  - `strideSpeed`(m/s): 걷기 클립이 제 속도로 보이는 이동 속도. 재생 속도가 이동 속도를 따른다(0.5–2배). 없으면 클립의 루트 이동에서 잰다.
- 모델 클립 준비(`NPCInstance`가 모델마다 한 번): 걷기·달리기 클립의 루트 이동을 빼고(`makeClipInPlace`), 클립이 키를 안 준 뼈를 idle 첫 자세로 고정해(`holdUnkeyedTracks`) 전환 중 T자 자세가 나오지 않는다. 첫 클립은 weight 1로 시작하고 이후 전환은 crossfade로 합이 1이다(`useClipTransition`). 서 있는 NPC들은 idle 위상과 속도(0.9–1.1배)가 달라 함께 숨 쉬지 않는다.
- 템플릿 `height`(m)를 주면 모델을 idle 자세 기준 그 키로 맞추고 발을 땅에 붙인다. `materialPolicy: 'figure'`는 생성형 인물을 매트로 그린다([rendering.md](rendering.md)).
- 화면 밖 NPC는 몸 캡슐 크기의 구로 판정해 숨기고(그림자 draw도 빠진다), 카메라에서 30m 넘는 NPC의 애니메이션은 15Hz로 진행한다. 보이는 NPC가 움직이면 캔버스 스케줄러에 활동을 알려 `IdleFrameRate`가 매 프레임 그린다.

## 두뇌 `brain`

`NPCBrainConfig`: `{ mode: 'none' | 'scripted' | 'llm' | 'reinforcement', blueprintId?, policyId?, providerId?, memory?, prompt?, autoRespond? }`. 출처 `src/core/npc/core/brain.ts`, `src/core/npc/core/NPCSimulation.ts`.

### 결정 틱과 관찰

결정 차례가 된 NPC마다 관찰(`NPCObservation`)을 만든다: 위치·회전, 현재 애니메이션, `navigationState`(`idle` · `moving` · `arrived` · `none`), 행동·두뇌 모드, `perceived`(시야 반지름 안의 NPC와 actor, 가까운 순), `entered`(지난 결정 이후 새로 보인 id), `home`, `memory`. 시야는 `sightRadius` 구 거리만 본다. `fieldOfView`와 `hearingRadius`는 아직 쓰이지 않는다.

플레이어는 자동으로 보이지 않는다. NPC가 플레이어를 보게 하려면 actor로 등록한다.

```tsx
function PlayerActor() {
  const runtime = useGaesupRuntime();
  const { position } = usePlayerPosition({ reactive: false });
  useEngineFrame('lateUpdate', () => {
    runtime?.npcSimulation.setActor('player', '플레이어', [position.x, position.y, position.z]);
  }, { throttleMs: 200, label: 'game:npc-player-actor' });
  useEffect(() => () => runtime?.npcSimulation.removeActor('player'), [runtime]);
  return null;
}
```

### 결정 순서

1. `mode`가 `none`이면 결정하지 않는다.
2. 그 모드의 어댑터가 있으면(`policyId` → `providerId` → `'default'` 순으로 찾음) 어댑터가 결정한다.
3. `scripted`면 `blueprintId`의 블루프린트를 실행하고, 액션이 하나도 안 나오면 `behavior`(patrol·wander)로 결정한다.
4. 그 밖(`llm` 어댑터 없음 등)은 결정하지 않는다.

`reinforcement` 모드에는 엔진이 정책 서버 어댑터를 `'default'`, `'openai'`, `'huggingface'` id로 미리 붙여 둔다. 서버 주소가 없으면 `behavior`의 patrol·wander로 대신한다(블루프린트는 쓰지 않는다).

### 블루프린트 `NPCBrainBlueprint`

`{ id, name, description?, nodes, edges }`. 노드는 `start`, `condition`(`condition` 필드), `action`(`action` 필드)이고, 간선은 `{ id, source, target, branch?: 'true' | 'false' | 'next' }`다. `start`(없으면 첫 노드)에서 시작해 조건은 참·거짓 간선을, 액션은 `next` 간선(없으면 branch 없는 간선)을 따라가며 액션을 모은다. 한 번에 최대 32단계다(`src/core/npc/core/blueprint.ts`).

| 조건 | 참일 때 |
|---|---|
| `always` | 항상 |
| `navigationIdle` | 이동 중이 아님 |
| `perceivedAny` | 보이는 대상이 있음 |
| `perceivedEntered` (`actorsOnly?`) | 지난 결정 이후 새로 보인 대상이 있음. `actorsOnly`면 actor(플레이어 등)만 |
| `memoryEquals` (`key`, `value`) | `brain.memory[key] === value` |

액션 노드는 아래 `NPCAction` 전부와 대상 지정형 두 가지를 받는다: `moveToTarget { target, speed?, animationId? }`, `lookAtTarget { target }`. 대상은 `point`(`value`), `self`, `nearestPerceived`, `entered`(`actorsOnly?`)다. 블루프린트 안의 `wander` 액션은 반경 안 한 점으로 가는 `moveTo`로 바뀐다.

```ts
import type { NPCBrainBlueprint } from 'gaesup-world';

const greetPlayer: NPCBrainBlueprint = {
  id: 'greet-player', name: '플레이어 인사',
  nodes: [
    { id: 'start', type: 'start' },
    { id: 'saw', type: 'condition', condition: { type: 'perceivedEntered', actorsOnly: true } },
    { id: 'face', type: 'action', action: { type: 'lookAtTarget', target: { type: 'entered', actorsOnly: true } } },
    { id: 'hi', type: 'action', action: { type: 'speak', text: '안녕!', duration: 2 } },
    { id: 'idle', type: 'condition', condition: { type: 'navigationIdle' } },
    { id: 'walk', type: 'action', action: { type: 'wander', radius: 5, speed: 1.2 } },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'saw', branch: 'next' },
    { id: 'e2', source: 'saw', target: 'face', branch: 'true' },
    { id: 'e3', source: 'face', target: 'hi', branch: 'next' },
    { id: 'e4', source: 'saw', target: 'idle', branch: 'false' },
    { id: 'e5', source: 'idle', target: 'walk', branch: 'true' },
  ],
};
npc.getState().addBrainBlueprint(greetPlayer);
npc.getState().updateInstanceBrain('luru', { mode: 'scripted', blueprintId: 'greet-player' });
```

런타임 월드의 시뮬레이션은 store의 `brainBlueprints`에서 찾는다(NPC 저장에 함께 들어간다). legacy 월드는 전역 레지스트리(`registerNPCBrainBlueprint`)에서 찾는데, legacy store의 `addBrainBlueprint`는 전역에도 등록하므로 어느 쪽이든 `addBrainBlueprint`를 쓰면 된다. 에디터 NPC 탭에 그래프 편집기(`@xyflow/react`)가 있다.

### 액션 `NPCAction`

| 액션 | 효과 |
|---|---|
| `idle` (`animationId?`) | 행동을 `idle`로, 이동 취소 |
| `moveTo` (`target`, `speed?`, `animationId?`) | 그 점으로 이동 |
| `patrol` (`waypoints`, `speed?`, `loop?`, `animationId?`) | 행동을 `patrol`로 바꾸고 첫 경유점부터 이동 |
| `wander` (`radius?`, `speed?`, `waitSeconds?`) | 행동을 `wander`로(이동은 다음 결정부터) |
| `playAnimation` (`animationId`) | 현재 애니메이션 변경 |
| `lookAt` (`target`) | 그쪽으로 몸을 돌린다(시뮬레이션 자세) |
| `speak` (`text`, `duration?`) | 말하기. 기본 3초, 저장되지 않는다 |
| `interact` (`targetId`) | `metadata.lastInteractionTargetId` 기록 |
| `remember` (`key`, `value`) | `brain.memory[key] = value` |

한 틱의 결정은 store 업데이트 한 번으로 적용된다. `speak`·`lookAt`은 store를 거치지 않는다.

### 두뇌 어댑터

```ts
import type { NPCBrainAdapter } from 'gaesup-world';

const shopkeeper: NPCBrainAdapter = ({ instance, observation }) =>
  observation.perceived.some((target) => target.actor)
    ? { source: 'external', actions: [{ type: 'speak', text: `${instance.name}: 어서 와요` }] }
    : undefined;

const release = runtime.npcBrainAdapters.register('llm', 'shopkeeper', shopkeeper);
// 인스턴스: brain: { mode: 'llm', providerId: 'shopkeeper' }
```

- 어댑터는 고정 틱 안에서 **동기로** 불린다. 원격 추론은 요청을 띄우고 결과를 다음 결정 때 돌려주는 식으로 만든다(정책 서버 어댑터가 그렇게 한다).
- 결정 중 어댑터가 그 NPC를 바꿨다면 그 결정은 버린다.
- legacy 월드는 `registerNPCBrainAdapter(mode, id, adapter)`.

### 정책 서버 어댑터 (`reinforcement`)

```ts
runtime.npcReinforcement.configure({ endpoint: 'https://policy.example/decide', apiKey: 'key', timeoutMs: 3000 });
```

| 설정 | 기본값 | 설명 |
|---|---|---|
| `endpoint` | `''` | 비어 있으면 요청하지 않고 대체 행동만 쓴다 |
| `apiKey`, `headers` | 없음 | `Authorization: Bearer <apiKey>`와 추가 헤더 |
| `timeoutMs` | 3000 | 요청 제한 시간이자 응답 유효 시간 상한 |
| `minRequestIntervalMs` | 700 | NPC별 요청 간격 |
| `fallbackToScriptedBehavior` | `true` | 응답을 기다리는 동안 patrol·wander |

- 요청: `POST endpoint`, 본문 `{ provider?, instance: { id, templateId, name, brainMode, behaviorMode }, observation }`, 헤더 `X-Policy-Provider`(`policyId` 또는 `providerId`).
- 응답: `{ actions?: NPCAction[], reason?: string, ttlMs?: number }`. 형식이 틀리면 버린다. 유효한 응답은 그 NPC의 다음 결정 때 쓰이고, 요청 시각부터 `min(ttlMs, timeoutMs)`가 지나면 버린다.
- NPC마다 요청은 한 번에 하나다. 전송 실패는 모든 NPC가 함께 1초부터 두 배씩 최대 60초 쉰다.
- `getStats()`는 요청·대기·버림·실패 수를 준다. legacy 월드는 전역 클라이언트용 `configureReinforcementAdapter`, `getReinforcementAdapterConfig`를 쓴다.

## `NPCSimulation`

런타임이 만드는 시뮬레이션이 NPC의 실제 자세와 결정을 가진다. 시계의 `simulation` 단계(고정 60Hz)에서 이동한 뒤 결정 차례인 NPC의 결정을 적용한다. 매 틱의 자세는 store에 쓰지 않으므로 React가 틱마다 다시 그려지지 않고, 몸체는 키네마틱으로 옮겨진다.

| API | 설명 |
|---|---|
| `getPose(id)` | `{ position, rotation }` 현재 자세 |
| `snapshotInstances()` | 현재 자세를 반영한 인스턴스 복사본(저장이 쓴다) |
| `speak(id, text, duration = 3)` | 말하기 시작 |
| `getSpeech(id)` | `{ text, until }`(시계 경과 초) 또는 없음 |
| `speechRevision` | 말하기가 시작·끝날 때 오르는 숫자 |
| `face(id, target)` | 그 점을 보게 돌린다 |
| `setActor(id, name, position)` / `removeActor(id)` | NPC가 볼 수 있는 비NPC 대상(플레이어 등). NPC id와 겹치면 안 된다 |
| `getRecord(id)` | 마지막 관찰과 결정(저장되지 않음) |
| `subscribeRecords(listener)` | 결정 틱마다 호출 |
| `setNavigation(navigation)` | 경로 계산에 쓸 `NavigationSystem` 교체. 격자가 바뀐 뒤 다시 부르면 경로를 새로 짠다 |
| `nextEventAt()` | 다음 결정 또는 말하기 종료 시각(시계 초). 유휴 렌더가 언제 깨어날지 정할 때 쓴다 |
| `poseRevision` | 자세가 움직일 때마다 오른다 |

### 말하기를 화면에 그리기

말하기 상태는 있지만 엔진이 말풍선으로 그리지 않는다. 필요하면 `SpeechBalloon`으로 직접 그린다.

```tsx
import * as THREE from 'three';
import { SpeechBalloon, useEngineFrame, useGaesupRuntime } from 'gaesup-world';

function NPCSpeech({ id }: { id: string }) {
  const simulation = useGaesupRuntime()?.npcSimulation;
  const [text, setText] = useState<string>();
  const position = useMemo(() => new THREE.Vector3(), []);
  const seen = useRef(-1);
  useEngineFrame('lateUpdate', () => {
    if (!simulation) return;
    const pose = simulation.getPose(id);
    if (pose) position.set(pose.position[0], pose.position[1], pose.position[2]);
    if (simulation.speechRevision === seen.current) return;
    seen.current = simulation.speechRevision;
    setText(simulation.getSpeech(id)?.text);
  }, { label: 'game:npc-speech' });
  return text ? <SpeechBalloon text={text} position={position} /> : null;
}
```

## 내비게이션

- NPC 이동은 런타임의 `NavigationSystem`(격자 A*, WASM)으로 벽을 돌아간다. 격자가 준비되기 전에는 직선으로 가고, 닿을 수 없는 경유점은 건너뛴다. 몸 반지름은 `volume.radius × max(scale.x, scale.z)`다.
- 장애물은 `NPCSystem` 안의 `BuildingNavigationObstacleDriver`가 건축 데이터가 바뀔 때마다 다시 넣는다: 벽(문·아치 제외)과 블록은 막힘, 오브젝트는 크기만큼 막힘, 타일은 높이(계단·경사는 경사면)로 들어간다. 옵션: `includeTiles`·`includeWalls`·`includeBlocks`·`includeObjects`(기본 모두 켬), `wallPadding`, `objectPadding`, `reset`. 건축 없이 장애물을 넣으려면 `registerNavigationObstacles`·`useNavigationObstacleRegistry`(`gaesup-world/navigation`)를 쓴다.
- 격자 기본값은 칸 2m, 월드 -200~200m, 오를 수 있는 단차 1.1m다. `createGaesupRuntime({ navigation: { worldMinX, worldMaxX, cellSize, ... } })`로 바꾼다.
- 코드로 경로를 짜서 보낼 때: `applyNPCNavigationRoute(runtime.navigation, { id, position }, target, npcStore.getState().setNavigation, { speed? })`(`gaesup-world/navigation`에만 있다). 경로를 못 찾으면 빈 배열을 돌려주고 아무것도 하지 않는다(`clearOnFail: true`와 `clearNavigation`을 주면 기존 이동을 지운다).
- 에디터 NPC 모드: 템플릿을 고른 채 클릭하면 그 자리에 생성, NPC를 고른 채 클릭하면 행동을 `idle`로 바꾸고 그곳까지 경로를 준다(Shift+클릭은 생성).
- 카메라에서 멀면(약 120m 넘게) NPC를 언마운트하지만 시뮬레이션은 계속 돈다. 편집 모드에서는 모두 보인다.

## NPC 이벤트

`NPCEvent`: `{ id, type: 'onClick' | 'onHover' | 'onInteract' | 'onProximity', action: 'dialogue' | 'animation' | 'sound' | 'custom', payload? }`. `NPCInstance` 컴포넌트가 실행하는 것은 `onClick`과 `onHover`뿐이다. 부위 조립 NPC는 포인터 클릭·호버로, 단일 모델 NPC는 몸이 닿을 때 `onClick`이 실행된다. `dialogue`는 `speak`(화면에 안 보임), `animation`은 재생, `custom`은 `memory['event:<id>']`에 기록, `sound`는 소리를 내지 않고 URL만 기록한다. 대화·규칙은 아래처럼 직접 연결하는 편이 낫다.

## 대화

출처: `src/core/dialog/*`

### 데이터

```ts
import { createGaesupRuntime, getDialogRegistry, type DialogTree } from 'gaesup-world';

const hello: DialogTree = {
  id: 'luru.hello',
  startId: 'greet',
  nodes: {
    greet: { id: 'greet', speaker: '루루', text: '처음 보는 얼굴이네!', choices: [
      { text: '안녕', next: 'bye', effects: [{ type: 'setFlag', key: 'met:luru', value: true }] },
      { text: '선물 줄게', next: 'thanks', condition: { type: 'custom', key: 'hasGift' },
        effects: [{ type: 'custom', key: 'giveGift', payload: { to: 'luru' } }] },
    ] },
    bye: { id: 'bye', speaker: '루루', text: '또 봐.' },
    thanks: { id: 'thanks', speaker: '루루', text: '고마워!' },
  },
};

// 런타임을 쓰는 월드: 그 월드의 대화 store가 이 레지스트리에서 트리를 찾는다
const runtime = createGaesupRuntime({ worldId: 'village' });
runtime.dialogRegistry.register(hello);
// 런타임 없이(legacy) 쓰는 월드: 페이지 레지스트리
getDialogRegistry().register(hello);
```

- 레지스트리는 월드마다 따로다. 한 월드에 등록한 트리는 다른 월드에서 보이지 않는다. 컴포넌트에서는 `useDialogRegistry()`가 가장 가까운 월드의 레지스트리를 돌려준다.

- `DialogNode`: `{ id, speaker?, text, choices?, next?, effects? }`. `next`가 없거나 `null`이면 대화가 끝난다.
- `DialogChoice`: `{ text, next?, effects?, condition? }`.
- 효과(`DialogEffect`): `setFlag { key, value }`, `custom { key, payload? }`.
- 조건(`DialogCondition`): `flagEquals { key, value }`, `custom { key, payload? }`. 조건이 거짓인 선택지는 보이지 않는다.
- 레지스트리는 전역 하나다. 같은 id의 첫 등록이 남고(같은 내용 재등록은 무시, 다른 내용은 경고), 등록된 트리는 깊게 얼린 복사본이다. `registerAll`, `get`, `require`, `all`, `has`, `clear`.

### 실행

```tsx
const start = useDialogStore((s) => s.start);
start('luru.hello', {
  context: { npcId: 'luru', flags: savedFlags },
  evaluateCondition: (condition) => condition.key === 'hasGift' && inventory.has('flower'),
  onCustomEffect: (effect) => { if (effect.key === 'giveGift') inventory.remove('flower'); },
  onFlag: (key, value) => { savedFlags[key] = value; },
});
```

- `useDialogStore`: `{ node, runner, npcId, start(treeId, options?) → boolean, advance(), choose(index), close() }`. 트리가 없으면 `start`가 `false`를 돌려준다. 런타임 월드는 월드마다 대화 store가 따로 있다.
- `DialogRunner`(`new DialogRunner({ tree, context?, onCustomEffect?, evaluateCondition?, onFlag? })`)를 직접 써도 된다: `current`, `isFinished()`, `visibleChoices()`, `advance()`(보이는 선택지가 있으면 넘어가지 않는다), `choose(index)`(보이는 선택지 기준).
- 노드의 `effects`는 보이는 선택지가 없는 그 노드에서 `advance`할 때, 선택지의 `effects`는 그 선택지를 고를 때 실행된다(이때 노드의 `effects`는 실행되지 않는다).
- `evaluateCondition`이 없으면 `custom` 조건 선택지는 숨는다.
- 플래그는 그 대화 실행의 `context.flags`에만 있고 저장되지 않는다. `start` 때 넘긴 `context.flags` 객체는 그 자리에서 바뀌므로 같은 객체를 다시 넘기면 대화 사이에 이어지고, 저장하려면 `onFlag`로 게임 상태에 옮긴다.
- `<DialogBox advanceKey="e" closeKey="Escape" />`를 `GaesupWorld` 안, Canvas 밖에 한 번 둔다(런타임 월드면 그 월드의 대화 store를 쓴다). 선택지가 없으면 E(또는 버튼)로 넘기고, 1–9로 고르고, Esc로 닫는다. 대화가 열린 동안 이 키들은 다른 입력으로 가지 않는다.

## NPC와 대화 연결

NPC는 상호작용 대상을 스스로 등록하지 않는다. 움직이는 NPC는 상호작용 store에 직접 등록하고 `getPosition`으로 시뮬레이션 자세를 준다. 플레이어가 가까이 가면 `InteractionPrompt`가 뜨고 E로 실행된다(Canvas 안에 `InteractionTracker`가 있어야 한다, [character-camera-input.md](character-camera-input.md#상호작용)).

```tsx
import * as THREE from 'three';
import { useDialogStoreApi, useGaesupRuntime, useInteractablesStoreApi } from 'gaesup-world';

function NPCTalkTarget({ npcId, label, treeId }: { npcId: string; label: string; treeId: string }) {
  const runtime = useGaesupRuntime();
  const interactables = useInteractablesStoreApi();
  const dialog = useDialogStoreApi();
  useEffect(() => {
    const simulation = runtime?.npcSimulation;
    if (!simulation) return;
    const live = new THREE.Vector3();
    return interactables.getState().register({
      id: `npc:${npcId}`, kind: 'npc', label, key: 'e', range: 2.5, position: live.clone(),
      getPosition: () => {
        const pose = simulation.getPose(npcId);
        return pose ? live.set(pose.position[0], pose.position[1], pose.position[2]) : live;
      },
      onActivate: () => { dialog.getState().start(treeId, { context: { npcId } }); },
    });
  }, [runtime, interactables, dialog, npcId, label, treeId]);
  return null;
}
```

대화를 규칙 엔진으로 거치려면 `onActivate`에서 `runtime.gameplayEvents.dispatch({ type: 'interaction', targetId: `npc:${npcId}`, action: 'talk' })`를 부르고 아래 `createNpcTalkEventBlueprint`를 등록한다.

## 게임플레이 규칙 엔진

트리거가 오면 조건을 확인하고 액션을 실행하는 데이터 기반 규칙이다. 출처 `src/core/gameplay/events/*`.

### 어디에 있나

- 런타임 월드: `runtime.gameplayEvents`(엔진)와 `runtime.gameplayEventRegistry`(조건·액션 처리기). `setup()` 전과 저장 복원 중에는 멈춰 있고, 상태가 저장 키 `gameplay-events`로 자동 저장된다. `showDialog`는 그 월드의 대화 store, `toast`는 토스트, `emit`은 플러그인 이벤트 버스(`runtime.plugins.context.events`)로 간다.
- 직접 만들기: `new GameplayEventEngine({ blueprints?, registry?, state?, now? })`(`gaesup-world` 또는 `gaesup-world/gameplay`). 레지스트리를 주지 않으면 전역 기본 레지스트리를 쓰고, 이 경로의 `showDialog`는 legacy 전역 대화 store로 간다.
- 토스트는 `<ToastHost />`(props `position` 기본 `'top-right'`, `max` 기본 5)가 있어야 보인다. 토스트 store는 월드 구분 없는 전역 하나다(`notify(kind, text)`로 직접 띄울 수도 있다).
- 테마: `DialogBox`·`InteractionPrompt`·`ToastHost`는 CSS 변수로 모양을 바꾼다. 지정하지 않으면 어두운 글래스 기본값이다. `--gaesup-ui-font`, `--gaesup-ui-surface`(배경), `--gaesup-ui-text`, `--gaesup-ui-border`, `--gaesup-ui-control`(버튼 배경), `--gaesup-ui-accent`·`--gaesup-ui-accent-text`(화자·키 배지), `--gaesup-ui-accent-strong`(선택지 번호), `--gaesup-ui-shadow`, `--gaesup-ui-radius`, `--gaesup-ui-blur`, 토스트 종류별 배경 `--gaesup-toast-info|success|warn|error`. 세 컴포넌트는 `position: fixed`라, `transform`이 있는 조상(예: `transform: translateZ(0)`인 무대) 안에 두면 그 조상 기준으로 놓인다. minihome의 `minihome.css`가 밝은 글래스 테마 예시다.

### 블루프린트 `GameplayEventBlueprint`

`{ id, name, description?, enabled?, trigger, conditions?, actions, policy?, tags? }`

| 트리거 | 맞는 `dispatch` 입력 |
|---|---|
| `manual { key }` | `{ type: 'manual', key }` |
| `interaction { targetId, action? }` | `{ type: 'interaction', targetId, action }`. 블루프린트에 `action`이 없으면 어떤 action이든 맞는다 |
| `enterArea { areaId }` | `{ type: 'enterArea', areaId }` |
| `timeChanged { hour? }` | `{ type: 'timeChanged', hour }`. `hour`가 없으면 매번 맞는다 |
| `custom { key }` | `{ type: 'custom', key }` |

| 조건 | 설명 |
|---|---|
| `always` | 참 |
| `flagEquals { key, value }` | 엔진 상태의 플래그가 같은 값 |
| `custom { key, payload? }` | 기본 처리기는 거짓. 게임이 등록한다 |

| 액션 | 설명 |
|---|---|
| `showDialog { dialogTreeId, npcId? }` | 대화 시작 |
| `toast { kind?, text }` | 토스트. `kind`: `info`(기본) · `success` · `warn` · `error` · `reward` · `mail` |
| `setFlag { key, value }` | 엔진 상태의 플래그 설정 |
| `emit { eventName, payload? }` | 이벤트 발행 |
| `custom { key, payload? }` | 기본 처리기는 아무것도 안 한다. 게임이 등록한다 |

정책(`policy`): `run: 'once' | 'repeat'`(기본 반복), `cooldownMs`, `requiresServer`.

### 영역 트리거: `GameplayArea`

플레이어가 상자 영역에 들어서면 `enterArea` 트리거가 간다. 언리얼의 TriggerBox와 같은 역할이며, 런타임이 있는 월드에서만 동작한다.

```tsx
import { GameplayArea } from 'gaesup-world';

export const Plaza = () => <GameplayArea id="plaza" center={[0, 1, 0]} size={[12, 4, 12]} />;
```

- `center`와 `size`(전체 크기)는 월드 미터다. 런타임이 고정 틱마다 플레이어 위치를 검사해, 들어온 순간 한 번 보낸다. 나갔다가 다시 들어오면 다시 보낸다.
- 코드로는 `runtime.gameplayAreas.register({ id, center, size })`가 해제 함수를 돌려준다. React 없이 쓰려면 `createGameplayAreas(onEnter)`(`gaesup-world/gameplay`)로 직접 만든다.

### 실행과 결과

- **런타임이 보내는 트리거**: 상호작용 대상이 발동하면(`activateCurrent`) `{ type: 'interaction', targetId: 대상 id, action: 'interact' }`, 플레이어가 영역에 들어서면 `{ type: 'enterArea', areaId }`(고정 틱마다 검사, 머무는 동안은 한 번), 게임 시각이 바뀌면 `{ type: 'timeChanged', hour }`. `manual`·`custom`과 그 밖의 상황은 게임 코드가 `runtime.gameplayEvents.dispatch(trigger)`로 보낸다. 결과는 `Promise<GameplayEventExecution[]>`이고 항목마다 `{ blueprintId, actionCount, skipped? }`다.
- 블루프린트는 배열 순서대로 본다. `enabled: false`와 트리거가 안 맞는 것은 건너뛰고, 정책에 걸리면 `skipped`에 `already-executed` · `cooldown` · `requires-server` · `in-flight`, 조건이 거짓이면 `condition:<type>`, 실행이 취소되면 `cancelled`가 들어간다.
- `requiresServer: true`는 이 엔진에서 항상 `requires-server`로 건너뛴다. 서버 실행 경로는 게임이 서버 명령 권한 라우터로 만든다([save-network.md](save-network.md#서버-계약-gaesup-worldserver-contracts)).
- 조건은 순서대로 모두 참이어야 하고, 처리기가 없는 조건은 거짓이다. 액션은 순서대로 실행하고 처리기가 없는 액션은 건너뛴다(개수에 안 셈). 끝나면 `state.executedAt[id]`에 실행을 시작한 시각(`now()`, 기본 `Date.now()`)을 적는다. `in-flight`는 `once`·`cooldownMs` 규칙이 아직 끝나지 않은 실행과 겹칠 때만 나온다.
- 처리기는 `Promise`를 돌려도 된다. `setBlueprints`, `hydrate`, `suspend`는 진행 중인 실행을 취소한다.
- 상태: `engine.state = { executedAt, flags }`. `serialize()`·`hydrate(data)`·`prepareHydrate(data)`·`revision()`으로 저장에 붙는다.
- `preview(blueprint, trigger)`는 정책과 조건만 평가하고 액션은 실행하지 않는다(에디터 시험용).

```ts
import { createNpcTalkEventBlueprint, type GameplayEventBlueprint } from 'gaesup-world/gameplay';

const plaza: GameplayEventBlueprint = {
  id: 'enter-plaza', name: '광장 도착', trigger: { type: 'enterArea', areaId: 'plaza' },
  conditions: [{ type: 'flagEquals', key: 'talked:luru', value: true }],
  actions: [{ type: 'toast', kind: 'info', text: '광장에 왔다' }], policy: { run: 'once' },
};
runtime.gameplayEvents.setBlueprints([createNpcTalkEventBlueprint({ npcId: 'luru', dialogTreeId: 'luru.hello' }), plaza]);
await runtime.gameplayEvents.dispatch({ type: 'enterArea', areaId: 'plaza' });
```

### 게임 조건·액션 등록

레지스트리는 `type`마다 처리기 하나를 가진다. `custom` 처리기를 등록하면 기본 처리기를 대신하므로 그 안에서 `key`로 나눈다.

```ts
import { commitGameplayEffect, type GameplayEventAction, type GameplayEventCondition } from 'gaesup-world/gameplay';

type CustomCondition = Extract<GameplayEventCondition, { type: 'custom' }>;
type CustomAction = Extract<GameplayEventAction, { type: 'custom' }>;

const registry = runtime.gameplayEventRegistry;
registry.registerCondition<CustomCondition>('custom', (condition) => condition.key === 'hasGift' && inventory.has('flower'));
registry.registerAction<CustomAction>('custom', async (action, context) => {
  if (action.key !== 'grantItem') return;
  const item = await rollReward(action.payload);
  commitGameplayEffect(context, () => inventory.add(item));
  context.setFlag?.('rewarded', true);
});
```

- 처리기의 `context`: `{ blueprint, trigger, state, now, signal?, isCurrent?, setFlag? }`. 취소되었거나 끝난 실행은 `isCurrent()`가 거짓이고 `state` 쓰기와 `setFlag`가 무시된다.
- `await` 뒤에 외부 부작용을 낼 때는 `commitGameplayEffect(context, effect)`로 감싸 취소된 실행이 효과를 내지 않게 한다.
- 런타임 없이 엔진을 만들 때 대화·토스트·이벤트 연결을 직접 정하려면 레지스트리를 만들어 넘긴다: `new GameplayEventEngine({ registry: createDefaultGameplayEventRegistry({ showDialog, notify, emit }) })`.

### 템플릿과 시드

- `createNpcTalkEventBlueprint({ id?, name?, npcId = 'npc', dialogTreeId = 'npc.greeting' })`: 트리거 `interaction { targetId: 'npc:<npcId>', action: 'talk' }`, 액션 `showDialog`와 `setFlag talked:<npcId> = true`, 정책 `once`.
- `createManualToastEventBlueprint({ id, name, triggerKey, message })`: `manual` 트리거로 성공 토스트와 `setFlag <id> = true`, 정책 `repeat`.
- `SEED_GAMEPLAY_EVENTS`: 예시 하나(`manual` 키 `world.ready` → 토스트 + `gameplayReady` 플래그, `once`).
- 에디터 UI용: `GAMEPLAY_EVENT_TRIGGER_TYPES`, `GAMEPLAY_EVENT_CONDITION_TYPES`, `GAMEPLAY_EVENT_ACTION_TYPES`, `createGameplayEvent{Trigger,Condition,Action}Template(type)`.
- `GameplayEventPanel`(`gaesup-world/editor`)은 제어 컴포넌트다. `blueprints`(기본 `SEED_GAMEPLAY_EVENTS`)와 `onCreate`·`onUpdate`·`onDelete`·`onRun`을 주면 목록을 편집하고, 엔진에 넣는 일(`setBlueprints`)은 앱이 한다. `onRun`이 없으면 시험 실행은 `preview`만 한다. 에디터 셸의 기본 `gameplay-events` 패널은 가장 가까운 월드의 엔진에 묶여, 만들고 고치고 지운 이벤트가 그 엔진의 블루프린트가 된다(시험 실행은 미리보기).

## 게임 규칙을 붙이는 방법

| 필요한 것 | 붙일 곳 |
|---|---|
| 대화 중 소지품 확인·지급 | 대화 `custom` 조건·효과 → `evaluateCondition`, `onCustomEffect` |
| 이벤트로 보상·상태 변화 | 규칙 엔진 `custom` 조건·액션 처리기 |
| 전역 진행 플래그 | 규칙 엔진 `setFlag`/`flagEquals`(자동 저장). 대화 플래그는 `onFlag`로 옮긴다 |
| NPC 의사결정 | 두뇌 어댑터 또는 블루프린트 + `remember`/`memoryEquals` |
| 게임 자체 상태 저장 | `SaveSystem` 도메인 바인딩이나 `createStoreDomainPlugin`([save-network.md](save-network.md#게임-도메인-추가)) |
| 서버 판정 | `requiresServer` 규칙 + 서버 명령 권한 라우터 |

## 알려진 제한

- NPC 말하기를 말풍선으로 그리지 않는다(위 예시처럼 직접 그린다).
- NPC가 상호작용 대상을 스스로 등록하지 않고, 플레이어를 actor로 자동 등록하지 않는다.
- 지각은 거리만 본다(`fieldOfView`, `hearingRadius` 미사용).
- 렌더 경로가 두 벌이다(`fullModelUrl` 단일 모델과 부위 조립). 일과표(`useNpcSchedule`, `getNPCScheduler`)는 시각에 맞는 칸을 계산할 뿐 시뮬레이션을 움직이지 않는다.
- `initializeDefaults()`가 두뇌 없는 인스턴스에 `reinforcement` 두뇌를 붙인다.
- 대화 레지스트리와 legacy 경로의 규칙 레지스트리는 전역이라 월드 둘이 공유한다.
- NPC를 네트워크로 동기화하는 기능은 없다.

## 관련 문서

- [getting-started.md](getting-started.md) · [world-runtime.md](world-runtime.md) · [rendering.md](rendering.md)
- [character-camera-input.md](character-camera-input.md) · [building.md](building.md) · [save-network.md](save-network.md)
- [performance.md](performance.md) · [api-map.md](api-map.md)
- [../dev/architecture.md](../dev/architecture.md) · [../dev/module-status.md](../dev/module-status.md)
