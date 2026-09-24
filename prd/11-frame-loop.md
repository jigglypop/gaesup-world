# PRD-11 프레임 루프와 시뮬레이션 핫패스

| 항목 | 값 |
|---|---|
| 우선순위 | P0 |
| 트랙 | Fast(11-a~e) → Epoch(11-f 물리 시계 통합) |
| 선행 PRD | 10(측정), 00(D-01, D-10) |
| 담당 agent | runtime |

## 1. 배경과 문제

프레임 스케줄러 자체는 잘 설계되어 있다. `FrameScheduler.ts:91-135`는 phase 배열, tick 중 지연 compaction, 예외 격리를 갖추고 프레임 중 할당이 없다. raw `useFrame`은 lint로 막혀 5곳만 남았다. 문제는 스케줄러 **안에서 도는 작업의 비용**과 스케줄러 **밖에 남은 루프**다.

1. 카메라 충돌이 기본으로 켜져 있고, 매 프레임 씬 전체를 순회하며 모든 객체의 행렬을 다시 계산한다. InstancedMesh는 인스턴스 전체를, SkinnedMesh는 CPU 스키닝으로 전체 삼각형을 검사한다.
2. 60Hz로 바뀌는 값(게임 시간 소수 분, 클릭 이동 입력, NPC 관찰)이 zustand store에 매 틱 `set`되어 구독자 전체를 깨운다.
3. 물리 시계가 R3F와 다른 rAF에서 돌아 입력에서 화면까지 1프레임이 늦고, 보간된 캐릭터와 카메라가 어긋난다.
4. 인스턴스마다 숨은 `useFrame`(drei `useAnimations`)과 개별 `useEngineFrame` 등록이 남아 있다.

## 2. 목표 / 비목표

**목표**
- 카메라 충돌 비용을 씬 크기와 무관하게 만든다.
- 60Hz store `set`을 분 단위·변경 시점 publish로 바꾼다.
- 물리 step, 보간 present, 카메라, 애니메이션의 순서를 `FRAME_PHASES` 하나로 명시한다.
- D-01, D-10을 수정한다.

**비목표**
- `FrameScheduler` 재작성. 채널과 phase를 추가하는 수준으로 확장한다.
- Rapier 교체.

## 3. 현재 상태

### 3.1 High

**11-F01 카메라 충돌: 매 프레임 씬 전체 순회, 인스턴스 전체 스윕, CPU 스키닝** [확인]
- 기본값: `camera/core/constants.ts:29-30` `ENABLE_COLLISION: true`. 호출은 `controllers/BaseController.ts:143-147`.
- 기본 target `'scene'`: `utils/camera.ts:99-100` → `collectCollisionMeshes`가 `scene.updateWorldMatrix(true, false)` 후 모든 객체에 `object.updateWorldMatrix(false, false)`(`:44-51`). 렌더러가 할 행렬 갱신을 한 번 더 한다.
- InstancedMesh, SkinnedMesh, BatchedMesh는 raycast를 override하므로 broadphase를 무조건 통과한다(`utils/sphereSweep.ts:19`). InstancedMesh는 인스턴스마다 `getMatrixAt` + box 8점 변환(`:144-148`), SkinnedMesh는 모든 삼각형에 `getVertexPosition`(`:118,147`)을 호출하고 그 전에 본 전체를 갱신한다(`camera.ts:137-139`).
- `intangible` 표시는 `PhysicsEntity.tsx:188`과 gpuInstanceBatch에만 있다. 파트 NPC(`NPCInstance.tsx:306`)와 `RemotePlayer.tsx:445`에는 없어 스키닝 검사 대상이 된다.
- 캐시가 있는 `CameraCollisionIndex.getTargets()`(`CameraCollisionIndex.ts:30`)는 호출처가 없다.
- 비용 [추정]: 씬 객체 N개의 행렬 곱 + 타일·벽·사쿠라 인스턴스 K개 + 원격 플레이어·파트 NPC 1명당 수 ms(5k 삼각형 기준).

**11-F02 NPC 결정 배치의 O(N²) store 갱신** [확인]
- `npc/core/NPCSimulation.ts:139` `snapshotInstances()`가 전체를 spread 복사(`:97-100`), `:144` `setInstanceObservations`, NPC마다 `:155-156` `setInstanceDecision` + `executeInstanceActions`. `idle` 하나가 `set` 3회(`npcStore.ts:811-817`).
- immer `state.instances.set(id, {...})`(`npcStore.ts:792,799`)는 `set`마다 Map 전체를 복사한다.
- 모든 NPC body에 틱마다 `{x,y,z}` 할당과 WASM 호출 2회(`setNextKinematicTranslation/Rotation`)를 한다. 정지한 NPC도 포함(`NPCSimulation.ts:123-131`).
- React 쪽 재렌더 증폭은 13-F04에서 다룬다.

### 3.2 Medium

**11-F03 게임 시간 store가 60Hz로 `set`** [확인]
- `time/stores/timeStore.ts:65-70` `totalMinutes`가 소수라 매 틱 `set({ totalMinutes, time })`. `time` identity는 분 단위로 유지하지만 `set` 자체가 모든 구독자를 깨운다.
- 구독자: `farming/stores/clock.ts:6-7`이 매 틱 `plots.getState().tick()`으로 plot 전체 순회(`plotStore.ts:145-`), `Tree/index.tsx:72` 인스턴스별 구독, weather·events·audio·npcSchedule ticker.

**11-F04 클릭 이동 입력이 전역 store를 거의 매 틱 갱신** [확인, 빈도 미검증]
- `motions/core/movement/DirectionComponent.ts:255-267`이 `mouse.angle === nextAngle`을 float로 비교해 거의 항상 달라지고, 그때마다 `new THREE.Vector2`를 담아 `setMouseInput` 호출.
- → `input/WorldInputBackend.ts:88-89` `snapshot()` + `[...this.listeners]` → `interactions/stores/slices.ts:180-189` `set(state => ({ interaction: {...} }))`.
- gaesupStore는 `devtools + subscribeWithSelector`(`stores/gaesupStore.ts:28`), 구독 지점 69곳.

**11-F05 물리 시계가 별도 rAF, 보간·카메라 순서 불일치** [확인, 지연 프레임 수 미검증]
- `simulation/AnimationClockLoop.ts:61-79`가 독자 rAF로 `clock.advance`. `runtime/frame/react/priorities.ts:2-6`의 `PHYSICS_STEP_PRIORITY` 슬롯은 비어 있다.
- 보간 present는 `WorldPhysics/index.tsx:32`에서 priority 0 raw `useFrame`으로 스케줄러 camera/effects phase보다 늦다.
- 카메라는 `activeState.position`(틱 단위 raw 값, `PhysicsSystem.ts:283`)을, `OutfitAvatar`(`character/components/OutfitAvatar/index.tsx:101-106`)는 보간 없는 body 스냅샷을 따른다.
- 영향: 60Hz 초과 디스플레이에서 카메라·부착물이 보간된 캐릭터 대비 흔들림. 입력-화면 1프레임 추가 지연.

**11-F06 숨은 per-instance `useFrame`과 순서 미정** [확인]
- drei `useAnimations`가 내부 `useFrame(mixer.update)`를 등록: `PhysicsEntity.tsx:63`, `NPCInstance.tsx:97`(파트마다), `RemotePlayer.tsx:124`, `RiderRef.tsx:26`.
- `motions/entities/refs/RigidPartRef.tsx:50-52` raw `useFrame` priority 0으로 mixer와 같은 priority. 실행 순서가 구독 순서(Suspense에 좌우)에 달려 1프레임 전 본 포즈를 따라갈 수 있다 [미검증].
- `character/boneAttachment.ts:19-22`가 파트마다 조상 체인을 2번 순회하고 역행렬 계산.
- 인스턴스별 `useEngineFrame` 등록: Tree, BugSpot, FishSpot, CropPlot, HouseDoor, SpeechBalloon, RemotePlayer.

**11-F07 `FixedStepClock` 이월 누적기 상한 없음(D-10)** [확인]
- `simulation/FixedStepClock.ts:73-81`. `time/core/timeClock.ts:87`의 `new FixedStepClock()`에 `project-settings/defaults.ts:11-12`의 `timeStep`/`maxSubSteps: 4`가 전달되지 않는다.

**11-F08 `PhysicsPresentation.present`가 pose마다 조상 체인 3회 순회** [확인]
- `simulation/PhysicsPresentation.ts:38-42` `updateWorldMatrix` + `worldToLocal`(내부 invert) + `getWorldQuaternion`(내부 decompose). NPC 50체면 프레임당 수백 회 compose.

**11-F09 automation 무한 재귀(D-01)** [확인]
- `motions/entities/ManagedMotionEntity.ts:34-41,96-110` ↔ `boilerplate/bridge/AbstractBridge.ts:87-94,119-126`. 재진입 guard가 없다.

### 3.3 Low(프레임·틱당 소량 할당)

| 위치 | 내용 |
|---|---|
| `ThirdPersonController.ts:177-182`, `ChaseController` | 옵션 객체 리터럴 프레임마다 할당 |
| `PhysicsSystem.ts:312-322` | `updateStateIfChanged` 클로저 틱마다 2개 |
| `ImpulseComponent.ts:464,475`, `NavigationSystem.ts:270,733` | 이동 중 옵션·footprint 객체 3개 이상 |
| `AbstractSystem.ts:100-106`, `decorators/system.ts:38-40`, `monitoring.ts:219-220` | update마다 `performance.now()` 2회 + `Date.now()`, decorator 래퍼의 rest 인자와 `apply` |
| `useCameraBridge.ts:25-27` | `'camera:system'` 콜백이 metrics와 `Date.now()`만 처리 |
| `AnimationClockLoop.ts:65`, `BrowserGamepadHub.ts:75-77`, `input/actions/browserDevices.ts:42,46` | rAF마다 클로저, 템플릿 문자열 키, `getGamepads()` 중복 폴링 |
| `useEntityLifecycle.ts:23-37` | 엔티티마다 별도 rAF |
| `useCamera.ts:35` | `useThree()` selector 없음 |
| `Clicker/PathLine.tsx:72-73` | 100ms마다 경로 불변이어도 `slice` + `setPositions`로 버퍼 재생성 |
| `NavigationSystem.ts:327-338,470` | `findPath`마다 W·H traversal grid 전체 재할당(스파이크) |

### 3.4 2차 분석 추가(2026-09-24)

**11-F10 카메라 충돌이 후보마다 narrow phase 2회** [확인]
- `camera/utils/camera.ts:141-153`이 후보 메시마다 `raycaster.intersectObject`(삼각형 단위, InstancedMesh는 인스턴스 단위)와 `sweepSphereMesh`를 모두 실행한다. ray 결과는 sweep이 빗나갔을 때만 쓴다. `radius > 0`이면 swept sphere가 ray를 포함하므로 raycast는 중복이다.
- `utils/sphereSweep.ts:123`이 메시마다 매 프레임 `visit` 클로저를 만든다.
- 11-F01과 곱해지는 비용이다.

**11-F11 `PhysicsPresentation`이 body를 step 앞뒤로 두 번 읽음** [확인]
- `simulation/PhysicsPresentation.ts:17-23` `beforeStep`이 직전 `afterStep`(`:25-32`)에서 읽은 translation/rotation을 다시 읽는다. body마다 step당 WASM 호출 4회와 객체 4개. sleeping body도 포함한다.

**11-F12 rapier step 후 모든 RigidBody 순회, 건물 collider가 fixed body에 묶임** [확인, 비용 미검증]
- `@react-three/rapier` step 뒤 `rigidBodyStates.forEach`가 body마다 `getRigidBody`, `isSleeping`을 호출하고, 깨어 있는 body는 `translation()`, `rotation()`, compose/decompose까지 한다(`react-three-rapier.esm.js:922-958`).
- `building/components/BuildingColliders/index.tsx:19`가 그룹마다 `<RigidBody type="fixed">`로 collider를 감싸 이 순회 대상이 된다. fixed body가 sleeping으로 판정되는지는 계측이 필요하다 [미검증].
- collider 분할이 과하다: 평면 타일마다 cuboid 1개(병합 없음), 계단 16~32개, 경사로 12~24개, 원형 5개(`TileSystem/layout.ts:29,37,90-117`). 편집 1회에 그룹의 position/rotation 배열이 새로 만들어져 그룹 내 모든 collider의 WASM setter가 다시 돈다.

**11-F13 값이 같아도 매 틱 Rapier setter 호출** [확인]
- `motions/core/system/PhysicsSystem.ts:227-243` `setLinearDamping`, `setEnabledRotations`, `GravityComponent.ts:49-51` `setGravityScale`.

**11-F14 틱·프레임당 중복 계산과 전체 순회** [확인]
- `rendering/sky/index.tsx:137-141` 매 프레임 hex 문자열 `Color.set` 2회(정규식 파싱 + sRGB→linear), `:80` 객체 할당. keyframe 경계에서 색이 튄다.
- `scripting/ScriptRuntime.ts:123,133,143` 스크립트마다 phase마다 `() => hook(delta)` 클로저. `useScriptObjectTransform.ts:32-34` 변경 여부와 무관하게 매 프레임 position/rotation/scale 기록.
- `audio/components/Footsteps/index.tsx:34-58` 발소리마다 모든 타일 순회. `tileIndex`와 `getSupportHeightAt`이 이미 있다.
- `interactions/stores/interactablesStore.ts:95-101` 12.5Hz 선형 탐색. world `SpatialGrid`를 쓰지 않는다.
- `building/components/TileSystem/waterPatches.ts:66-82` patch 시작점마다 남은 셀 전체를 `split(':').map(Number)`로 순회. 그룹 편집마다 O(patch × cell).

## 4. 요구사항

**FR**
- FR-11-01: 카메라 충돌 후보는 이벤트로 무효화되는 캐시(`CameraCollisionIndex`)에서 가져온다. `'scene'` target도 같은 캐시를 쓴다.
- FR-11-02: SkinnedMesh는 기본 제외하거나 world bounding sphere로 근사한다. InstancedMesh는 메시 단위 AABB로 먼저 거른다.
- FR-11-03: `intangible` 표시를 캐릭터·NPC·원격 플레이어 루트에 일관되게 붙인다.
- FR-11-04: `timeStore`는 `floor(totalMinutes)`가 바뀔 때만 `set`한다. 소수 분은 비반응 getter로 제공한다.
- FR-11-05: NPC 결정 배치는 `applyNpcDecisions(batch)` 단일 `set`으로 적용한다. 관찰·결정 데이터는 React가 구독하지 않는 side table에 둔다.
- FR-11-06: 물리 step은 `FrameSchedulerHost`의 physics 슬롯에서 실행하고, present는 postPhysics phase 맨 앞에서 실행한다. 카메라와 부착물은 보간된 visual 위치를 읽는다.
- FR-11-07: mixer update는 `useSharedFrame({ phase: 'animation' })` 채널 하나에서 일괄 처리하고, 본 부착은 그 뒤 `late` 채널에서 처리한다.
- FR-11-08: 인스턴스별 `useEngineFrame`(Tree, BugSpot, FishSpot, CropPlot, HouseDoor, SpeechBalloon, RemotePlayer)을 도메인별 `useSharedFrame` 채널로 통합한다.
- FR-11-09: bridge listener 재진입을 막는다(D-01).
- FR-11-10: `FixedStepClock`은 이월분을 `maxSubSteps * dt`로 제한하고 초과분을 `droppedSeconds`로 보고한다. 프로젝트 설정을 생성 시 주입한다.
- FR-11-11: 카메라 충돌은 `radius > 0`이면 sweep만, `radius === 0`이면 raycast만 한다. sweep 콜백은 모듈 수준 함수로 둔다.
- FR-11-12: (보류, 2026-09-24) `beforeStep` 읽기는 step 사이 순간이동을 감지해 긴 보간 궤적을 막는 계약(`PhysicsPresentation.test.ts`)을 담당한다. 등록 pose가 캐릭터 등 소수라 이득이 작아 유지한다. `present`의 조상 체인 순회는 1회로 줄였다(11-h).
- FR-11-13: 건물 collider는 부모 RigidBody 없는 정적 collider로 만든다(11-F12 측정 후). 같은 높이 평면 타일은 사각형으로 병합하고, 경사로는 convex 1개, 계단은 단당 box 1개로 줄인다. 편집은 id diff로 바뀐 collider만 갱신한다.
- FR-11-14: Rapier setter는 마지막 적용값을 캐시해 바뀔 때만 호출한다. 하늘 keyframe 색은 사전 파싱해 lerp한다. 스크립트 hook은 클로저 없이 호출한다. 지면 종류·상호작용 후보 조회는 기존 인덱스(`tileIndex`, `SpatialGrid`)를 쓴다. water patch는 정수 키로 한 번 정렬한다.

**NFR**
- NFR-11-01: 카메라 충돌 1회 비용은 씬 객체 수에 비례하지 않는다(캐시 히트 시 행렬 갱신은 후보 메시에만).
- NFR-11-02: steady state에서 엔진 phase 프레임당 할당 0에 근접(10 PRD 예산).
- NFR-11-03: 스케줄러 밖 per-frame 콜백 0(rapier 내부 stepper는 허용 목록).

## 5. 설계

### 5.1 카메라 충돌

1단계는 기존 구조를 유지한다. `collectCollisionMeshes`를 `CameraCollisionIndex` 캐시 조회로 바꾸고, 캐시는 `Object3D` add/remove와 `userData.collisionDirty`로 무효화한다. 행렬 갱신은 후보에만 한다. SkinnedMesh는 `geometry.boundingSphere` × world scale로 근사한다.

2단계는 Rapier `world.castShape(ball(r))`로 옮긴다. 정적 collider BVH를 그대로 쓰고 플레이어 collision group을 제외한다. 다만 "같은 scene에 나중에 추가된 장애물을 즉시 감지"하는 기존 계약(`CameraControllers.test.ts`)을 유지해야 하므로, 캐시 무효화가 add 이벤트를 놓치지 않는지 테스트로 고정한다.

### 5.2 저빈도 publish

| 값 | 현재 | 변경 |
|---|---|---|
| 게임 시간 | 60Hz `set` | 분이 바뀔 때 `set`. farming은 `state.time !== prev.time`일 때만 tick |
| 클릭 이동 입력 | 각도 float 비교 후 매 틱 publish | 목표 waypoint 또는 `shouldRun`이 바뀔 때만 publish |
| interaction slice 입력 | 60Hz 새 state | 13 PRD FR-13-05로 store 밖 이동 |
| NPC 관찰·결정 | NPC마다 `set` 2~4회 | 배치당 `set` 1회, 휘발성 데이터는 side table |
| NPC kinematic 쓰기 | 모든 NPC 매 틱 | pose가 바뀐 NPC만 |

### 5.3 프레임 순서

```
input → prePhysics → physics.step(FixedStepClock.advance) → present(보간) → postPhysics
      → animation(mixer 일괄) → late(본 부착, 카메라) → effects → render(후처리)
```

`AnimationClockLoop`의 독자 rAF는 `FrameSchedulerHost`에 `canvas`가 있으면 쓰지 않고, 캔버스 없는 서버·테스트 환경에서만 쓴다. `WorldPhysics`의 raw `useFrame`과 `RigidPartRef`의 raw `useFrame`은 스케줄러 채널로 옮긴다.

### 5.4 할당 제거

3.3절 항목은 scratch 객체와 모듈 상수 옵션으로 바꾼다. decorator 래퍼 비용은 23 PRD에서 decorator 제거로 함께 없앤다.

## 6. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 11-a | D-01 재진입 guard, D-10 이월 상한과 설정 주입 | 재현 테스트 통과. `advance(0.2)` 100회 후 `deferredSeconds ≤ maxSubSteps*dt` |
| 11-b | 카메라 충돌 1단계(캐시, 후보만 행렬 갱신, SkinnedMesh 근사, `intangible` 일관화). 완료(2026-09-25): `'scene'` target도 `CameraCollisionIndex` 캐시를 쓰고(제외 목록별 필터 캐시), 지난 프레임 행렬로 거른 뒤 통과한 메시만 행렬을 갱신한다. InstancedMesh는 전체 인스턴스 bounds로 먼저 거르고, SkinnedMesh는 bind 자세 bounding sphere로 근사한다. 잔디·NPC·원격 아바타 루트에 `intangible`. 벤치(쿼리당): 화면 밖 메시 1만 5.0→0.45ms, InstancedMesh 1만 1.32→0.007ms, SkinnedMesh 6.8→0.005ms, `updateWorldMatrix` 2회로 크기와 무관. `/world?size=m` 할당 7.26→4.58MB/frame. 후속(2026-09-25): 메시 bounds를 통과한 뒤에도 삼각형마다 Vector3 연산을 하던 narrow phase가 `/world` 할당의 약 80%(9초 샘플 280MB 중 230MB, 대부분 sand skirt 한 메시)였다. swept sphere의 bounds를 인스턴스 로컬 공간으로 한 번 옮기고 원시 정점 좌표로 삼각형을 먼저 기각한다(visit 클로저도 제거). 할당 395→112KB/frame(샘플 280→69MB), script 3.29→2.78ms | `benchmark-camera-collision.cjs`에 SkinnedMesh(본 30, 삼각형 5k)·InstancedMesh(1k/10k) 케이스 추가. `updateWorldMatrix`·`getVertexPosition` 호출 수가 씬 크기와 무관 |
| 11-c | timeStore 분 단위 publish, farming tick guard. 완료(2026-09-25): 소수 분은 store 밖에서 누적하고 `floor`가 바뀔 때만 `set`한다. 진행 중 값은 비반응 `exactMinutes()`. farming clock은 `totalMinutes` 변화에만 tick하므로 분당 1회. 60틱 알림 ≤ 1 테스트 | scale=1로 60틱 동안 subscriber 호출 ≤ 1 |
| 11-d | 클릭 이동 입력 publish 조건 변경. 완료(2026-09-25): 각도는 매 틱 지역 상태로 갱신하고, 공유 입력에는 waypoint·run·active 변화만 알린다. 이동 60틱 동안 알림 1회 테스트 | 클릭 이동 60틱 동안 gaesupStore 알림 ≤ waypoint 변경 수 |
| 11-e | NPC 배치 단일 `set`, side table, 변경 NPC만 kinematic 쓰기. 완료(2026-09-25): 결정 틱은 관찰로 모든 결정을 먼저 계산하고 `applyNPCDecisions`로 관찰·결정 기록과 행동 실행을 `set` 한 번에 적용한다. 행동마다 store 액션 1~3회 호출하던 `executeInstanceAction(s)`도 같은 draft 적용 함수를 써서 호출당 `set` 1회다. 포트의 `applyNPCDecisions`는 선택이라 직접 구현한 store는 기존 경로를 쓴다. kinematic body는 포즈가 바뀐 틱에만 쓰고 translation 객체를 재사용한다. 행동 2개를 내는 NPC 50체: 결정 틱당 알림 151→1, 정지 NPC body 쓰기 60→0회/초. 관찰·결정 기록은 공개 `NPCInstance` 필드라 store에 남기고 렌더에서 무시한다(13-g) | 결정 배치 1회당 `setState` 1회 |
| 11-f | 물리 시계 통합, present·카메라 순서 정리(Epoch). 완료(2026-09-25): 매 프레임 렌더하는 캔버스(`frameloop='always'`)에서는 `WorldPhysics`가 `AnimationClockLoop.attachDriver()`로 시계 진행을 넘겨받아, 고정 틱을 prePhysics 마지막 entry에서 돌리고 보간 present를 postPhysics 첫 entry로 옮겼다(raw `useFrame` 5→4). 순서: input → prePhysics → 고정 틱(controls → Rapier → publish) → present → animation → camera. 시계의 별도 rAF는 드라이버가 없을 때(demand 렌더, 캔버스 없음)만 돈다. 활성 캐릭터는 보간된 world 위치를 `activeState.presentedPosition`에 게시하고 카메라 target(`activeStateUtils.getPosition`)이 이를 우선한다. 144Hz 2차 차분 측정은 headless가 60Hz라 수행하지 못했다 | frame-harness에 physics tick ↔ R3F frame lag probe 추가. 144Hz에서 카메라 target 2차 차분 감소 |
| 11-g | mixer 일괄 채널, 본 부착 late 채널, 인스턴스별 `useEngineFrame` 통합. 완료(2026-09-25, RemotePlayer는 14-e): drei `useAnimations`와 같은 API의 `useSharedAnimations`가 모든 mixer를 `animation` phase 공유 entry 하나에서 갱신한다(인스턴스마다 R3F 구독 하나, 엔진 phase 뒤에서 돌던 것). `PhysicsEntity`·`NPCInstance`가 쓴다. 강체 파츠 본 부착은 `lateUpdate` 공유 채널(raw `useFrame` 4→3). Tree·BugSpot·FishSpot·CropPlot·HouseDoor·SpeechBalloon은 도메인 `useSharedFrame` 채널로 옮겼다. `useSharedFrame`은 예외가 난 콜백을 영구 제외하던 것을 G2대로 다음 프레임에도 실행하고 스로틀 보고한다. 애니메이션 인스턴스 1→5개에서 R3F 구독 수 불변, animation phase entry 1 | R3F 구독 수와 스케줄러 count 비교 테스트. 스케줄러 밖 콜백 0 |
| 11-h | `PhysicsPresentation` 부모 역행렬 1회 계산, 중복 읽기 제거(FR-11-12), 3.3절 할당 제거 | frame-harness 프레임당 할당 감소 기록. body당 step당 `translation()` 호출 1회 |
| 11-i | 카메라 충돌 2단계(Rapier shape cast) | 1단계 대비 camera phase ms 감소, 기존 계약 테스트 통과 |
| 11-j | 카메라 narrow phase 단일화(FR-11-11) | `radius > 0`에서 `intersectObject` 호출 0, 기존 카메라 계약 테스트 통과 |
| 11-k | 건물 collider 구조(FR-11-13). 먼저 fixed body 순회 비용을 계측. 완료(2026-09-25): `BuildingColliderBody`가 부모 body와 장면 객체 없이 Rapier world에 정적 collider를 직접 만들고 목록이 바뀌면 그 목록만 교체한다. 같은 높이·격자의 1칸 직각 box 타일은 사각형으로 병합한다. `/world?size=m`: 타일 collider 10,000→25, fixed body 50→0, 장면 객체 17,162→6,615, script 81.9→64.3ms, 14.7fps. 정적 collider는 충돌 이벤트를 내지 않아 NPC·캐릭터가 바닥에 닿을 때 `onClick`/`onSelect`가 불리던 부작용도 사라졌다. 계단·경사로 slice는 캡슐 등반 때문에 유지(convex 경사로는 필요 시) | 타일 1k에서 collider 수와 step 후 순회 body 수 기록 후 감소 |
| 11-l | setter 캐시, 하늘 색 사전 파싱, 스크립트 hook, 인덱스 조회, water patch(FR-11-14) | 정지 캐릭터에서 setter 호출 0, 발소리 1회당 타일 순회 0 |

11-l 진행(2026-09-24): Rapier setter 캐시 완료(`motions/core/system/bodySettings.ts`, 바디별 마지막 적용값). 발소리 지면 판정은 타일 인덱스에 타일 종류가 없고 겹친 타일에서 결과가 달라질 수 있어 보류(초당 최대 6회 호출). 하늘 색, 스크립트 hook, water patch는 잔여.

## 7. 공개 API 영향

- `usePlayerPosition`의 `reactive` 기본값 변경은 13 PRD에서 다룬다.
- `CameraCollisionTargets`에 SkinnedMesh 포함 여부 옵션을 추가할 수 있다(추가만).
- `useMotion().enableAutomation`은 시그니처 유지, 동작 수정.

## 8. 검증과 완료 기준

```bash
corepack pnpm test -- src/core/camera src/core/simulation src/core/time src/core/npc src/core/motions --runInBand
node scripts/benchmark-camera-collision.cjs
node scripts/frame-harness.cjs --route=/world
corepack pnpm exec tsc -p tsconfig.build.json --noEmit
```

완료 기준: 10 PRD 예산 중 프레임 항목(엔진 phase ≤ 4ms, 스케줄러 밖 콜백 0, 할당 목표)을 M 장면에서 충족한다.

## 9. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 카메라 충돌 캐시가 새 장애물을 놓침 | add/remove 이벤트 무효화 + 기존 계약 테스트 유지 |
| 물리 시계 통합으로 탭 비활성 시 동작 변경 | 캔버스 없는 경로는 기존 rAF 유지. 비활성 복귀 시 이월 상한으로 폭주 방지 |
| 시간 publish 저빈도화로 부드러운 하늘색 전환이 끊김 | 하늘·조명은 frame loop에서 소수 분 getter를 직접 읽음 |

## 10. 열린 질문

1. 카메라 충돌 기본값(`ENABLE_COLLISION: true`)을 유지할 것인가. 11-b 측정 후 결정한다.
2. SkinnedMesh를 카메라 충돌에서 기본 제외해도 되는가(원격 플레이어·NPC를 카메라가 통과하게 됨).
