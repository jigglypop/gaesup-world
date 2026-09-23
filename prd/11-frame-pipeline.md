# PRD-11 프레임 파이프라인

| 항목 | 값 |
|---|---|
| 우선순위 | P0 |
| 트랙 | Epoch (프레임 실행 모델 변경) |
| 선행 PRD | 00, 13 (슬라이스 11-a는 병행 가능) |
| 후속 PRD | 12, 14, 15, 16 |
| 감사 | `frame-perf-auditor` |

## 1. 배경과 문제

- 프레임 코드가 raw `useFrame`으로 흩어져 있고 실행 순서는 컴포넌트 마운트 순서에 달려 있다. 물리와 카메라 사이에도 우선순위가 없다.
- `useBaseFrame`(`src/core/boilerplate/hooks/useBaseFrame.ts`)은 존재하지만 boilerplate 밖 사용처가 0이다. 이 함수는 브리지 `notifyListeners` 전용으로 설계되어 일반 프레임 작업에 쓰기 어렵다.
- 이펙트 메시(billboard, fire, flag, sakura, water)는 인스턴스마다 `useFrame`을 건다. 오브젝트 수만큼 콜백이 늘어난다. 반대로 `GrassDriver`는 드라이버 하나로 모아 처리한다.
- 물리 결과를 카메라가 한 프레임 늦게 따라갈 가능성이 있다(`<Physics interpolate>` 사용, 카메라는 step 이전 `activeState.position` 참조). 추정이며 측정 필요.
- R3F v10 alpha의 새 스케줄러가 같은 문제를 푼다. 정식 출시 전이므로 엔진 자체 추상화가 필요하다.

## 2. 목표 / 비목표

### 목표
1. 엔진 프레임 단계를 선언하고 모든 프레임 작업이 단계에 속하게 한다.
2. raw `useFrame` 사용을 0으로 만든다(엔진 내부 스케줄러 구현부 제외).
3. 같은 종류의 오브젝트는 드라이버 하나가 처리한다.
4. 스케줄러 내부를 R3F v10 스케줄러로 교체할 수 있게 한다.
5. 프레임 단계별 소요 시간을 계측할 수 있다.

### 비목표
- 멀티스레드(Worker) 시뮬레이션. `src/next`의 TaskGraph는 별도.
- 물리 step 자체의 소유권 변경. `@react-three/rapier`의 `Physics`가 step을 소유한다.

## 3. 단계 정의

| 단계 | 순서 | 하는 일 | 예시 |
|---|---|---|---|
| `input` | 100 | 디바이스 상태 수집, 액션 맵 평가 | 키보드, 게임패드, 클릭 경로 |
| `script` | 200 | 사용자 스크립트 `onUpdate` | PRD-12 |
| `prePhysics` | 300 | 물리 입력 적용 | `PhysicsSystem.calculate`, 임펄스 |
| (physics step) | - | `@react-three/rapier`가 수행 | - |
| `postPhysics` | 400 | 물리 결과 읽기, 접지 판정, 상태 갱신 | MotionSystem 갱신, 트리거 이벤트 분배 |
| `animation` | 500 | 애니메이션 상태 결정, mixer 갱신 | PRD-16 |
| `lateUpdate` | 600 | 스크립트 `onLateUpdate` | - |
| `camera` | 700 | 카메라 목표 계산과 적용 | `CameraSystem.calculate` |
| `effects` | 800 | 이펙트 드라이버 | grass, fire, water, weather |
| `snapshot` | 900 | 브리지 스냅샷 발행, React 구독 알림 | `notifyListeners` |
| (render) | - | R3F 렌더 | - |

물리 step과의 순서는 `@react-three/rapier`의 `useBeforePhysicsStep`/`useAfterPhysicsStep`에 `prePhysics`/`postPhysics`를 연결해 보장한다. 이 두 훅의 지원 범위는 peer 범위(`^1.4 || ^2`) 양쪽에서 확인이 필요하다(열린 질문 1).

## 4. 요구사항

### 기능 (FR)
| ID | 요구사항 |
|---|---|
| FR-1 | `useEngineFrame(phase, callback, options)` 훅: 단계, 단계 내 순서, 활성 조건, throttle, 숨김 시 건너뛰기 |
| FR-2 | Canvas 밖에서 쓸 수 있는 명령형 API `frameScheduler.add(phase, fn)` → 해제 함수 반환 |
| FR-3 | 드라이버 등록 헬퍼: 같은 종류 인스턴스를 등록하면 하나의 콜백에서 순회 |
| FR-4 | 단계별 소요 시간 누적 계측 (`perf` 도메인으로 발행, 개발 모드에서만) |
| FR-5 | 고정 시간 간격(fixed step) 콜백 지원: 스크립트 `onFixedUpdate`용, 물리 step과 동기화 |

### 비기능 (NFR)
| ID | 요구사항 |
|---|---|
| NFR-1 | 스케줄러 자체의 프레임당 할당 0 (콜백 목록은 등록 시에만 변경) |
| NFR-2 | 등록 1,000개일 때 스케줄러 오버헤드 0.2ms 이하 (jest 벤치) |
| NFR-3 | 콜백 예외는 해당 콜백만 비활성화하고 `logger.error`로 1회 보고 |

## 5. 설계

### 5.1 구조

```
src/core/runtime/frame/          (신규, Layer 1: React 금지)
  phases.ts        단계 상수와 순서
  scheduler.ts     FrameScheduler 클래스: 단계별 정렬된 배열, add/remove, tick(delta)
  drivers.ts       createFrameDriver<T>(phase, update: (item: T, dt) => void)
  metrics.ts       단계별 누적 시간
src/core/runtime/frame/react/    (Layer 3)
  FrameSchedulerHost.tsx   Canvas 안에서 useFrame 하나로 scheduler.tick 호출
  useEngineFrame.ts
  useFrameDriverItem.ts
```

- R3F에 거는 `useFrame`은 `FrameSchedulerHost` 하나뿐이다. R3F v10 도입 시 이 파일만 새 스케줄러 API로 바꾼다.
- 물리 앞뒤 단계는 `FrameSchedulerHost` 안에서 rapier 훅으로 호출한다.
- 제거 요청은 tick 도중이면 지연 처리해 배열 순회를 깨지 않는다.

### 5.2 기존 `useBaseFrame`의 처리

- `useBaseFrame`은 `snapshot` 단계의 얇은 래퍼로 다시 구현한다: `useEngineFrame('snapshot', () => bridge.notifyListeners(id))`.
- `useConditionalFrame`, `useThrottledFrame`은 `useEngineFrame` 옵션으로 흡수하고 deprecated 처리한다.
- `useManagedEntity` 처리는 PRD-13을 따른다.

### 5.3 이펙트 드라이버 전환

| 대상 | 현재 | 전환 |
|---|---|---|
| grass | `GrassDriver` 1개 | `createFrameDriver`로 재구현 (기준 모델) |
| billboard | `billboard/index.tsx:128,217,368` | `billboardDriver` |
| fire | `fire:174,727` | `fireDriver` (uniform 시간만 갱신이면 드라이버에서 공유 uniform 1개) |
| flag | `flag:72,109,309` | `flagDriver` |
| sakura | `sakura:600,750` | `sakuraDriver` |
| water | `water:354` | `waterDriver` |

시간 uniform만 갱신하는 셰이더는 인스턴스별 uniform 대신 공유 uniform 하나를 쓴다. 드라이버 하나가 프레임당 한 번 갱신한다.

## 6. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 11-a | `runtime/frame` 코어와 테스트 (순서, 제거, 예외 격리, 할당 0) | 단위 테스트, NFR-1~3 |
| 11-b | `FrameSchedulerHost`, `useEngineFrame`, 물리 앞뒤 연결 | R3F 통합 테스트, 예제 World에 호스트 배치 |
| 11-c | motions: `usePhysicsBridge`를 `prePhysics`로, MotionSystem 갱신을 `postPhysics`로 (PRD-14의 B-02 수정과 함께) | 기존 motions 테스트, jump 동작 |
| 11-d | camera: `useCamera`, `useCameraBridge`를 `camera` 단계로 | 카메라 지연 측정 전후 비교 |
| 11-e | 이펙트 드라이버 전환 6종 | 인스턴스 100개일 때 등록 콜백 수 1 |
| 11-f | networks, npc, weather, audio, farming의 나머지 raw `useFrame` 전환 | raw `useFrame` grep 결과 0 (호스트 제외) |
| 11-g | 린트 규칙: `@react-three/fiber`의 `useFrame` import를 `runtime/frame/react` 밖에서 금지 | eslint `no-restricted-imports` |
| 11-h | 단계별 계측을 perf 패널에 표시 | 에디터 perf 패널에서 단계별 ms 확인 |

## 7. 공개 API 영향

- 추가: `useEngineFrame`, `FrameSchedulerHost`, `FRAME_PHASES`, `createFrameDriver`, `frameScheduler`.
- deprecated: `useConditionalFrame`, `useThrottledFrame`. `useBaseFrame`은 시그니처를 유지한다.
- 사용자 앱은 `<Canvas>` 안에 `FrameSchedulerHost`를 둬야 한다. 기존 `GaesupWorld` 계열 루트 컴포넌트가 있으면 그 안에 자동 포함한다.

## 8. 검증과 완료 기준

- raw `useFrame` 0 (호스트 제외), 린트 규칙 활성
- 프레임당 할당: 정지 캐릭터 기본 월드에서 기준선(PRD-00) 대비 감소량 기록
- 카메라와 캐릭터 메시의 위치 차이(보간 적용 후)를 브라우저 테스트로 측정해 기록
- memory 테스트, motions/camera/building 테스트 통과
- `frame-perf-auditor` 감사

## 9. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 순서 변경으로 체감 동작 변화 | 11-c, 11-d를 따로 병합하고 데모 주행 비교 |
| rapier 훅 버전 차이 | peer 양쪽 버전으로 테스트, 안 되면 `useFrame` 우선순위로 폴백 |
| R3F v10 API가 alpha에서 바뀜 | 호스트 1개 파일로 격리 |

## 10. 열린 질문

1. `@react-three/rapier` 1.x를 peer에서 계속 지원할 것인가. `useBeforePhysicsStep` 사용 가능 여부에 따라 결정.
2. `effects` 단계를 `camera` 뒤에 둘지 앞에 둘지. 빌보드는 카메라 방향이 필요하므로 뒤가 기본.

## 구현 현황 (2026-09-23, 2차)

| Slice | 상태 | 내용 |
|---|---|---|
| 11-a | 완료 | `runtime/frame`: 단계 9개, `FrameScheduler`(순서, 지연 해제, 예외 격리, throttle, enabled, 단계별 계측), `createFrameDriver` |
| 11-b | 완료 | `FrameSchedulerHost`(R3F `useFrame` 하나, 우선순위 -1)를 `GaesupWorldContent`에 자동 배치, `useEngineFrame`, `useFrameDriverItem` |
| 11-c ~ 11-h | 미착수 | 기존 raw `useFrame` 이전은 동작 변화 위험 때문에 테스트 실행 가능할 때 진행 |

물리 step 앞뒤 연결(`useBeforePhysicsStep`)은 rapier 버전별 API를 확인하지 못해 넣지 않았다. 현재 모든 단계는 R3F 우선순위 -1 한 번에 실행된다.

검증: 타입체크(src, examples)와 변경 파일 린트 통과. 새 테스트는 메모리 제약으로 실행하지 않았다.

## 구현 현황 (2026-09-23, 3차)

### 물리 전후 분할 (열린 질문 1 해소)

rapier `Physics`는 기본 우선순위 0에서 `FrameStepper`를 자식보다 먼저 렌더해 step을 돌리고, 같은 우선순위 안의 순서는 구독 순서(Suspense 재개에 따라 바뀜)에 달려 있다. 물리 step 콜백(`useBeforePhysicsStep`/`useAfterPhysicsStep`)은 고정 timestep에서 프레임당 0~N회 불려 프레임 단위 단계에 맞지 않는다. 그래서 순서를 R3F 우선순위 숫자로만 고정했다.

| 우선순위 | 실행 |
|---|---|
| `FRAME_PRE_PHYSICS_PRIORITY` (-100) | `input`, `script`, `prePhysics` |
| `PHYSICS_STEP_PRIORITY` (-50) | 앱이 `<Physics updatePriority={PHYSICS_STEP_PRIORITY}>`로 지정하는 rapier step과 보간 |
| `FRAME_SCHEDULER_PRIORITY` (-1) | `postPhysics`, `animation`, `lateUpdate`, `camera`, `effects`, `snapshot` |
| 0 이상 | drei mixer 등 기존 콜백, 렌더 |

앱이 rapier 우선순위를 지정하지 않으면 물리 후 단계가 step 전에 돈다. 이때 읽는 물체 상태는 직전 step 결과로, 기존 동작(우선순위 0 자식 콜백)과 같다. `examples`의 `World`, `BlueprintPlayground`와 라이브러리 `BlueprintPreview`는 지정했다.

### 캔버스별 스케줄러

전역 스케줄러 하나를 여러 캔버스 호스트가 틱하면(월드 + 에디터 NPC 미리보기) 모든 콜백이 프레임당 두 번 돈다. `useCanvasFrameScheduler`가 R3F store(`context`)마다 전용 스케줄러를 만들고 `useEngineFrame`, `useSharedFrame`, `FrameSchedulerHost`가 같은 방식으로 찾는다. 캔버스 밖(테스트, 명령형 `frameScheduler.add`)은 전역 스케줄러이며, 먼저 붙은 primary 호스트 하나만 틱한다. 호스트 없이 캔버스 안에서 등록하면 개발 모드에서 1초 후 한 번 경고한다. 엔진 콜백의 `elapsedMs`는 R3F 시계(`getFrameTimeMs(state)`)라 기존 `getFrameElapsedSeconds(state)`와 기준점이 같다.

### 공유 프레임 채널 (11-e)

`useSharedFrame(channel, (delta, elapsedSeconds, three) => ...)`: 캔버스·채널마다 스케줄러 항목 1개를 만들고 인스턴스 콜백을 그 안에서 순회한다. 인스턴스 예외는 그 인스턴스만 제외한다. 컴포넌트 클로저를 유지하므로 동작이 같다.

| Slice | 상태 | 내용 |
|---|---|---|
| 11-c | 완료 | `usePhysicsBridge` → `postPhysics`(R3F 상태는 `useThree(s => s.get)`), `useCharacterAnimator` → `animation`(`active: enabled`) |
| 11-d | 완료 | `useCamera`, `useCameraBridge` → `camera` |
| 11-e | 완료 | grass(`effects`), billboard 단일·배치(단일 2종의 중복 로직을 `useBillboardGlow`로 통합, 배치 20Hz는 채널 `throttleMs`), fire 단일·배치, flag 단일 2종·배치(30Hz), sakura 2종, snow CPU·GPU·노드, water, 노드 water 머티리얼. 채널 13개 |
| 11-f | 완료 | 나머지 34개 파일 35곳을 단계로 이전. 물체를 움직이는 NPC 이동·blueprint 엔티티·원격 플레이어 kinematic은 `prePhysics`, 플레이어 위치를 읽는 상호작용 추적·집 문·방 가시성·`usePlayerPosition`은 `postPhysics`(`AFTER_MOTION_FRAME_ORDER`=10, 물리 브리지 뒤), 로컬 위치 송신은 `postPhysics`, 시각 전용(나무·작물 흔들림, 발자국, 텔레포트, 하늘, 클릭 파동)은 `lateUpdate`, 카메라 의존(빌보드 외 컬링, 말풍선, 날씨, 건물 가시성·GPU 컬링, 타일 거리 숨김, NPC LOD)은 `effects`, 브리지 알림·네트워크 갱신·성능 샘플은 `snapshot`. `useBaseFrame`은 시그니처를 유지한 `snapshot` 래퍼(priority → order), `useConditionalFrame`/`useThrottledFrame`은 `@deprecated`. 콜백 예외는 R3F 루프로 던지지 않고 해당 항목만 비활성화(NFR-3) |
| 11-g | 완료 | `eslint.config.js`: `src/**`에서 `@react-three/fiber`의 `useFrame` import 금지(`runtime/frame/react` 제외) |
| 11-h | 완료 | `GaesupWorldContent`의 호스트가 개발 모드에서 캔버스 스케줄러 계측을 켠다. `PerformanceCollector`가 30프레임마다 단계별 평균 ms를 `framePhases`(gaesup store)에 기록하고 계측을 초기화한다. 에디터 `PerformancePanel`의 `FramePhaseSection`이 단계별 ms와 합계를 표시한다(200줄 초과 패널에 코드를 더하지 않고 분리) |

raw `useFrame`(프레임 호스트 제외): 55 → 0 (`pnpm check:quality` 기준선 갱신). `MultiplayerCanvas`의 `Physics`에도 `PHYSICS_STEP_PRIORITY`를 지정했다.

### frame-perf 감사 반영 (3차)

| 지적 | 조치 |
|---|---|
| 호스트가 `GaesupWorldContent`의 `Suspense` 안에 있어 재중단 시 layout effect(R3F 구독)가 해제되며 캔버스·전역 단계 전체가 멈춤 | 호스트를 `Suspense` 밖으로 옮김. 호스트 부착도 layout effect로 바꿔 `hasHost()`가 R3F 구독 수명과 일치 |
| 같은 스케줄러에 호스트 둘이면 이중 틱 | 스케줄러가 호스트 토큰 목록을 갖고 첫 토큰만 틱(`isTickOwner`). 모든 호스트가 전역 스케줄러에도 토큰을 붙여 전역 소유자도 하나. 두 번째 호스트는 개발 모드에서 1회 경고 |
| 전역 스케줄러의 물리 후 범위 전체가 캔버스 `postPhysics`보다 먼저 실행 | `tickPhase(index)`로 단계마다 전역 → 캔버스 순으로 번갈아 실행 |
| primary 호스트가 바뀌면 전역 시계가 뒤로 가 throttle 항목이 멈춤 | `elapsedMs`가 마지막 실행보다 작으면 throttle을 건너뛰고 기준을 재설정 |
| `useSharedFrame` 그룹이 비어도 남고, 채널 객체를 키로 써 인라인 리터럴이면 렌더마다 그룹·재등록 증가 | `phase|label|order|throttleMs` 문자열 키, 빈 그룹 삭제, 채널 객체가 바뀌어도 키가 같으면 재등록하지 않음 |
| `useSharedFrame`에 호스트 누락 경고 없음 | `useEngineFrame`과 같은 경고(`hostWarnings.ts`) 공유 |
| `clear()` 뒤 드라이버·공유 그룹이 죽은 해제 핸들을 보유해 재등록 불가 | 스케줄러 세대(`getGeneration`)를 비교해 재등록 |
| `useEngineFrame` 항목당 호출 3회(enabled 래퍼, 콜백 래퍼, 사용자 콜백) | enabled 검사를 콜백 래퍼에 합쳐 2회. 타일마다 등록되던 `TileObject` 거리 LOD는 공유 채널로 이전 |
| 등록이 passive effect라 첫 프레임을 놓칠 수 있음 | `useEngineFrame`, `useSharedFrame` 모두 layout effect로 등록(서버 환경은 `useEffect`) |
| `NPCPanel` 미리보기 `Physics`에 step 우선순위 누락 | `PHYSICS_STEP_PRIORITY` 지정 |
| 프레임당 할당: `usePlayerPosition`의 클로저, NPC 이동 `{x,y,z}` 리터럴 | 모듈 함수 `consumePositionChange`로 이동, NPC는 ref 객체 재사용 |
| `BuildingGpuCullingDriver` 디스패치의 배열·Promise 할당 | 전환 이전부터 있던 것으로 이번 범위 밖. PRD-19 GPU 컬링 작업에서 처리 |

물리 브리지 단계 표기: 3절 표는 `PhysicsSystem.calculate`를 `prePhysics`로 적었지만 구현은 `postPhysics`다. 이전에도 rapier `FrameStepper`가 자식보다 먼저 구독해 step 뒤에 계산했으므로 동작은 같다(임펄스는 다음 step에 적분). 입력 지연 1프레임을 줄이려면 입력→임펄스를 `prePhysics`, 상태 읽기를 `postPhysics`로 나눠야 하며 이는 PRD-14 14-e(`CharacterStateResolver`)에서 다룬다.

테스트: 호스트 통합(물리 전후 순서, 캔버스 분리, primary 1회 틱), 공유 채널(인스턴스 100개 → 스케줄러 항목 1개, 예외 격리).
