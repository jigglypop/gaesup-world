# PRD-10 엔진 코어

| 항목 | 값 |
|---|---|
| 우선순위 | P0 |
| 마일스톤 | M1(COR-01~COR-06, COR-07a, COR-08, COR-09a·c, COR-10), M2(COR-05c, COR-07b), M3(COR-07c·d, COR-09b·d, COR-11, COR-12), M7(COR-09e의 legacy 제거) |
| 선행 | 01 PRD VER-01·VER-02(카운터, headless 러너) |

## 1. 목표

RC-1(원본 여럿)과 RC-2(React에 묶인 실행)를 없앤다.

- 저작 원본은 `SceneDocument` 하나다. 런타임 엔티티 저장소는 `EntityWorld` 하나이고 문서의 projection이다(결정 G1).
- 시스템 등록은 `defineSystem` 하나이고 두 lane(fixed, presentation)으로 순서가 정해진다. 실행 순서는 mount 순서와 무관하다.
- 엔진은 캔버스와 React 없이 돈다. 같은 runtime을 브라우저(R3F 호스트)와 Node(headless 호스트)에서 쓴다.
- 편집/플레이 모드는 `runtime.mode` 하나다. Play 중 변경은 저작 문서에 들어가지 않는다.
- 물리 바디는 시스템이 Rapier API로 직접 소유한다. React 수명이 collider 수명을 정하지 않는다.

비목표:
- 아키타입 기반 범용 ECS 쿼리 엔진. 컴포넌트 타입별 저장소로 시작하고, 측정 근거가 생기면 다시 판단한다.
- `SceneDocument` 포맷 교체. 확장만 한다.
- `FrameScheduler`, `FixedStepClock` 재작성. 등록 API만 얹는다.
- Rapier 교체.

## 2. 현재 상태

| 대상 | 사실 | 근거 |
|---|---|---|
| `NextWorld` | generational id(index 20bit, generation 11bit), SoA `TransformStore`(position f32×3, quaternion f32×4, scale f32×3, 부동 원점 셀 i32×3), 2배 grow. 컴포넌트 저장소, alive 순회, 외부 id 매핑, 수명 이벤트, parent·world 행렬·dirty가 없다. src 런타임 사용 0(examples/engine만) | `next/core/World.ts:5-103`, `TransformStore.ts:1-121` |
| `SceneDocument` | flat `objects[]` + `parentId`, euler XYZ local transform, 컴포넌트 data는 canonical JSON. command(create/update/delete/move, component add/remove/update, batch, replace), 증분 검증, revision 기반 controller. component schema 검증은 `component.update`에서만 한다 | `scene-object/types.ts:31-56`, `commands.ts:51-338`, `controller.ts:23-86`, `extendedCommands.ts:77` |
| `SceneObjectDelta` | `{reset, added, removed, updated}` id 집합. 이동한 객체의 자손과 바뀐 필드를 구분하지 않는다. 런타임 소비자 0 | `scene-object/delta.ts:12-75` |
| replace 경로 | undo, 프리팹 작업 5종, `SceneDocumentManager`, save hydrate, minihome session이 모두 문서 전체 replace → reset delta | `editor/shell.ts:266-286,338-365`, `saveBinding.ts:13-55` |
| `SceneRuntime` | 호출마다 전체 재파싱, 스냅샷 단위 world 행렬 캐시, 곱셈마다 `new Array(16)` | `scene-object/runtime.ts:31-95`, `transforms.ts:43` |
| 문서 소유 | `createGaesupRuntime`이 문서 controller를 소유하지 않는다. 에디터 패널은 `sceneDocument` prop을 읽기만 하고 예제는 넘기지 않는다. scene-object barrel이 Rapier 컴포넌트(`SceneObjectBody`)를 re-export한다 | `scene-object/index.ts:19` |
| 스크립트 | `ScriptRuntime`은 React import가 없지만 런타임 사용 0. 알림마다 전 객체 순회, `fixedUpdate`가 렌더 delta의 `prePhysics`에서 돈다. 스크립트 레지스트리는 전역 Map | `scripting/ScriptRuntime.ts:91-408`, `react/useScriptRuntime.ts:38-41`, `registry.ts:3` |
| 스케줄러 | phase 체계는 4종이지만 실제로 tick되는 것은 둘이다. `FrameScheduler`(9 phase, 렌더율)와 `FixedStepClock`(5 phase, 고정 틱, React·브라우저 무의존)이다. `TaskGraph`는 호출처 0, `AbstractSystem`은 bridge를 거쳐 hook에서 호출되는 `update(ctx)` 계약이다. 같은 order면 mount 순서로 실행된다 | `runtime/frame/FrameScheduler.ts:22-77`, `simulation/FixedStepClock.ts:24-118`, `next/core/TaskGraph.ts:3` |
| 스케줄러 인스턴스 | 전역 `frameScheduler`와 캔버스별 WeakMap. `FrameSchedulerHost`가 useFrame 두 개(priority -100: input~prePhysics, -1: postPhysics~snapshot)로 구동하고 전역 scheduler도 함께 tick. `PHYSICS_STEP_PRIORITY`(-50)는 사용처 0 | `runtime/frame/react/canvasScheduler.ts:14-69`, `FrameSchedulerHost.tsx:15-57` |
| 스케줄러 밖 루프 | raw `useFrame` 2곳(`GpuBatchBridge`, `WorldPostProcessing`), drei `useAnimations`(RemotePlayer), rAF 4곳(`AnimationClockLoop` 드라이버 없을 때, `BrowserGamepadHub`, 엔티티별 `useEntityLifecycle`, `PerformancePanel`), 타이머(clock 없을 때 `NetworkSystem`, autosave, BGM, minimap, ping) | `eslint.config.js:9-13` |
| 고정 틱 | 프레임 순서: prePhysics 끝에서 `driver.advance(delta)` → k틱 동안 npc → time → controls → rapier → network → postPhysics 맨 앞에서 `present(alpha)` → animation → lateUpdate → camera → effects → snapshot. clock은 time store마다 `new FixedStepClock()`(프로젝트 설정 미주입, D-10). 스크립트 `onFixedUpdate`는 렌더율 prePhysics에서 돈다 | `world/components/WorldPhysics/index.tsx:39-73`, `time/core/timeClock.ts:9-18` |
| 물리 소유 | Rapier `World`는 React `<Physics>`가 소유(`suspend(importRapier)`, Proxy 지연 생성, unmount 시 `free`). `WorldPhysics`는 `<Physics paused>` 안에서 clock의 physics 시스템으로 `useRapier().step`을 호출한다. `step` 하나에 world.step, mesh 동기화, 충돌 이벤트 drain(React prop 콜백), invalidate가 들어 있다. `setWorld` 주입 경로는 있지만 unmount가 그 World를 free한다 | `@react-three/rapier` 2.2.0 dist:776-853,895-1092 |
| 바디 | 플레이어·탈것은 `PhysicsEntity`의 `<RigidBody>`와 `<CapsuleCollider>`. collider 크기를 GLTF bounds에서 구해 모델 로드 전에는 바디가 없다. 편집 모드에서 플레이어 바디를 unmount한다. NPC 바디는 LOD 범위 안에서만 존재. 원격 플레이어·PassiveObjects·SceneObjectBody·BlueprintSpawner도 React 바디. 건설은 부모 없는 정적 cuboid를 `useEffect`에서 만들고 바뀌면 목록 통째 교체 | `motions/entities/refs/PhysicsEntity.tsx:59-203`, `motions/controller/EntityController.tsx:20-113`, `building/components/BuildingColliders/index.tsx:24-42` |
| Rapier 모듈 | `@dimforge/rapier3d-compat` 0.19.2는 `@react-three/rapier`의 전이 의존성뿐이다. peer 선언은 `packageExports.test.ts:136-150`이 막는다. Node에서 실제 solver를 이미 쓴다(`GroundContactProbe.test.ts`, `verify-package-consumer.cjs:1684-1731`의 runtime setup·`stepTicks`·헤드리스 NPC·접지·점프) | |
| pause | `WorldPhysics paused`는 Rapier와 controls만 멈춘다. NPC, 시간, 네트워크 틱은 계속된다 | `WorldPhysics/index.tsx:26-34`, `npc/core/NPCSimulation.ts:81` |
| runtime | create → setup(서비스 등록, plugin setup, binding, resume) → dispose. typed 서비스 키 18종, 문자열 id 14개, 상수 3개. clockLoop·navigation·stateManager·npcSimulation·bridge는 서비스가 아니라 struct 필드. 도메인 저장 binding은 plugin만 등록해 plugin이 없으면 building·npc가 저장되지 않는다 | `runtime/createGaesupRuntime.ts:80-535` |
| 모드 | 출처 4곳, 실제 역할은 `buildingStore.isInEditMode()`(플레이어 바디 unmount, 카메라, 키보드, 게임패드, collider 제거, NPC 시스템이 소비) | 00 문서 RC-1 |
| 이미 React 없이 도는 것 | clock과 명시적 advance, NPCSimulation(바디 없어도 이동·결정), Network, GameplayEventEngine, SaveSystem, PhysicsSystem과 접지 판정(실제 Rapier), collider box 계산, vanilla store, `createGaesupRuntime().setup()`, FrameScheduler 수동 tick | |
| 전역 상태 | 00 문서 RC-4. 추가로 `groundContacts` 전역 Map, 전역 MotionBridge(`BridgeFactory` static Map + DI 싱글턴), PhysicsBridge·StateManager 모듈 fallback | `motions/core/system/groundContacts.ts:1`, `boilerplate/bridge/BridgeFactory.ts:13,25` |

## 3. 설계

### 3.1 흐름

```
SceneDocument (저작 원본: command, 증분 검증, migration, save)
   │ SceneObjectDelta (reset이면 스냅샷 identity diff)
   ▼
SceneProjector ──► EntityWorld (runtime projection + transient 엔티티)
                    ├─ ids: NextWorld generational id, SceneObjectId ↔ EntityId
                    ├─ TransformStore + 계층(parent, world, dirty)
                    └─ component stores (ComponentTypeRegistry 정의)
                           │
        defineSystem ──────┴────────────────────────────────────────────┐
        fixed lane (FixedStepClock)                presentation lane (FrameScheduler)
        commands → simulation → physics            input → script → animation → lateUpdate
        → postSimulation → publish                 → camera → effects → snapshot(render extract)
                                                                          │
runtime.mode: edit ⇄ play ⇄ paused                                        ▼
hosts: R3F 호스트(Canvas, 입력, render root) / headless 호스트(Node)     RenderWorld(20 PRD)
```

### 3.2 `EntityWorld`

- `NextWorld`를 일반화한다. id 형식과 grow 정책을 유지한다.
- **alive 순회:** dense 배열과 swap-remove로 할당 없이 순회한다.
- **컴포넌트 저장소:** 타입별로 둔다. 숫자 필드는 SoA typed array(`storage: 'soa'`), 나머지는 sparse Map(`storage: 'map'`)에 둔다. 저장 방식은 컴포넌트 정의에서 고른다.
- **변경 추적:** 컴포넌트 타입마다 version과 변경 엔티티 목록(소비자별 커서)을 둔다. 시스템은 `world.changed(type, cursor)`로 바뀐 것만 처리한다.
- **id 매핑:** `SceneObjectId ↔ EntityId` 양방향 인덱스를 소유한다. 문서에 없는 런타임 엔티티(원격 플레이어, 이펙트)는 `transient`로 만들고 저장하지 않는다.
- **이벤트:** 수명 이벤트(created, destroyed)는 kernel emitter로 낸다.
- **대량 콘텐츠:** 타일·벽·잔디·인스턴스는 엔티티를 하나씩 만들지 않는다. 그룹 하나가 엔티티 하나이고 데이터 컴포넌트(셀 배열)를 가진다. 유니티 Tilemap·Terrain과 같은 방식이다(결정 N4).

### 3.3 `TransformStore` 계층과 `TransformSystem`

- 기존 local TRS SoA에 `parent: Int32Array`, `firstChild`/`nextSibling`, `world: Float32Array(16×cap)`, `dirty: Uint8Array`를 더한다.
- **갱신:** 틱당 한 번 dirty를 위에서 아래로 전파하고 dirty 서브트리만 재계산한다. 정지 틱의 재계산과 할당은 0이다(S-H02).
- **회전 변환:** 문서의 euler XYZ와 quaternion 사이 변환은 SceneProjector 경계에서 한다.
- **보간:** fixed lane에서 움직이는 엔티티는 이전·현재 world를 두고, presentation 단계에서 alpha로 보간한 `presented` 행렬을 만든다. 렌더, 카메라, 부착물, 말풍선은 모두 `presented`를 읽는다. 부착물이 보간 전 body 위치를 따르는 문제(이전 판 11-f)가 여기서 없어진다.
- **동기화 지점:**

| 방향 | 시점 | 대상 |
|---|---|---|
| document → transform | 명령 적용 시(SceneProjector) | 영속 엔티티 |
| transform → Rapier | fixed `physics` 직전 | kinematic body |
| Rapier → transform | fixed `physics` 직후 | dynamic body |
| transform → render | presentation `snapshot` | 렌더 대상(보간 적용) |
| transform → document | 편집 명령, 또는 Play 종료 시 저장 정책(3.5절) | 영속 엔티티 |

### 3.4 `SceneProjector`와 컴포넌트 레지스트리

- runtime이 문서 controller를 서비스(`sceneDocumentKey`)로 소유한다. 에디터, 스크립트, 저장이 같은 controller를 쓴다.
- **증분 반영:** SceneProjector가 controller의 delta를 받아 `EntityWorld`에 반영한다. 반영 비용은 바뀐 객체 수에 비례한다(S-H01). 이동한 객체의 자손은 트랜스폼 dirty 전파가 처리하므로 delta에 넣지 않는다.
- **reset(replace) 처리:** 이전 스냅샷과 객체·컴포넌트 identity를 비교해 증분으로 바꾼다. 신뢰 스냅샷은 바뀌지 않은 객체의 identity를 유지하므로 파싱 없이 O(N) 참조 비교로 끝난다. replace를 쓰는 경로는 AST-04·AST-07에서 증분 명령으로 바꾼다.
- **컴포넌트 정의:** `defineComponent({ type, version, schema, defaults, storage, migrate? })`. `schema`는 `ScriptPropSchema` kind를 재사용한다. 검증, 기본값, Inspector 편집기(EDT-01), migration이 이 정의 하나에서 나온다.
- **검증 범위:** create, add, replace, parse에서도 검증한다. 지금은 `component.update`에서만 한다.
- **레지스트리 통합:** 레지스트리는 runtime 스코프다. 기존 `registerSceneComponentSchema`, 스크립트 레지스트리, animator 레지스트리, NPC brain 레지스트리는 이 레지스트리의 adapter가 된다.

### 3.5 `defineSystem`과 `runtime.mode`

```ts
defineSystem({
  id: 'physics.step',
  lane: 'fixed',              // 'fixed' | 'presentation'
  phase: 'physics',           // lane의 phase
  after: ['script.fixed'],    // 같은 phase 안 순서
  modes: ['play'],            // 도는 모드. 기본은 모든 모드
  update(ctx, dt) {},         // ctx: world, services, stats
  onStart(ctx) {}, onStop(ctx) {},
});
```

- **등록과 순서:** runtime이 시스템 목록을 소유하고 (phase, after/before, id) 순으로 정렬한다. 등록 순서는 결과에 영향을 주지 않는다(S-H03). `TaskGraph`의 의존 정렬은 `after`/`before`로 흡수한다.
- **lane 실행기:** fixed lane은 `FixedStepClock`, presentation lane은 `FrameScheduler` 위에서 돈다. 두 인스턴스는 runtime이 하나씩 소유한다. 전역 `frameScheduler`, 캔버스별 WeakMap, time store별 clock을 대체한다. 호스트는 `runtime.tick(frameDt)` 하나로 두 lane을 진행한다. R3F 호스트는 useFrame 하나에서 delta만 넘긴다. `PHYSICS_STEP_PRIORITY`처럼 쓰지 않는 슬롯은 지운다.
- **고정 틱:** 60Hz와 144Hz에서 fixed tick 수가 같다(S-H04). 프로젝트 설정 `timeStep`·`maxSubSteps`를 clock에 주입한다(D-10).
- **모드 상태 머신:**

| mode | fixed lane | script | presentation | 문서 | autosave |
|---|---|---|---|---|---|
| edit | `modes`에 edit가 있는 시스템만 | edit 콜백만 | 동작 | 저작 문서 | 동작 |
| play | 동작 | 동작 | 동작 | play copy | 중단 |
| paused | 정지(physics step 0) | 정지 | 동작 | play copy | 중단 |

- **play copy:** Play 진입 시 저작 문서 스냅샷을 참조 복제한 play controller를 만든다. 시스템과 스크립트는 play controller에 쓴다. Stop 시 버린다(S-H05).
- **`persistPlayChanges`:** 옵션이 true면 Play 변경을 저작 문서에 반영한다. 기본값은 에디터 false, 런타임 true다(결정 G8).
- **기존 모드 출처:** `editorSlice.playMode`, `ScriptPlayModeSource`, `buildingStore.isInEditMode()`는 `runtime.mode`를 읽는 adapter가 된다.

### 3.6 물리(PhysicsSystem)

- **Rapier 모듈은 주입받는다.** 직접 의존성을 추가하지 않는다. 버전이 둘로 갈라져 WASM 인스턴스가 두 개가 되는 것을 막기 위해서다.
  - R3F 호스트는 `@react-three/rapier` context의 모듈을 쓴다.
  - headless 호스트는 호출자가 넘긴 모듈을 쓰거나 `@react-three/rapier`를 거쳐 resolve한다. 기존 `GroundContactProbe.test.ts` 방식이다.
- **World 소유는 두 단계로 옮긴다.**
  1. 과도기: R3F 호스트는 `<Physics>`가 만든 World를 physics 서비스로 넘겨받는다. 시스템이 만드는 바디와 남아 있는 React `RigidBody`가 같은 World에 있어야 서로 충돌하기 때문이다. step은 지금처럼 fixed lane의 physics 시스템이 `useRapier().step`으로 부른다. React prop 콜백용 충돌 이벤트 drain은 이 step 안에서 돈다.
  2. 최종: React 바디가 모두 시스템으로 옮겨지면 runtime이 두 호스트 모두에서 World를 만들고 해제한다. world.step, 충돌 이벤트 drain, transform 동기화는 physics·presentation 시스템으로 나누고 `<Physics>` 의존을 없앤다. Proxy를 거치는 비용도 함께 없어진다.
- **바디는 데이터에서 만든다.**
  - `collider`/`rigidBody` 컴포넌트는 PhysicsSystem이 Rapier 핸들로 만든다. React `RigidBody` 기반 공개 컴포넌트는 호환용 adapter가 된다.
  - 플레이어 collider 크기는 컴포넌트 데이터에 둔다. 모델 로드 전에도 바디가 있어야 하므로 GLTF bounds와 Suspense에 의존하지 않는다.
  - NPC 바디 수명은 LOD와 분리한다.
  - 편집 모드는 바디를 unmount하지 않고 해당 시스템을 비활성화한다.
- **건설 collider:** 현재 정적 cuboid 경로를 PhysicsSystem의 정적 collider 집합으로 옮긴다. 편집은 id diff로 바뀐 collider만 갱신한다. box를 만드는 순수 함수(`TileSystem/layout.ts`, `WallSystem/colliders.ts`, `BlockSystem/layout.ts`)는 그대로 쓴다.
- **접지 상태:** World 인스턴스 소유로 옮기고 전역 `groundContacts` Map을 없앤다(D-17). 전역 MotionBridge·PhysicsBridge·StateManager fallback도 runtime 전용으로 바꾼다.
- **카메라 입력:** 제어 로직의 `RootState`·카메라 의존(`DirectionComponent.ts:312`)은 port로 바꾸고, WorldPhysics 밖의 가변 주기 `'drive'` 경로를 없앤다.
- **카메라 충돌:** Rapier shape cast(`castShape(ball)`)로 한다. 정적 collider BVH를 쓰고 플레이어 collision group을 뺀다.

### 3.7 호스트

| 호스트 | 역할 |
|---|---|
| R3F 호스트(`<GaesupWorld>`) | Canvas와 renderer 생성, RenderWorld root mount(`<primitive>` 하나), 입력 연결, R3F 프레임에서 `runtime.tick` 호출 |
| headless 호스트(`createHeadlessHost`) | Node에서 고정 dt로 `runtime.tick` 반복, 입력 재생. 테스트(S-H), 서버 시뮬레이션, 벤치에 쓴다 |

### 3.8 runtime 스코프

- **서비스 조회:** 도메인은 `runtime.get(key)`로 서비스를 얻는다. 키는 값을 소유한 도메인이 `defineService<T>(id)`로 export한다. 문자열 literal 키는 금지한다.
- **kit 자체 등록:** 게임플레이 kit은 plugin `setup(ctx)`에서 자기 store와 정의 registry를 만들어 등록한다. kit 간 의존은 `requires`로 선언한다. `createGaesupRuntime()` 기본값은 모든 kit preset이고, engine만 원하면 `kits: []`를 넘긴다(결정 G9).
- **legacy 전역 store:** import 시점에 만들지 않고 첫 접근 때 lazy로 만든다. dev에서는 fallback이 일어나면 1회 경고한다. 도메인별로 호출처를 옮긴 뒤 2.0에서 제거한다.
- **dispose:** runtime을 dispose하면 구독, 타이머, listener, rAF가 0이다(S-H08).

### 3.9 오류

- **보고 경로:** `reportError(error, context)`는 kernel에 두고, runtime별 sink로 보낸다. production 기본 sink는 `console.error`이고 runtime 옵션 `onError`로 바꾼다.
- **시스템 격리:** 시스템 `update`에서 난 예외는 시스템 단위로 잡아 보고한다. 해당 시스템은 다음 프레임에도 계속 실행한다. 보고는 항목별 첫 오류와 이후 초당 최대 1회다(결정 G2).
- **오류 타입:** 공통 `GaesupError`(name, `code`, `cause`)를 두고 커스텀 Error 15개가 상속한다. 빈 catch와 주석만 있는 catch는 이유를 코드로 표현한다.

## 4. 작업

### COR-01 kernel

| Slice | 내용 | 완료 기준 |
|---|---|---|
| COR-01a | `src/core/kernel/`: `runtime/frame`(FrameScheduler, phases, hooks), `frameTime`(boilerplate에서 이동), `runtimeContext`, service key, emitter, logger·`reportError`, `Result`, 정의 registry 팩토리, `EngineStats`(VER-01a). kernel은 도메인 import 0. 기존 경로는 re-export shim | kernel 폐포 검사(도메인 import 0), 도메인 SCC 감소 기록 |

### COR-02 `EntityWorld`와 컴포넌트 레지스트리

| Slice | 내용 | 완료 기준 |
|---|---|---|
| COR-02a | `EntityWorld`: NextWorld 일반화, alive dense 순회, 컴포넌트 타입별 저장소(soa/map), 변경 추적, 수명 이벤트, `transient`. runtime 서비스 등록 | 단위 테스트, 10k 엔티티 생성·파괴·순회 할당 0 |
| COR-02b | runtime 스코프 `ComponentTypeRegistry`, `defineComponent`, 표준 컴포넌트 9종 정의, 기존 `registerSceneComponentSchema` adapter, create/add/replace/parse 검증 | scene-object 테스트 통과, 잘못된 data로 create 시 거부 |
| COR-02c | 공간 인덱스: world `SpatialGrid`, `BuildingSpatialIndex`, `next` culling을 비교하는 벤치를 만들고 통합 여부를 정한다. 통합하지 않아도 zigZag/pair 키 함수 중복은 합친다 | 벤치 결과와 결정을 이 문서에 기록 |

### COR-03 `TransformSystem`

| Slice | 내용 | 완료 기준 |
|---|---|---|
| COR-03a | 계층(parent, firstChild/nextSibling), world 행렬, dirty 전파, euler↔quaternion 경계 변환 | S-H02 |
| COR-03b | 보간 `presented` 행렬(이전·현재 world, alpha). 렌더·카메라·부착물·말풍선이 읽는 위치. `PhysicsPresentation`의 step 전후 이중 읽기(body당 step마다 WASM 4회)와 pose마다 조상 체인 순회를 없앤다 | 144Hz 시뮬레이션에서 부착물과 본체 위치 차이 0 |

### COR-04 `SceneProjector`

| Slice | 내용 | 완료 기준 |
|---|---|---|
| COR-04a | runtime 소유 문서 controller 서비스, SceneProjector(delta 증분 반영, reset은 identity diff). scene-object barrel에서 Rapier 컴포넌트 re-export를 react 하위 경로로 분리 | S-H01, `SceneRuntime` 재파싱 호출 0(런타임 경로) |

### COR-05 `defineSystem`과 두 lane

| Slice | 내용 | 완료 기준 |
|---|---|---|
| COR-05a | 현재 프레임 등록 순서를 테스트로 먼저 기록한 뒤 `defineSystem`, 정렬, `runtime.tick`, lane 실행기 연결. `TaskGraph` 흡수 | S-H03, 기록한 순서와 동일 |
| COR-05b | D-10: 프로젝트 설정 `timeStep`·`maxSubSteps`를 fixed clock에 주입, 이월 상한 문구와 구현 일치 | S-H04, `advance(0.2)` 100회 후 이월 ≤ 상한 |
| COR-05c | 스케줄러 밖 루프를 모두 시스템이나 공유 채널로 옮긴다. 허용 목록은 비운다.<br>· 렌더 출력 없는 Driver 컴포넌트(building RenderState·Visibility·NavigationObstacle, GrassDriver, Footsteps, ToolUseController, RoomVisibilityDriver, `PerformanceCollector`)<br>· raw `useFrame` 2곳, drei `useAnimations`<br>· rAF 4곳, clock 없을 때의 네트워크 타이머<br>· 인스턴스별 프레임 등록(SpeechBalloon, HouseDoor, RemotePlayer) | 렌더 출력 없는 시스템 컴포넌트 0, 스케줄러 밖 per-frame 콜백 0 |

### COR-06 `runtime.mode`

| Slice | 내용 | 완료 기준 |
|---|---|---|
| COR-06a | 상태 머신, 시스템 `modes` gating, pause 시 fixed lane 정지 | S-H06 |
| COR-06b | play copy, autosave 중단(SaveSystem 인스턴스 상태로, 전역 `autoSaveSuspension` 제거), `persistPlayChanges` | S-H05 |
| COR-06c | 기존 모드 출처 4곳을 adapter로, `isInEditMode` 소비 5곳을 `runtime.mode`로 | buildingStore 모드 참조 0 |

### COR-07 PhysicsSystem

| Slice | 내용 | 완료 기준 |
|---|---|---|
| COR-07a | physics 서비스(Rapier 모듈 주입, 과도기 R3F 호스트는 `<Physics>` World 연결), `rigidBody`/`collider` 컴포넌트 시스템, 동기화 지점(3.3절), 접지 상태 World 소유(D-17), 전역 Motion·Physics bridge와 StateManager fallback 제거 | runtime 2개 접지 분리 테스트, `SceneObjectBody` 동작 동일 |
| COR-07b | 건설 정적 collider 집합과 id diff 갱신 | 편집 1회에 바뀐 collider만 생성·제거(카운터) |
| COR-07c | 카메라 충돌 Rapier shape cast. "나중에 추가된 장애물을 즉시 감지" 계약 테스트 유지 | camera phase ms 감소 기록, 계약 테스트 통과 |
| COR-07d | 최종 소유 이전(M3 끝, React 바디 이전 완료 후): runtime이 World 생성·해제, step·이벤트 drain·transform 동기화를 시스템으로, `<Physics>` 의존 제거 | 호스트 두 개에서 같은 physics 테스트 통과, `@react-three/rapier` import가 호환 adapter에만 |

### COR-08 headless 호스트

| Slice | 내용 | 완료 기준 |
|---|---|---|
| COR-08a | `createHeadlessHost(runtime, { dt })`, 입력 재생, Node에서 Rapier compat 초기화 | S-H07 |

### COR-09 runtime 스코프

| Slice | 내용 | 완료 기준 |
|---|---|---|
| COR-09a | 남은 문자열 서비스 키(runtime 내부 14개, 상수 3개, plugin 기본 id 23개, literal 조회)를 도메인 `defineService` 키로. literal 금지 lint | 문자열 literal 서비스 키 0 |
| COR-09b | `runtime.get(key)`, `GaesupRuntime` store 필드를 위임 getter로(`@deprecated`), struct 필드(clockLoop, navigation, stateManager, npcSimulation, bridge)를 서비스로, kit 자체 등록과 기본 preset. kit을 등록하면 저장 binding도 항상 함께 등록한다(지금은 plugin이 없으면 building·npc가 저장되지 않음) | kit 없는 runtime에서 해당 store 0, preset runtime은 기존 테스트 통과, kit 등록 runtime의 저장 도메인 목록 테스트 |
| COR-09c | legacy store lazy 생성, import 부수효과 제거(`ensureSystemListeners`, `subscribeDefaultAutomation`, presets localStorage 읽기, NPC 조건 store 등록, `enableMapSet`, 기본 reinforcement 등록), fallback dev 경고 | S-H14 |
| COR-09d | 순수 전역 store 4종(`assetStore`, `toastStore`, `editorStore`, `UIConfigStore`)을 runtime 스코프로, `window.CHARACTER_URL` 기록 제거 | S-H08 |
| COR-09e | 외부 `getState/setState` 사용 lint와 도메인별 호출처 이전. legacy store 제거는 2.0 | lint 위반 0 |

### COR-10 오류

| Slice | 내용 | 완료 기준 |
|---|---|---|
| COR-10a | runtime별 sink(다중 runtime dispose 순서가 섞여도 해제된 `onError`가 복원되지 않음), 시스템 단위 격리, `GaesupErrorBoundary`가 `reportError`로 보고, 오류 경계 통합(`ModelErrorBoundary`, NPC part boundary, `PreviewBoundary`) | 다중 runtime dispose 순서 테스트, production 기본 sink 테스트 |
| COR-10b | `GaesupError` 계층, 빈·주석 catch 정리. 결과 타입을 `Result<T, E>`(`{ ok: true, value } | { ok: false, error }`) 하나로: 새 코드는 이것만 쓰고 기존 `{success}`, `{accepted, issues}`는 경계 adapter로 변환 | 빈 catch 0, 새 `{success}` 반환 0(lint 또는 ratchet) |

### COR-11 스크립트

| Slice | 내용 | 완료 기준 |
|---|---|---|
| COR-11a | `ScriptRuntime`을 runtime 서비스가 소유, `fixedUpdate`는 fixed lane, sync는 delta, hook 클로저 제거, find는 인덱스, 스크립트 트랜스폼은 핸들이 바뀔 때만 기록(`useScriptObjectTransform`의 매 프레임 기록 제거) | S-H04, dispatch당 전체 순회 0 |
| COR-11b | `ctx.getComponent<T>(type)`, `ctx.physics`, typed 서비스 접근, 같은 scriptId 재등록 시 인스턴스 재생성, 스크립트 레지스트리 runtime 스코프 | 재등록 테스트 |

### COR-12 boilerplate 정리

| Slice | 내용 | 완료 기준 |
|---|---|---|
| COR-12a | 새 코드는 bridge를 만들지 않는다(시스템과 `EntityWorld` 조회로 대체). 기존 bridge는 도메인 이전(30 PRD) 때 시스템으로 바꾼다. 남는 동안은 `CORE_BRIDGES` 명시 목록 하나와 runtime 소유 캐시 하나로 등록(D-12 잔여, `getOrCreateFor` 재등록 제거) | `CORE_BRIDGES`와 `BridgeRegistry.list()` 비교 테스트 |
| COR-12b | DI(`@Service`/`@Inject`), decorator, `reflect-metadata`, `experimentalDecorators` 제거. `decorators/bridge.ts` 깨진 인코딩 주석 정리 | `reflect-metadata` 0, export snapshot 불변 |

## 5. 공개 API 영향

- 추가만:
  - `EntityWorld`, `defineComponent`, `defineSystem`, `defineService`
  - `runtime.mode`, `runtime.tick`, `runtime.stats`, `runtime.get`
  - `createHeadlessHost`, `useSceneEntity`, `persistPlayChanges`, `onError`
- 기존 API는 adapter로 유지한다. `SceneObjectBody`, `RigidBody` 기반 컴포넌트, `editorSlice.playMode`, `createEditorPlayModeController`, `ScriptPlayModeSource`, `GaesupRuntime` store 필드가 해당한다.
- 동작 변경:
  - `onFixedUpdate` 호출 빈도가 고정 틱으로 바뀐다.
  - 에디터 Play 변경이 기본적으로 저장되지 않는다.
  
  둘 다 minor 릴리스 노트에 적는다.
- 2.0에서 제거하는 것:
  - legacy 전역 store와 정적 `getState/setState`
  - `GaesupRuntime` store 필드
  - `src/blueprints`(prefab + script로 흡수)
  - bridge·decorator 공개 잔재

## 6. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| world model이 하나 더 생김 | `EntityWorld`는 projection으로 한정하고 영속 원본은 `SceneDocument` 하나(G1) |
| mount 순서에 기대던 코드가 순서 고정 후 깨짐 | COR-05a에서 현재 순서를 테스트로 먼저 기록하고 같은 순서로 등록 |
| Rapier 소유 이전 중 캐릭터 조작감 변화 | 입력 재생 결정성 테스트(S-H07)와 기존 motions 테스트, 이전 기간 동안 두 경로 비교 |
| SoA 저장이 이득 없음 | `TransformSystem`만 SoA로 시작하고 나머지 컴포넌트는 측정 후 결정 |
| play copy 복제 비용 | 불변 스냅샷 참조 복제로 시작, 쓰기는 command로만 |
