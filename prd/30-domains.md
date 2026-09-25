# PRD-30 도메인 이전

| 항목 | 값 |
|---|---|
| 우선순위 | P0(DOM-01, DOM-03a, DOM-08a, DOM-11a), 나머지 P1 |
| 마일스톤 | M0(DOM-03a, DOM-11a), M2(DOM-01), M3(나머지) |
| 선행 | 10 PRD(코어), 20 PRD REN-01(RenderWorld) |

## 1. 목표

도메인을 하나씩 새 코어(`EntityWorld`, `defineSystem`, PhysicsSystem, RenderWorld) 위로 옮긴다. 도메인 이전의 완료 조건은 세 가지다.

1. 해당 도메인의 수용 시나리오가 녹색이다.
2. 기존 기능 체크리스트와 테스트가 통과하고, 이전 기간에는 S-B12(옛 경로 대 새 경로 화면 비교)가 통과한다.
3. 옛 경로를 지운다. 공개 API는 adapter로 남기고 2.0에서 제거한다.

순서는 building → 월드 오브젝트 → NPC → 캐릭터·탈것 → 카메라·입력·애니메이션 → 원격 플레이어·네트워크 → 게임플레이 kit → 내비게이션 → minihome이다. building이 가장 크고, 편집 비용 문제 대부분(00 문서 3절)이 여기에 있어서 먼저 한다.

## 2. 공통 규칙

- 도메인 데이터 중 영속 데이터는 `SceneDocument`에, 편집 도구 상태는 비영속 store에 둔다.
- 도메인 시스템은 `defineSystem`으로 등록하고 렌더 출력 없는 React 컴포넌트를 두지 않는다.
- 렌더는 RenderWorld 추출로 한다. 도메인은 컴포넌트 데이터만 쓴다.
- 도메인 간 정보는 port로 받는다(날씨·시간은 `EnvironmentState`, 지면은 `SurfaceProvider`, 모드는 `runtime.mode`).

## 3. 작업

### DOM-01 building(M2)

현재 상태 [확인]:
- **buildingStore가 한 파일에 모든 것을 담는다**(1,635줄, action 93개). 영속 데이터와 편집 UI 상태(`current*` 약 70개)가 섞여 있다. `runtimeContext`를 import하고 `initializeDefaults`에 데모 데이터 약 370줄이 있다.
- **타일 하나 편집 비용이 타일 수에 비례한다.** `addTile`의 immer draft가 그룹 `tiles` 배열과 `tileGroups` Map을 복사한다(`building/stores/buildingStore.ts:948`). 중앙값은 1만 타일 1.04ms, 2만 타일 2.78ms다.
- **편집마다 파생 데이터를 전부 다시 계산한다.** 내비게이션은 전체 reset(`BuildingNavigationObstacleDriver/index.tsx:37-57`), minimap은 전체 재그리기, batch·스냅샷·가시성 sync는 O(엔티티)다.
- **렌더와 collider가 그룹 단위다.** 그룹 System 컴포넌트가 렌더를 맡고, collider는 목록 단위로 통째 교체한다(`BuildingColliders/index.tsx:24`).
- **날씨 상태가 두 곳에 있다.** `buildingStore.weatherEffect/showSnow`와 `weatherStore`다.

설계:
- **문서 구조:** 타일 그룹과 벽 그룹을 `SceneDocument` 객체로 둔다. 그룹 아래에 16×16 셀 chunk 자식 객체를 두고, chunk마다 `gaesup.buildingChunk` 컴포넌트에 셀 배열을 담는다.
  - 편집 1회는 chunk 하나만 복사하므로 비용이 그룹 크기와 무관하다.
  - Hierarchy에는 그룹이 나오고 chunk는 접어 둔다.
- **파생 데이터:** 렌더 batch 범위, 정적 collider 집합, 내비게이션 dirty 영역, minimap 갱신을 모두 chunk 단위로 한다.
- **공간 조회:** `BuildingSpatialIndex`는 chunk delta로 증분 갱신한다. store factory closure가 소유하고 state에는 revision만 둔다.
- **store 분리:** 편집 도구 상태는 `buildingEditorStore`(비영속)로 나눈다. 기존 `useBuildingStore(selector)`는 facade로 유지한다.

| Slice | 내용 | 완료 기준 |
|---|---|---|
| DOM-01a | `buildingEditorStore` 분리(도구 상태 비영속), 데모 데이터 파일 분리, 날씨 상태를 `weatherStore` 하나로, `runtimeContext` 의존 제거. facade 유지 | 파일 500줄 이하, export snapshot 불변, 기존 building 테스트 통과 |
| DOM-01b | chunk 문서 구조와 building command adapter. 기존 action 시그니처는 SceneDocument command를 발행하는 adapter. 기존 저장 포맷 load migration | S-H09, save/load 왕복 동일, 편집 undo 동작 동일 |
| DOM-01c | 파생 데이터 chunk 증분화: `BuildingSpatialIndex`, 내비게이션 dirty 재래스터, minimap 뷰 범위 조회, 정적 collider id diff(COR-07b). 배치 검사·지지 높이·`findTerrainBlockMaterial`·`placeObject` 높이 탐색은 인덱스 후보 조회로. `isOccupied`가 열의 id마다 셀 목록 전체를 훑는 문제(큰 블록에서 후보 × 65,536) 수정 | S-H09, 타일 1개 추가 시 내비게이션 전체 reset 0 |
| DOM-01d | 렌더를 RenderWorld 추출로(REN-01): 타일·벽·블록·잔디·모래·물·오브젝트 batch. 그룹 System 컴포넌트와 `BuildingBatches` 제거. 편집 오버레이 REN-04 | S-B05, S-B06, S-B12 |
| DOM-01e | 렌더 출력 없는 Driver(RenderState, Visibility, NavigationObstacle)를 시스템으로(COR-05c). readback 드라이버 5종 export `@deprecated`, `render/upload.ts`의 쓰지 않는 meta·indirect args buffer 정리, `examples/performance/scenarios/domains.tsx`의 `world-render-state` 시나리오를 실제 런타임 구성으로 교체, `probe-building-gpu-culling.cjs` 처리 | Driver 컴포넌트 0 |

### DOM-02 월드 오브젝트(M3)

현재 상태 [확인]:
- **`PassiveObjects`:** 거리 LOD로 `RigidBody`를 mount/unmount해서 collider 수명이 LOD에 묶여 있다(`world/components/PassiveObjects:115-133`).
- **`Tree`:** 나무마다 geometry·재질 3개와 매 프레임 콜백을 가진다(`world/components/Tree/index.tsx:114-132`).
- **`BugSpot`·`FishSpot`·`Tree`:** 게임플레이 콘텐츠인데 엔진 `world` 도메인에 있다.
- **`WorldSystem`:** 입력 position 참조를 그대로 보관한다(D-18). 본문이 비어 있는 `update`가 있다.

| Slice | 내용 | 완료 기준 |
|---|---|---|
| DOM-02a | 오브젝트를 엔티티 + 표준 컴포넌트(`meshRenderer`, `collider`, `interactable`)로. LOD는 렌더만 바꾸고 collider는 유지. `Tree`는 인스턴스 batch와 TSL 흔들림(프레임 콜백 0) | 나무 N개에서 재질 수 N과 무관, 프레임 콜백 0 |
| DOM-02b | `WorldSystem`·`WorldBridge`·`worldObjectStore`를 `EntityWorld` 조회 facade로 바꾸고 `@deprecated`(D-18 해소, 그 전까지 G6 JSDoc). gaesupStore의 두 번째 world model(`worldStates` slice, 작업마다 `new Map`)을 `@deprecated`하고 examples 사용처 교체. 게임플레이 콘텐츠(`BugSpot`, `FishSpot`)를 kit으로 | 공개 API 테스트 통과, 엔진→kit edge 감소 |

### DOM-03 NPC(M0, M3)

현재 상태 [확인]:
- 기본 두뇌가 `reinforcement/openai`이고, 엔드포인트 `localhost:8091`로 NPC마다 약 1.5초마다 요청을 보낸다. 실패해도 백오프가 없다(`npc/core/reinforcement.ts:24,143`).
- `initializeDefaults`가 사용자가 고른 두뇌까지 reinforcement로 덮어쓴다(`npcStore.ts:228-241`).
- npcStore가 1,043줄이다. 결정 틱마다 전 인스턴스를 복사하고(`NPCSimulation.ts:113-120`), 관찰·결정을 store에 기록해 구독자 전원을 깨운다(`npcStore.ts:927-936`).
- 렌더는 파츠별 skeleton·mixer다(REN-09).

| Slice | 내용 | 완료 기준 |
|---|---|---|
| DOM-03a(M0) | 정책 요청 기본 끔: 엔드포인트를 명시 설정했을 때만 요청, 전송 실패 시 공유 circuit breaker(`backoffUntil = now + min(60s, 1s·2^실패)`), 기본 두뇌는 policyId 없는 scripted. `attachReinforcementBrainToInstances`는 두뇌 없는 NPC에만. import 시 기본 adapter 등록 제거(COR-09c와 함께) | S-H11 |
| DOM-03b | npcStore 분할(카탈로그, 인스턴스, 두뇌 side table, action executor). 휘발 두뇌 데이터(`lastObservation`, `lastDecision`)는 React 밖 side table과 호환 getter. 결정 틱 스냅샷을 pose 버퍼 재사용으로, waypoint 도착 갱신을 틱당 배치 1회로 | 결정 틱 store 알림 ≤ 1, 파일 500줄 이하 |
| DOM-03c | NPC를 엔티티(`npc`, `animator`, 스킨 `meshRenderer`, `collider`)로, NPCSimulation을 fixed lane 시스템으로, LOD는 렌더 가시성으로(재마운트 0). 렌더는 REN-09 | S-B09, NPC LOD 경계 왕복 시 재마운트 0 |

### DOM-04 캐릭터·탈것(M3)

현재 상태 [확인]:
- **엔티티 상태 사본이 두 벌이다.** `EntityStateManager`와 `ManagedMotionEntity`가 Rapier 값을 복사해 둔다.
- **컴포넌트가 불필요하게 재렌더된다.** 크기·rideable 전체 구독과 gameStates 채널 때문에 PhysicsEntity 전체가 재렌더되고, RigidBody 옵션을 WASM으로 다시 적용한다(`motions/hooks/useGaesupGltf.ts:24`).
- **파츠 교체 비용이 크다.** 의상 파츠를 마운트할 때 쓰지 않는 `SkeletonUtils.clone`이 돌고, joint remap 결과를 캐시하지 않는다(`motions/entities/refs/PartsGroupRef.tsx:155`).
- **스킨 메시가 컬링되지 않는다.** 모든 스킨 메시가 `frustumCulled=false`다(`PartsGroupRef.tsx:121`).
- **핫패스에서 매 틱 할당이 일어난다.** 컨트롤러 옵션 리터럴, `PhysicsSystem.ts:312-322` 클로저, `ImpulseComponent`·`NavigationSystem`의 옵션 객체, `AbstractSystem` 계측이 해당한다.

| Slice | 내용 | 완료 기준 |
|---|---|---|
| DOM-04a | 플레이어·탈것을 엔티티로, 이동·점프·탑승 로직을 fixed lane 시스템으로, 바디는 PhysicsSystem 소유(COR-07a). `usePlayerPosition`과 부착물은 `presented` 위치(COR-03b) | S-H07, 기존 motions 테스트 통과, 144Hz에서 부착물 흔들림 0 |
| DOM-04b | 파츠 마운트 비용(불필요 clone 제거, remap 캐시), 본 부착 부모 역행렬을 캐릭터당 1회 공유, `useGaesupGltf`의 크기·rideable 전체 구독 제거(바디 옵션 재적용 0), 스킨 메시 bounds 기반 컬링, 핫패스 할당 제거(모듈 scratch, 고정 콜백) | 파츠 교체 1회 할당 감소 기록, steady state 틱 할당 0(S-B03 기록) |

### DOM-05 입력(M3)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| DOM-05a | 입력을 zustand에서 빼고 `WorldInputBackend` snapshot을 canonical로. React 소비자는 revision 기반 `useInputSnapshot(selector)`, 시스템은 snapshot 직접 읽기. `interaction.keyboard/mouse/gamepad`는 `@deprecated` getter. D-11 해소. 입력 타입과 `useInputBackend`를 `input` 도메인으로. 게임패드 중복 폴링 제거 | 스틱 입력 중 gaesupStore 알림 0 |

### DOM-06 애니메이션(M3)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| DOM-06a | 애니메이션 결정은 `AnimatorRuntime`만. AnimationBridge `play`와 NPC 문자열 `currentAnimation`은 Animator 파라미터로 변환. `animator` 컴포넌트 시스템 | 캐릭터·NPC 애니메이션 테스트, `AnimationController` 이름 중복 해소 준비 |

### DOM-07 카메라(M3)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| DOM-07a | 카메라 컨트롤러를 presentation lane 시스템으로(`presented` 위치 추적). 충돌은 COR-07c. `camera/cinematic.ts`의 게임플레이 store 의존은 port로. `useCamera` `useThree` selector | 카메라 계약 테스트 통과, 카메라→kit edge 0 |

### DOM-08 원격 플레이어·네트워크(M3, DOM-08a는 언제든)

현재 상태 [확인]:
- **Update 메시지:** transform과 animation만 보내고 식별 필드는 Join·변경 시에만 싣는다. 정지 중에는 1Hz keepalive뿐이다. rate limit은 `PlayerNetworkManager` 한 곳이다.
- **원격 아바타:** transform 메시지는 React를 거치지 않고 공유 프레임 채널 하나에서 보간한다(`networks/core/remoteMotion.ts`). 원격 플레이어는 아직 엔티티가 아니다.
- **연결:** half-open 감지, jitter 백오프, 재연결 중 원격 플레이어 유지, 피어별 token bucket(PlayerUpdate, Chat)이 있다. `compressionLevel`·`enableEncryption`은 `@deprecated`다.
- **`MultiplayerCanvas`:** HDR을 외부 CDN에서 받아 월드 전체를 대기시키고, 채팅·입퇴장마다 memo가 깨지고, WebGPU 렌더러를 쓰지 않는다(`MultiplayerCanvas.tsx:72,113`).
- **NPC `NetworkSystem`:** 매 틱 큐를 통째로 slice한다. `useNetworkGroup`은 메시지를 전달하지 못하면서 250ms 폴링을 계속한다.

| Slice | 내용 | 완료 기준 |
|---|---|---|
| DOM-08a | 정확성: D-06 `verifyActor` 미지정 시 최초 1회 경고와 `trustActors` 옵션(2.0 기본 거부, G4), D-07 transport가 채우는 `senderId`와 `VisitLeave`는 `senderId===hostId`만 수용, 원격 모델 URL은 path prefix allowlist와 `allowedModelOrigins`·`resolveModel(assetId)` 전달, 검증기 하나, 퇴장 후 캐시 해제 | 재현 테스트(위조 `VisitLeave` 무시, allowlist 밖 로드 0) |
| DOM-08c | 원격 플레이어를 transient 엔티티로 바꾸고, 공유 채널 보간(`remoteMotion`)을 SoA 시스템 하나로(wasm `batch_smooth_damp` 재사용). 원격 모델 렌더는 RenderWorld 스킨 인스턴스(REN-09a) | S-B14, 원격 24명에서 per-avatar 프레임 등록 0 |
| DOM-08d | `NetworkSystem`이 매 틱 큐를 통째로 slice하지 않고 소비자가 없으면 멈춘다. `useNetworkGroup`은 group 메시지를 전달하거나 250ms 폴링을 없앤다. authority 직렬 큐를 domain이 아닌 target 단위로 | 틱당 할당 0 테스트, 소비자 없는 엔진 틱 0 |
| DOM-08e | 프로토콜 하나(`adapter/contracts`)와 codec 경계(`PlayerNetworkManager`는 transport로), visit 메시지 흡수, 이어서 binary codec(버전 협상) | codec 왕복 테스트, binary Update ≤ 32B |
| DOM-08f | `MultiplayerCanvas`: 로컬 환경맵(외부 HDR 0)과 별도 Suspense, memo 안정화, `createRenderer` 사용, 이름표 폰트 로컬화 | S-B07(원격 입장 중 월드 유지), 외부 CDN 요청 0 |
| DOM-08g | minihome 서버 fan-out 문자열 1회 생성과 SSE backpressure | SSE 클라이언트 24개 부하 스크립트 |

### DOM-09 게임플레이 kit(M3)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| DOM-09a | kit 자체 등록(COR-09b)과 `defineStoreDomainPlugin`(PKG-04c). 의존이 적은 kit(mail, town, catalog)부터 | kit 없는 runtime에서 해당 store 0 |
| DOM-09b | 작은 비용 정리: 오디오(suspended 중 노드 누적, 디코드 캐시 상한·동시 요청 병합), toast 배열 상한과 `ToastHost` 없을 때 폐기, CropPlot·HousePlot 인스턴스 batch(RenderWorld), 미니맵 마커 증분, 상호작용 후보 조회를 `SpatialGrid`로, 발소리 지면 판정을 인덱스로, 하늘 keyframe 색 사전 파싱, `getCachedTrig`를 `Math.sin/cos`로 | 항목별 카운터·테스트(각 PR에 명시) |

### DOM-10 내비게이션(M3)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| DOM-10a | traversal grid 재사용, 장애물 dirty 영역 갱신(DOM-01c), `NavigationSystem.ts` 분할, 워커 인터페이스(grid transfer, revision 기반 재전송), 클릭 이동 경로 선은 경로가 바뀔 때만 버퍼 갱신 | 256² grid 100회 요청 시 long task 감소 기록 |

### DOM-11 minihome(M0, M3)

minihome은 제품 예제다(`examples/minihome`). 라이브러리 수용 장면이면서, 새 코어가 제품 요구를 받치는지 보는 기준이다.

| Slice | 내용 | 완료 기준 |
|---|---|---|
| DOM-11a(M0) | 대기 시 루프 정지(자연 모션은 입력 없을 때 30Hz 이하·N초 후 정지, `prefers-reduced-motion` 존중), 그림자 갱신은 caster 변화가 있을 때만(잔디 `castShadow` 옵션은 REN-08), 지형 InstancedMesh `updateRange` 업로드와 크기 기반 capacity, 잔디 chunk 재사용, 보기 모드 불필요 raycast 제거, 편집·presence마다 전체 JSON 직렬화 제거, 이동 경로 선 버퍼 수정, 아바타 파츠 병렬 로드 | S-B11 |
| DOM-11b(M3) | minihome을 새 코어 위로 재구성: 자체 projection(`roomEngine.ts:128-152` 전체 재파싱·재구축)과 `miniroom.furniture` 전용 경로를 표준 컴포넌트와 RenderWorld로. 기능 체크리스트(`probe-minihome-features`, `probe-minihome-town`, `probe-minihome-lighting`) 유지 | 기능 probe 통과, S-B11, S-B12 |

## 4. 공개 API 영향

- **유지:** `useBuildingStore`, NPC hooks, `RemotePlayers`, `MultiplayerCanvas`, `WorldSystem`, `PassiveObjects`, `Tree` 같은 공개 컴포넌트와 hook. 내부만 엔티티·시스템으로 바꾼다.
- **추가만:** `allowedModelOrigins`, `resolveModel`, `trustActors`, `useInputSnapshot`, `buildingEditorStore` hook.
- **2.0에서 제거:** `@deprecated` 표시한 것. `interaction.keyboard/mouse/gamepad`, `WorldSystem` 계열, `BuildingUI`, 네트워크 효과 없는 설정 필드가 해당한다.

## 5. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| building 저장 포맷 변경으로 기존 저장본 손상 | load migration과 legacy 저장본 테스트(S-H12), 저장 포맷 버전 필드 |
| chunk 구조로 편집 기능(그룹 이동·복제) 비용 증가 | 그룹 단위 명령은 chunk 부모의 트랜스폼만 바꾼다. 복제는 chunk 참조를 재사용하는 batch 명령 |
| 도메인 이전 중 화면 차이 | S-B12 A/B 비교, 차이가 임계를 넘으면 이전 PR을 막는다 |
| Update 포맷 변경으로 구버전 서버·클라이언트 비호환 | 메시지 버전 필드, 서버가 구버전 Update도 받는 기간 |
