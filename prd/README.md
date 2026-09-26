# gaesup-world PRD

작성일: 2026-09-26 · 기준: `main` 6f75baa5

## 1. 방향

- 제품 본체는 minihome이다. 예제는 minihome 하나만 둔다.
- 지금 트랙은 NPC(3절)다. 목표는 minihome에 마을 주민(MH-08)을 실제로 넣는 것이고, 라이브러리 NPC 코어는 그 과정에서 고친다. 3절을 끝내면 전체 점검을 다시 한다.
- 항목 하나를 끝낼 때마다 커밋 하나와 채팅 보고 하나를 남긴다.
- 예제 화면에서 달라지는 것부터 한다.
- 끝난 slice는 이 문서에서 지운다. 기록은 git log(커밋 제목 끝의 ID)에 있다.

## 2. 규칙

| 규칙 | 내용 |
|---|---|
| 완료 판정 | slice마다 결정적 완료 기준(테스트, 카운터, 수용 시나리오)을 둔다. 기준이 없으면 착수하지 않는다 |
| 수용 시나리오 | 정의·예산·상태는 `test/accept/budgets.json` 하나에 둔다. 이 문서에 복제하지 않는다. 시나리오는 headless(jest `accept` 프로젝트)만 있다 |
| 확인 후 변경 | 공개 API 삭제와 peer 의존성 변경은 먼저 묻는다. 파일 삭제, 틀린 동작을 고정한 테스트의 기대값 수정, 일반 의존성 제거는 보고에 적고 진행한다 |
| 위치 표기 | 경로는 `src/core/` 기준이다. 줄 번호 대신 파일과 심볼 이름을 쓴다 |

## 3. NPC

근거는 2026-09-26 코드 점검이다. 표 순서가 착수 순서다.

공통 원인은 두 가지다.
- 관측, 결정, 말하기 같은 일시 상태를 저장 대상인 `instances`에 쓴다.
- 렌더 경로가 두 벌 있다.

| ID | 내용 | 근거 | 완료 기준 |
|---|---|---|---|
| N-4 | 아무것도 안 하는 NPC가 결정 tick마다 store와 세이브를 바꿈 | 결정할 행동이 없어도 `NPCSimulation.update`가 모든 NPC를 `applyNPCDecisions`로 넘긴다. 이 함수가 `lastObservation`을 쓰면서 immer가 `instances` Map을 통째로 복사하고, 그 결과 `npc/plugin.ts`의 save revision이 바뀌어 autosave가 카탈로그까지 직렬화한다. `snapshotInstances`도 결정 tick마다 전체를 복사한다 | 관측·결정 기록은 `NPCSimulation` 안에 두고 store와 세이브에서 뺀다. 테스트: idle NPC 30명을 60초 돌리는 동안 npcStore 알림 0, save revision 불변 |
| N-5 | 경로를 찾을 때마다 격자 전체를 새로 만듦 | `navigation/NavigationSystem.ts`의 `findPath`는 호출마다 `createTraversalGrid`로 격자 전체를 다시 만들고, 칸마다 좌표 배열을 할당한다. 쿼리당 반지름 없이 0.14ms, 반지름 0.24면 1.51ms다 | 격자를 footprint별로 캐시하고 격자가 바뀌면 무효화한다. 막힌 칸이 없으면 건너뛴다. 테스트: 같은 footprint로 100회 쿼리해도 격자 생성은 1회이고, 칸을 바꾸면 1회 더 생성한다 |
| N-3 | 말하기가 화면에 나오지 않고 저장 데이터만 키움 | `npc/stores/npcActions.ts`의 `applyNPCAction`에서 `speak`는 `instance.events`에 핸들러를 붙이기만 하고 지우지 않는다. 이 이벤트를 실행하는 곳도 말풍선도 없다. `events`는 세이브에 들어가고, 바뀔 때마다 NPC가 다시 렌더링된다 | 말하기는 `NPCSimulation`의 일시 상태(`getSpeech`)로 옮긴다. 테스트: 결정 100회 뒤 `events` 길이가 그대로이고, 저장본에 말하기가 없으며, `duration`이 지나면 말하기가 사라진다 |
| N-8 | 행동 버그와 플레이어 지각 | ① `lookAt`이 시뮬레이션 pose가 아니라 store의 `position`으로 방향을 잡는다. ② `playAnimation`이 공유 카탈로그 `animations` 항목을 바꾼다. ③ `NPCPerceptionIndex`는 NPC만 보고 플레이어는 보지 않는다. ④ 기본 배회 블루프린트는 퀘스트 `welcome`이 active일 때만 움직인다. ⑤ `NPCSimulation.move`는 waypoint마다 store를 두 번 바꾼다. 블루프린트에는 "대상이 새로 보임" 조건과 "대상 바라보기" 행동이 없다 | 항목별 단위 테스트. 플레이어 같은 외부 대상을 넘기는 API(`setActors`)가 있고, 대상이 시야에 새로 들어온 결정에서만 참인 조건이 있다 |
| M-1 | minihome 마을 주민 (MH-08) | minihome에는 NPC가 없다. 기능표 `examples/minihome/features.ts`의 MH-08이 `pending`이다 | 두 주민(trainer)이 걷기·대기 애니메이션으로 집 주변을 배회하고, 가구와 물을 피한다. 플레이어가 다가오면 돌아보고 말풍선으로 인사하고, 클릭하면 대사를 말한다. 주민이 모두 멈춰 있으면 다음 결정까지 프레임을 그리지 않는다. 테스트: 주민 모듈 headless 테스트와 `engine.diagnostics().villagers` 값, `pnpm test:minihome:features` 통과 |
| N-9 | 일과표가 NPC를 움직이지 않음 | `npc/core/NPCScheduler.ts`는 시간대별 위치·활동을 계산해 runtime마다 만들어지지만, `NPCSimulation`이 읽지 않는다 | 활성 슬롯이 바뀌면 NPC가 슬롯 위치로 이동한다. 헤드리스 테스트: 시계를 슬롯 시각으로 옮기면 NPC가 도착한다. minihome 밤 조명에서는 주민이 집으로 돌아간다 |
| N-6 | 화면 밖 NPC가 메인·그림자 pass에 그려짐 (R3F 경로) | `motions/entities/refs/PhysicsEntity.tsx`, `motions/entities/refs/PartsGroupRef.tsx`, `src/avatar/runtime/assembler.ts`가 SkinnedMesh의 `frustumCulled`를 끈다 | 넉넉한 boundingSphere를 한 번 정하고 culling을 켠다. 테스트: 화면 밖 NPC의 `frustumCulled`가 켜져 있고 bounding sphere가 캡슐을 덮는다 |
| N-7 | R3F NPC 렌더 경로가 두 벌이고 동작이 다름 | `npc/components/NPCInstance`의 두 경로는 다음처럼 다르다. `fullModelUrl`이 있으면 `PhysicsEntity`로 그리고, 충돌이 시작되면 `onClick` 이벤트를 실행한다. 없으면 부위마다 `useGLTF`·`SkeletonUtils.clone`·mixer를 따로 두고, 클릭해야 실행한다. `PhysicsEntity`의 `userData`는 매 렌더 새 객체다 | 경로를 하나로 합친다. mixer는 NPC당 1개로 하고, 클릭과 근접 이벤트의 의미를 같게 한다 |
| N-11 | NPC store 나누기 | `npc/stores/npcStore.ts` 하나에 카탈로그, instances, 에디터 선택 상태가 섞여 있다. 그래서 `createInstanceFromTemplate`이 에디터의 `previewAccessories`를 읽는다. 세이브 revision이 도메인 전체에 하나뿐이다 | 테스트: instance 1개를 바꾼 뒤 autosave할 때 카탈로그 직렬화 0 |
| N-10 | 에디터 NPC 패널 정리 | `editor/components/panels/BuildingPanel/brain/*`(2,258줄)에 노드 갱신 람다가 36개 반복된다. `useNPCBrainEditor`(447줄)는 그래프 로직을 hook 안에 품고, 패널을 열기만 해도 store에 쓴다. `NPCMotionCanvas`는 캔버스와 Rapier 월드를 따로 만든다. `@xyflow/react`를 정적으로 import한다 | 그래프 로직을 `npc/core`의 순수 함수로 옮기고 단위 테스트를 둔다. 패널을 열어도 store 변경 0 |
| N-12 | NPC 네트워크 계층 삭제 | `networks/core/NetworkSystem.ts`, `ConnectionPool.ts`, `NPCNetworkManager.ts`, `networks/stores/networkStateStore.ts`와 관련 hook·패널이 대상이다. 연결은 늘 0이고 통계는 틀리며, 쓰는 곳은 perf 시나리오 하나다 | 공개 API 삭제라 먼저 묻는다. 삭제한 뒤 export snapshot을 갱신하고 멀티플레이 테스트를 통과한다 |

## 4. 성능 (보류)

측정은 `/world` 예제로 했는데, 그 예제는 지웠다. minihome에서 측정 경로를 다시 정하기 전까지 착수하지 않는다.

| ID | 내용 | 근거 |
|---|---|---|
| P-5 | `frameloop="demand"`, 보조 캔버스 demand | 대기 5초 동안 render가 1,310번이다(commit 0, 요청 0). 물·잔디·깃발·사쿠라 흔들림·플레이어 idle이 매 프레임 바뀐다 |
| P-8e | 후처리(MRT) 월드의 새 콘텐츠를 첫 draw 전에 컴파일 | r186 `compileAsync`가 셰이더를 나중 task에서 빌드하면서 MRT pass용 빌드가 출력이 빠진 캔버스를 기준으로 만들어져, pipeline 생성이 실패한다. 지금은 MRT pass면 사전 컴파일을 건너뛴다 |
