# Runtime·렌더링 개선 PRD

- 작성일: 2026-09-19
- 상태: S0 계측·examples와 S1 정확성 수정 후 S2 월드별 상태·입력·내비 소유권 및 고정 tick 진행 중. 최종 통합 승인은 미완료.
- 대상: `src` 감사의 31개 개선 항목, Web3D 기술 검토, `examples`의 재현·계측 화면
- 기준 HEAD: `bfdf9a9bf93786a2599beb25d2c8b7e93177b9a5`
- 주의할 기준 상태: 작성 시 작업 트리가 수정된 상태다. 이 HEAD만으로 현재 코드를 재현할 수 없다. S0에서 수정 파일과 untracked 파일을 포함한 소스 식별값을 생성한다.

### 현재 진행 — 2026-09-22

구현 상태와 비교 run ID는 [requirements.ts](../examples/performance/requirements.ts), 원시 표본·환경·소스 manifest는 [baselines](../examples/performance/baselines/)에서 관리한다. 과거 실행을 덮어쓰지 않는다. `/performance`에서 재현 실행, 전후 비교, JSON 내보내기/불러오기, IndexedDB 복원, 동일 조건 반복 측정의 중앙값·범위를 확인한다.

| 단계 | 현재 상태 | 남은 완료 조건 |
| --- | --- | --- |
| S0 계측·lab | 실제 시나리오 72개, 저장 실행 203개. WebGPU/WebGL 카운터 정규화·미지원 구분·실제 MessageQueue 고장 주입 검사. NPC 100/1,000개 감지 CPU 정식 A/B 각 5회 추가 | 후속 시나리오·장치·부하 확대, 동일 조건의 정식 A/B 측정 |
| S1 정확성 | R01 selector, R02 준비된 snapshot·rollback, R06 GPU 재질, R07 오디오 종료, R08 엔티티 세대, R10 GLTF 교체/크기, R11 재질 ID, R24b 플러그인 해제 수정. 실제 IndexedDB 복원 중 도감 초과 수집도 수정 | 각 항목의 일반 월드 통합·수명 반복·지원 조합. 다른 observer의 복원 부작용·복원 중 명령 재진입. R24a 저장 지연은 S5 |
| S2 월드 소유권 R25 | 시간·저장 namespace·GaesupStore·플레이어·입력·자동화·내비·브리지, 건물/NPC·렌더/컬링/GPU 버퍼·장애물 등록 분리. 생활 도메인·캐릭터·장면·방·오디오·도구 버스·게임플레이 engine/registry 분리. DOM/커스텀 입력·상호작용 대상·입력 action·grass·WorldBridge·객체 store·블루프린트·카메라·NPC 정책·시네마틱/미리 보기의 종료/재시작 연결. 브라우저 게임패드 공유 폴링·아날로그 물리/시점 입력, 관찰자 구독 공유·복원 구분·지연 읽기 세대·부분 적용 취소/rollback 구현. 자동 저장/초기 로드의 월드 선택·슬롯별 공유·중복 쓰기 병합 구현 | 비동기 명령의 취소·저장 경계 검증 완료. 임의 외부 효과와 실제 USB/Bluetooth 장치 확인. 객체 영속화·core/next 엔티티 계약은 R27, 권위 명령 계약은 R30 |
| S2 clock R26 | 순수 FixedStepClock·공유 RAF·실행 단계/순서·catch-up 예산·일시 정지/재개. NetworkBridge·WorldPhysics·NPC 이동/판단 연결. 30/60/144Hz의 Rapier·NPC 동등성, 화면 밖 진행·이동 중 저장·Node 수동 tick 확인 | 게임패드 폴링·전체 입력 기록/재생, 실제 전체 시뮬레이션 동등성과 부하 성능 |
| S2 공통 계약 | R27 엔티티 계약, R29 headless/초기화 경계, R30 command/tick 계약 미완료 | 아래 후속 순서에 따라 구현·재현 |
| S3–S8 | 계획 유지, 통합 완료 아님 | 물리/카메라/NPC → GPU 통합 → 규모/편집/에셋 → 화질 → 전체 통합 → 네트워크/운영 권한 |
| 미니홈피 제품 경로 | 3D·조작·인스턴싱·대기 중단·API 검사·반복 측정 구현. 아래 M1–M6에 범위와 증거 기록 | 외부 에셋·실제 아바타·모바일 실기기·코어 GPU 통합·멀티플레이 |

UI의 구현 9/31·시나리오 연결 17/31·전후 기능 비교 14/31은 서로 다른 지표다. 전체 조건 검증은 0/31이다. S1의 일부 수정이나 S2의 개별 시나리오 통과를 전체 완료로 계산하지 않는다.

현재 재현 수치는 다음과 같다.

| 시나리오 | 변경 전 → 후 | 검증 범위 |
| --- | --- | --- |
| `world-domains` | 건물·NPC·장애물 오류 각각 1→0, 저장 불일치 2→0 | 실제 Provider·건물 driver·도메인 plugin·IndexedDB |
| `world-render-state` | 소유권·컬링·GPU validation 오류 0 | 네이티브 WebGPU의 서로 다른 버퍼·가시 블록 수 1/2·개별 종료/재시작. 변경 전 baseline 없음 |
| `world-obstacle-registry` | 반영 누락·오래된 cleanup 삭제 오류 0 | 실제 driver의 등록/교체/제거. 변경 전 baseline 없음 |
| `world-gameplay` | 날씨·작물·수확 오염 각각 1→0, 보상·저장 불일치 각각 2→0 | 농사 clock·퀘스트 보상·수확·IndexedDB·다른 월드 보존 |
| `world-life` | 제작·우편·저장 불일치 각각 2→0, 도구 전달 오류 1→0 | 실제 도감/달력/도구 훅·생활 store·게임플레이 engine·IndexedDB·종료/재시작 |
| `catalog-tracking` | 구독 2→1, 수집 초과 3→0, 복원 초과 6→0, 종료 후 구독 2→0 | 실제 훅 두 개·가방 변경·IndexedDB 복원·Provider가 남아 있는 종료/재시작 |
| `world-character-scene` | 캐릭터·장비·방/장면 등록·저장·동시 전환·종료/재시작 불일치 9개 각각 1→0 | 실제 Provider 훅·공개 장비 명령·동시 fade·IndexedDB·개별 종료. 문 진입은 불투명 fade 아래에서만 적용 |
| `world-audio` | BGM 구독 2→1, 설정만으로 생성된 컨텍스트 1→0, 일부 훅 제거 후 재생 오류 2→0, 종료 후 컨텍스트/구독/오래된 명령 재생 각각 1→0 | 실제 AudioContext·BGM 훅·다른 월드의 재생 보존·IndexedDB·종료/재시작 |
| `world-keyboard-focus` | 다른 월드 이동·도구·터치 전달 오류 각각 1→0, 포커스 변경 후 잔여 키 2→0, 종료 후 입력 2→0, 재시작 불일치 1→0 | 브라우저 네이티브 키 입력 6건·공개 입력 surface·실제 훅/도구 controller·텍스트 입력·터치 버튼·종료/재시작 |
| `editor-shortcuts` | 미등록 키 실행 3→0, 명령 불일치 1→0, 이전 cleanup의 새 등록 제거 1→0 | 실제 공개 단축키 registry의 키/코드 매칭·등록 교체 |
| `world-grass` | 다른 월드 갱신 1→0, 날씨·카메라 오류 각각 1→0, 밟힘 오류 2→0, 144개 프레임의 갱신 누락 144→0 | 실제 manager·두 runtime·수동 프레임 진행·중복 호출·종료/재시작. 실제 모니터 144Hz/FPS 측정은 아님 |
| `grass-rendering` | 재질·LOD·밟힘 좌표·기본 driver·종료/재시작 오류 0 | 네이티브 WebGPU 및 WebGL, 두 canvas의 실제 Grass·BuildingSystem. 해당 프로파일에서 총 88개 풀 인스턴스. 변경 전 화면 baseline 없음 |
| `world-objects` | 블루프린트의 다른 월드 노출 2→0, 동일 ID 오염·종료 후 잔여 엔진·종료 후 생성 각각 1→0 | 실제 생성 훅·Provider·WorldBridge·객체 store. 다른 월드 보존·종료/재시작 |
| `world-snapshot` | 명령 직후 오래된 snapshot 2→0 | 동일 밀리초의 생성·선택과 월드/엔진 세대 분리 |
| `world-view-picking` | 카메라/커서 좌표·활성 화면·종료/재시작 오류 0 | 두 실제 canvas의 Three raycast로 A x=12, B x=28 확인. WorldViews의 DOM 포커스 선택. 변경 전 baseline 없음 |
| `npc-adapter-isolation` | adapter 충돌·등록 유실·요청 소유권 오류 각각 1→0, 응답 불일치 2→0 | 실제 brain registry·두 월드, 정책 전송만 로컬 제어 |
| `npc-policy-lifetime` | 교체 후 응답 적용·종료 시 미취소·종료 후 결정 각각 1→0 | 취소를 무시한 지연 응답·재시작 |
| `npc-frame-ownership` | 월드별 응답 적용·종료 후 관측/요청·다른 월드 보존·재시작 오류 0 | 실제 NPCInstance·Rapier·네이티브 WebGPU/WebGL. 변경 전 화면 baseline 없음 |
| `world-custom-input` | 추가 adapter 생성 1→0, 소비자/store/motion 포트 불일치 3→0, store 반영 누락 2→0, store 명령 오류 1→0, 종료 후 입력·재시작 오류 각각 2→0 | 실제 motion plugin과 두 월드의 세 React 입력 소비자 |
| `world-input-source-lifecycle` | factory·소스 구독·키 전달·교체/종료/재시작 불일치 0 | 실행 중 플러그인 설치/해제, 실제 키보드 훅 두 개, 로컬 키 이벤트. 실제 하드웨어 게임패드 검사는 아님 |
| `interaction-target-ownership` | 잘못된 월드 실행 2→0, 중복 입력 실행 1→0, 오래된 대상 정보 2→0, 제거/종료/재시작 오류 각각 1→0 | 실제 두 Provider, 동일 대상 ID, 중복 입력 훅 |
| `tool-action-ownership` | 중복 DOM 실행·커스텀 backend 입력 누락 각각 1→0, 일부 controller 제거·종료/재시작 오류 0 | 실제 ToolUseController 두 개·inventory·tool bus·WebGPU/WebGL Canvas |
| `interaction-world-tracking` | tracker 두 개의 탐색 1회/프레임, 좌표·거리·제거 오류 0 | 실제 Interactable·부모 이동/확대·두 월드. 변경 전 화면 baseline 없음 |
| `cinematic-lifetime` | 취소 지연·이전 재생 간섭·shake/fade 복원·오류 후 카메라 누수 각각 1→0 | 실제 공개 재생 API·타이머·camera/scene store. 렌더링 품질 검사는 아님 |
| `world-cinematic-lifecycle` | 종료 후 카메라/후속 효과 각각 1→0, 종료 후와 비활성 명령 후 누적 효과 2→0 | 두 월드의 독립 실행·개별 종료·재시작 |
| `cinematic-editor-ownership` | 잘못된 store 변경 2→0, unmount 후 이벤트 1→0 | 두 Provider의 실제 CinematicPanel 미리 보기 |
| `hardware-gamepad-routing` | 연결·이동·동작 누락 각각 1→0, 두 월드 공유 폴링 1회/프레임, 변경 없는 알림·종료 후 폴링 0회 | 제어한 getGamepads 스냅샷·실제 Provider/입력/상호작용 훅·포커스 전환·키보드 혼합·연결 해제. 실제 USB/Bluetooth 장치 미검증 |
| `gamepad-motion-scene` | 물리 이동 누락 2→0, 시점 이동 누락 1→0, 절반/최대 입력 속도 0/0→약 5/10 world/s | 제어한 API 입력·실제 PhysicsBridge/Rapier/useCamera·네이티브 렌더러. 입력 크기 반영 검증이며 FPS 개선 지표가 아님 |
| `world-restore-observers` | 시간 구독 5→3, 가방 구독 2→1, 달력/퀘스트 갱신 각각 2→1, 복원 중 갱신·종료 후 구독 각각 6→0 | 두 실제 Provider·중복 날씨/달력/퀘스트 훅·농사 clock·IndexedDB·종료/재시작 |
| `world-restore-races` | 이전 월드의 지연 복원 1→0, 교체한 도메인 적용 오류 2→0, 적용 중 취소 오류 3→0, 저장을 추월한 읽기 1→0 | 실제 runtime/SaveSystem·제어된 adapter 지연·AbortSignal·부분 적용 rollback. 네트워크 전송 검사는 아님 |
| `world-paused-time-restore` | 일시 정지 유실·정지 중 시간 진행·rollback 후 정지 유실 각각 1→0 | 실제 IndexedDB·realtime 시간 store·부분 적용 실패 |
| `world-save-hooks` | 잘못된 전역 저장 3→0, unload 구독 3→2, 월드 종료 후 구독 3→1, 재시작 오류 3→0 | 두 실제 Provider·SaveSystem·중복 훅·월드 종료/재시작. 남은 구독 1개는 활성 월드 소유 |
| `save-hook-sharing` | 초기 읽기 2→1, 로드 중/실패 후 쓰기 각각 2→0, 연속 요청의 쓰기·직렬화 각각 12→2, 늦은 소비자의 추가 읽기 2→0 | 실제 훅·SaveSystem, 제어된 adapter의 느린 읽기/쓰기·실패. GPU/FPS 또는 실제 디스크 지연 개선 수치는 아님 |

위 값은 작업 횟수·기능 오류·월드 이동 속도다. FPS 또는 프레임 시간 개선률은 아직 증명하지 않았다. 건물 GPU driver 검증도 완성된 일반 월드 두 개의 화면 품질 검증을 대신하지 않는다. 일반 월드·engine·editor 최종 통합은 S7 조건으로 남는다.

월드 API와 적용 범위:

- React 명령·구독은 해당 `use…StoreApi()`, React 밖에서는 `runtime.…Store`를 사용한다. 기본 도메인 plugin도 해당 store로 저장·복원한다. 농사·상점·퀘스트·대화·제작·우편 factory에는 의존 store를 주입한다. 기존 훅의 정적 API와 standalone plugin registry는 전역 호환 경로다.
- `runtime.navigationObstacles`·`npcScheduler`는 같은 ID를 다른 월드에서 독립적으로 사용한다. NPC blueprint와 quest/친밀도 조건은 소유 store를 읽는다. 프리셋 적용은 월드별이며 사용자 공통 localStorage 목록은 유지한다.
- `runtime.toolEvents`·`useToolEvents()`·`useToolUse()`는 개별 종료·재시작·중복 등록의 마지막 소유자·오래된 cleanup을 처리한다. 실제 키보드·터치 도구 입력의 월드별 전달을 examples에서 확인했다. 여러 controller의 명령 중복 소비 계약은 별도 후속 작업이다.
- `runtime.inputScope`·`WorldInputSurface`·`useWorldInputScope()`로 DOM 입력을 소유 월드에 전달한다. 카메라 canvas와 기본 UI는 자동 등록되며 커스텀 UI는 surface로 범위를 지정한다. 편집기의 명시적 DOM target도 지원한다. 입력란·포커스 이동·페이지 숨김·월드 종료 시 누른 키를 해제하고 물리 키와 가상 키의 소유권을 분리한다. 같은 window의 native key listener는 소비자 수와 관계없이 4개이며 모든 scope가 정지하면 해제되는 것을 단위 검사했다. 한 canvas를 공유하는 여러 월드는 명시적 활성화가 필요하며 viewport picking은 R13에 남는다.
- `runtime.gameplayEventRegistry`·`gameplayEvents`는 editor 기본 실행에도 연결된다. 조건·보상은 소유 store, emit은 소유 plugin event bus를 사용한다. 종료된 비동기 세대의 후속 action을 취소하고 once/cooldown 중첩을 막는다. custom handler에는 취소 신호를 제공한다. 이미 실행된 사용자 handler의 부작용을 되돌리는 기능은 아니다.
- 도감 훅은 같은 가방·도감·시간의 구독을 공유하고 슬롯 변화량을 한 map으로 집계한다. inventory의 저장되지 않는 `hydrationRevision`으로 복원과 새 수집을 구분한다. 실패 rollback에서도 복원 물건을 새 수집으로 세지 않는 단위 검사를 포함한다.
- 캐릭터·장면·방은 runtime store와 hook API를 제공한다. 공개 장비 명령과 cinematic의 character/scene 포트도 소유 store를 받는다. 장면 전환은 취소 신호·종료·복원 시 타이머를 해제하고 이전 작업이 새 전환을 변경하지 않게 한다. `onEntered`는 불투명 fade 아래에서 실행한다. 시네마틱 자체의 월드 수명은 아래 단계에서 연결했으며, 실행 중 저장 복원과의 경합은 추가 검증한다.
- `runtime.audioEngine`·`audioStore`는 설정/복원만으로 AudioContext를 만들지 않는다. 종료 시 실제 source·요청·컨텍스트를 해제하고 오래된 명령을 막는다. BGM 훅은 같은 월드의 구독을 공유하며 마지막 소유자만 해제한다. 수동 재생으로 대체된 같은 ID의 음악도 이전 훅 cleanup이 정지시키지 않는다.
- `runtime.grassManager`·`useGrassManager()`는 소유 월드의 날씨·캐릭터 위치를 읽는다. BuildingSystem에 빠져 있던 GrassDriver를 연결했고, standalone Grass는 함께 GrassDriver를 배치한다. 동일 elapsedTime의 중복 갱신만 제거하여 12ms wall-clock 제한으로 실제 프레임이 빠지지 않게 했다. 타일 목록과 WASM LOD 버퍼를 재사용하며, allocator 단위 검사에서는 144개 프레임 동안 할당 호출 2회를 확인했다. 마지막 타일 제거·월드 정지 시 임시 버퍼를 해제하고 재시작 때 다시 확보한다.
- grass 밟힘의 월드 좌표를 실제 mesh의 로컬 좌표로 변환하고 최초 캐릭터 위치를 바로 적용한다. 첫 WebGPU draw 전에 유한한 instanceCount를 지정해 lab 연속 실행에서 발견된 `drawIndexed(Infinity)` 오류를 수정했다. 한 월드의 다중 카메라·이동/비균일 배율에 따른 전체 bounds 계약은 R13/R17에 남는다.
- `runtime.worldObjectStore`·`worldBridge`와 `useWorldObjectStore()`·`useWorldObjectStoreApi()`를 연결했다. 종료 시 엔진·공간 인덱스·구독을 해제하고 객체 데이터는 store에 보존하여 재시작 때 재구성한다. 메모리 내 재시작 보존이며 이 객체 store의 SaveSystem 영속 도메인·core/next 엔티티 변환은 R27에서 연결한다. 기존 `createWorldSlice`의 전역 default 호환 경로는 기존 엔진이나 다른 slice 구독을 교체하지 않으며, `deactivateWorldBridge()`로 자기 구독만 해제한다.
- WorldBridge snapshot은 16ms TTL 대신 시스템/명령 revision으로 갱신한다. 변경이 없으면 snapshot을 재사용하고 선택/UI만 바뀌면 객체 배열도 재사용한다. 이벤트 만료와 직접 WorldSystem API 변경도 반영한다. 객체 update는 새 객체 참조를 전달하고 ID 변경을 거부하며, store의 명령 후 중복 알림을 제거했다.
- `runtime.worldViews`는 소유 canvas의 카메라·scene·정규화 커서를 등록하고 DOM 포커스로 명령 대상 화면을 선택한다. 기본 `useCamera`가 등록/해제를 담당한다. `useSpawnFromBlueprint(view?)`는 명시적 view도 받으며, runtime 안에서는 다른 월드의 window 전역 카메라를 읽지 않는다. 두 canvas의 선택·생성 좌표 검증이며 GPU 다중 카메라별 컬링/배칭/후처리 수명 전체는 R13/R17에 남는다.

NPC adapter 개선:

- `runtime.npcBrainAdapters`·`npcReinforcement`가 adapter 등록, endpoint·인증 설정, 요청 간격, 대기 응답을 소유한다. `resolveNPCBrainDecision(..., runtime)`과 실제 NPCInstance가 소유 registry를 사용한다. 동일 함수 재등록에서도 과거 cleanup이 새 등록을 삭제하지 않는다. 전역 함수는 기존 호환 경로이며 import 시 기본 adapter 등록 제거는 R29에 남는다.
- 종료·설정 변경·NPC 삭제/교체·brain 변경·저장 복원·외부 bulk setState는 해당 요청을 취소한다. 취소를 무시한 전송과 JSON 해석 중 도착한 응답도 세대/소유권 검사로 폐기한다. 내부 위치/행동 갱신은 기다리는 정책 요청을 무효화하지 않으며, 전체 NPC 목록을 매 프레임 순회하는 수명 observer를 추가하지 않았다.
- 요청 간격과 응답 수명은 단조 wall clock을 사용한다. `ttlMs`는 요청 시점부터 계산하고, 생략하면 timeout까지 유효하다. 큐에서 기다리다 만료된 응답도 적용하지 않는다. 9개 NPC action 유형의 필수 값·유한 좌표·음수 속도·타입을 검사하며 잘못된 응답 묶음은 적용하지 않는다. `getStats()`로 진행/대기 요청·폐기·잘못된 응답·timeout 수를 조회한다.
- `npc-adapter-isolation`: adapter 충돌 1→0, 오래된 cleanup에 의한 등록 유실 1→0, 요청 소유권 오류 1→0, 응답 불일치 2→0. `npc-policy-lifetime`: 교체 후 응답 적용·종료 시 미취소·종료 후 결정 각각 1→0. 변경 전 원본과 변경 후 원본을 별도로 보존했다.
- `npc-frame-ownership`은 두 Provider의 실제 NPCInstance·Rapier·네이티브 WebGPU 장면을 렌더링한다. 같은 ID의 NPC가 소유 월드 응답을 적용하고, 한 월드 종료 후 관측/요청이 멈추며 다른 월드와 재시작은 계속 동작한다. 정책 HTTP 응답은 로컬에서 제어하므로 외부 AI 서버의 지연/처리량이나 FPS 개선 증거로 사용하지 않는다. NPC 고정 tick·LOD와 네트워크 권위 계약은 R09/R26/R30에 남는다.
- examples 타입 검사 중 공개 `NPCInstanceData`가 컴포넌트 값으로 연결되던 export도 실제 데이터 인터페이스로 수정했다.

커스텀 입력 개선:

- `runtime.inputAdapter`는 월드 수명 전체에서 같은 포트다. `useInputBackend`, store 명령, 자동화, 기본 motion 및 플러그인 motion service가 같은 포트를 사용한다. factory는 소비자별로 만들지 않고 플러그인 세대마다 한 번 만든다. 별도 extension ID는 `createGaesupRuntime({ inputExtensionId })`로 primary 입력을 선택한다.
- 입력 extension registry의 실제 등록/제거를 구독해 실행 중 소스를 교체한다. 원본 backend 구독은 소비자 수와 무관하게 한 개이며, 이전 소스의 지연 알림을 세대 검사로 차단한다. 월드 종료 때 네 입력 채널을 중립 상태로 돌리고 포트 쓰기를 막는다. `subscribe`가 없는 adapter도 포트를 통한 쓰기를 store에 반영한다. 알림 없이 외부에서 바뀌는 backend의 자동 polling은 별도 장치 입력 계층에서 처리해야 한다.
- `createMotionsPlugin({ createInputAdapter, disposeInputAdapter })`로 생성/해제를 연결한다. 등록 실패나 종료 중 예외에도 입력을 중지하며, 두 활성 월드가 같은 원본 adapter를 공유하거나 다른 월드의 포트를 원본으로 쓰는 것을 거부한다. 실패한 두 번째 월드가 첫 번째 월드의 소스를 해제하지 않는 검사도 포함한다.
- 새 검사에서 50세대의 factory 생성/해제 각 50회, 남은 소스 구독 0을 확인했다. 키보드 훅 두 개와 plug-in 교체 검사는 입력 연결·수명 검증이다. 도구/상호작용 중복 소비와 대상 store는 아래 단계에서 연결했다. 실제 `navigator.getGamepads()` 연결은 후속 작업이다.

상호작용 대상·입력 action 개선:

- `runtime.interactablesStore`·`useInteractablesStoreApi()`는 대상 registry와 현재 선택을 월드별로 소유한다. 같은 ID의 이전 등록 cleanup은 새 등록을 제거하지 않는다. 대상 제거 시 선택을 비우며 label/key 변경도 반영한다. 종료된 월드는 실행·탐색을 중지하고, 남아 있는 컴포넌트의 등록은 재시작 후 사용할 수 있다.
- `runtime.inputActions`·`useWorldInputActions()`는 action ID별 한 소비자와 공유 cooldown을 유지한다. 상호작용 훅과 도구 controller가 중복 마운트되어도 한 입력을 한 번만 실행한다. DOM 입력과 backend 갱신을 같은 눌림으로 합치고, 키를 누른 채 대상이 바뀌어도 자동 재실행하지 않는다. 마지막 등록 제거·종료 시 구독을 해제한다. 초기 구독 실패·동기 재진입·이전 세대 callback·일부 controller 제거를 단위 검사한다.
- `Interactable`은 부모 transform을 포함한 현재 world position을 제공한다. 같은 R3F elapsedTime의 tracker는 탐색을 공유하고, 실행 직전에도 최신 플레이어/대상 거리를 재검사한다. 전체 대상 선형 탐색의 공간 인덱스화와 여러 Canvas의 clock 통합은 아직 남아 있다.
- 이 action은 클라이언트 입력 실행 계약이다. 서버 권위 tick·직렬화 명령·재전송/중복 제거·rollback을 갖춘 R30 네트워크 명령 계약으로 계산하지 않는다.

시네마틱 수명 개선:

- `runtime.cinematics`·`createCameraCinematicPlayer()`는 camera store별 재생 주체를 하나로 유지한다. 공개 `playCameraCinematic(beats, { store })` 경로도 같은 주체에 연결되므로 비활성 월드의 명령을 실행하지 않는다. 새 재생은 이전 재생을 취소하며, 오래된 완료/취소가 새 카메라를 복원하지 않는다.
- `cancel()`·외부 `AbortSignal`·월드 종료는 기다리는 타이머를 즉시 해제하고 `finished`를 완료한다. 재생의 `state`는 playing/completed/cancelled/failed를 구분한다. 콜백 실패는 소유한 임시 효과를 정리한 뒤 `finished`에서 거절된다. 50회 월드 재시작 검사에서 해당 월드의 잔여 타이머는 0개다.
- 카메라 옵션·shake의 기존 offset·fade의 기존 transition을 복원한다. 이미 다른 코드가 교체한 상태는 덮어쓰지 않는다. 대상 벡터와 beat 옵션은 시작 시 사본을 만들며, 이미 실행한 장비·대화·사용자 이벤트 효과를 되돌리는 트랜잭션은 아니다.
- CinematicPanel은 Provider의 재생 주체를 사용한다. 중지 버튼·unmount·월드 종료·외부 신호가 실행을 취소하고, 이전 비동기 결과가 현재 미리 보기 상태를 덮어쓰지 않는다. 사용자 정의 `onPreview`에는 취소 신호를 전달한다. 신호를 무시하는 외부 callback의 부작용 자체를 강제 취소할 수는 없다.
- S3 카메라 후속에는 실제 시간 기반 dolly/orbit 보간, 현재 무시되는 orbit 각도, fade/shake의 연속 효과와 화면 검증을 포함한다. 이번 변경은 재생 소유권과 수명이며 해당 연출의 화질·경로 정확성 완료가 아니다. 공통 clock 연결은 R26, 저장 복원 중 효과 경합은 R02/R25에 남긴다.

게임패드 입력 개선:

- `createGaesupRuntime({ gamepad: { deadzone: 0.15, lookSpeed: 2.5 } })`와 `setMode({ controller: 'gamepad' })`로 사용한다. `runtime.gamepad.configure()`에서 장치 index·매핑·버튼 binding·사용 여부를 바꿀 수 있으며 `gamepad: false`로 자동 연결을 끈다. `lookSpeed` 단위는 rad/s다. 기존 터치 GamePad는 유지한다.
- [W3C Gamepad 표준](https://www.w3.org/TR/gamepad/)의 좌우 스틱·버튼 배치를 사용한다. 비표준 장치는 명시적인 매핑이 필요하다. 기본 A=점프, X=도구, Y=상호작용, RB=달리기, B/Back/Start=Escape이며 D-pad로도 이동한다. 표준 위치 이름이므로 실제 장치의 인쇄 문자와 다를 수 있다.
- 브라우저 창별 폴링 하나를 공유하고, 연결 장치 없음·백그라운드·blur·마지막 월드 종료에서는 연속 폴링을 멈춘다. API 미지원·접근 거부를 상태로 구분한다. 새 연결·포커스·재설정 시 이미 눌린 입력은 중립을 거쳐야 활성화된다. 키보드와 게임패드가 같은 키를 누른 경우 각각의 해제가 다른 입력 소유자를 지우지 않는다.
- 스틱의 radial deadzone과 입력 크기가 실제 캐릭터 속도에 반영된다. 수동 이동은 자동 이동/클릭 경로를 중지하고, 오른쪽 스틱은 delta 시간에 따라 카메라를 돌린다. 중립 방향의 잔류와 이동 중 프레임별 키 상태 객체 생성도 제거했다. 사용자 backend에 게임패드 채널이 없어도 월드 포트에서 보완한다.
- 단위/통합 검사에서 50회 setup/dispose·포커스·재연결·플러그인 교체·재진입/실패한 cleanup을 확인했다. 30/60/144Hz 입력 후 카메라 목표 yaw는 동일한 -2.5rad로 수렴한다. 실제 모니터 주사율/장치 지연 측정은 아니며, 게임패드 RAF와 물리/표시/공통 clock의 결합은 R26에 남는다.

구독·저장 복원 경합 개선:

- 날씨·달력·퀘스트는 source/target store 쌍별 구독 하나를 공유한다. 도감·농사도 같은 구독 수명 도구를 사용한다. 각 화면의 달력 콜백은 유지하며, 재진입 전이도 발생 순서대로 전달한다. 콜백 교체로 재구독하지 않고, 일부 화면 제거·월드 종료·재시작을 구분한다.
- 시간 store의 `hydrationRevision`은 직렬화하지 않는 복원 표식이다. 시간/가방의 복원과 실제 게임 진행을 구분한다. `save.isRestoring()`은 검증·적용·rollback 전체에서 유지되고, 월드의 다섯 관찰자는 이 구간의 중첩 변경도 게임 이벤트로 처리하지 않는다. 사용자 정의 관찰자도 같은 guard를 읽을 수 있다.
- `save.cancelPendingLoads()`는 이전 읽기의 적용을 무효화한다. 원본 adapter의 I/O 자체를 강제 취소하는 API는 아니다. 월드 종료 요청과 도메인 등록/해제에 연결했으며, 직렬화/복원 도중 바인딩 등록 변경은 거부한다. 같은 슬롯에 먼저 요청한 저장·삭제가 끝난 뒤 읽는다. 다른 슬롯의 읽기는 기다리지 않는다.
- 적용 중 AbortSignal 취소나 월드 종료가 요청되면 이미 적용한 도메인을 역순 복원하고 `false`를 반환한다. rollback 자체가 실패하면 성공/취소로 감추지 않고 오류·진단을 남긴다. migration/hydration 입력은 원본 snapshot과 분리한다.
- 시간 snapshot의 `pausedAt`이 있으면 복원 후에도 정지를 유지한다. 기존의 무조건 재개로 인한 rollback 상태 유실을 수정했다. 명시적 `resume()` 후에는 정지/종료 중 지난 시간을 제외하고 진행하며, 재개 상태로 저장한 realtime snapshot의 경과 시간 계약은 유지한다.
- 단위 검사에서 바인딩 순서 두 경우, 실패 rollback, 50회 시작/종료, 중첩 콜백 순서, stale cleanup을 검증했다. 임의 사용자 명령을 차단하거나 외부 오디오/네트워크 효과를 되돌리는 전체 명령 트랜잭션은 아니다. 시네마틱/장면 등 비동기 효과와 복원의 경합은 후속으로 남는다.

자동 저장·초기 로드 훅 개선:

- `useAutoSave`·`useLoadOnMount`는 명시적 `saveSystem`, 가장 가까운 Provider의 `runtime.save`, 기존 전역 저장소 순으로 선택한다. 주입한 외부 저장소도 Provider의 수명을 따른다. 종료 시 React의 다음 렌더를 기다리지 않고 구독/초기 읽기 소유권을 해제하고, 재시작하면 다시 연결한다.
- 같은 SaveSystem·슬롯은 초기 읽기·timer·unload/visibility 구독 하나를 공유한다. 생략한 슬롯과 `getDefaultSlot()`의 이름도 같은 키다. 자동 저장 주기가 다르면 가장 짧은 활성 주기를 사용하고, 같은 주기의 소비자 추가는 timer를 초기화하지 않는다. 비정상 주기는 기본 5분을 사용한다.
- 느린 쓰기 중 요청은 후속 1개로 합친다. 직렬화도 첫 요청과 쓰기 완료 뒤 최신 상태에만 수행한다. 마지막 소비자가 떠나면 대기 요청을 버리되 이미 시작한 I/O는 끝날 수 있다. 그 사이 다시 연결해도 별도 쓰기 루프를 만들지 않는다.
- `save.isLoading()`으로 현재 유효한 읽기를 구분하며, 초기 읽기·복원 중 자동 저장을 보류한다. 초기 읽기 실패도 해당 로드 소비자가 모두 해제될 때까지 자동 쓰기를 막는다. 이후 새 마운트에서 재시도하며 명시적 수동 저장은 별도 명령이다. 브라우저 종료 이벤트의 비동기 저장이 영구 기록될 것이라는 보장은 추가하지 않았다.
- 초기 로드 결과는 활성 소비자마다 한 번 전달한다. 늦게 추가한 소비자는 결과를 받아 기존 편집을 재복원하지 않는다. 일부 소비자 해제는 공유 읽기를 취소하지 않고, 마지막 해제는 AbortSignal로 적용을 취소한다. 콜백 예외는 다른 소비자/자동 저장과 격리한다.

최신 검증:

- 전체 Jest 335 suite/2,883개 통과, 기존 1개 건너뜀. 신규 검사 18개에서 저장소 선택·공유·느린 쓰기·초기 읽기 실패·수명·visibility·잘못된 주기·세대별 읽기 상태를 검증했다. 타입·전체 lint·ESM/CJS/타입 빌드·별도 package consumer·publint·examples build·배포 청크 검사 통과(`s2-save-hooks-*-final.log`).
- dev 36개는 `.artifacts/performance/2026-09-20T15-49-13-840Z/`에서 모두 통과했고 페이지 오류는 0이다. 소스 식별값은 `2489d196b87479d4c996a1997a44e32e1f1ec0b128ea01aae45edadaa537c2f0`이다. baseline `2026-09-20T15-41-13-578Z/`의 실패 2개와 candidate 2개를 `2026-09-21-s2-save-hooks.json`에 소스 manifest 2개와 보존한다. 첫 candidate는 `2026-09-20T15-46-37-609Z/`에 남긴다.
- 배포 형태 36개도 `2026-09-20T15-54-44-965Z/`에서 모두 통과했고 페이지 오류는 0이다. 소스 식별값은 `e89513c0f74d0d8d4ed7126a43f8cb8aecff307d4b26cbe77cbba15dcc43f01c`이며, dev 검증 후 비교 원본 묶음과 그 import를 추가한 상태다.
- `lab-ui-2026-09-20T15-54-44-976Z/`에서 기본 원본 123개, 새 전후 비교, 실시간 시나리오 36개, JSON 내보내기/불러오기, IndexedDB 재접속, 페이지 오류 0을 확인했다. 잘못된 전역 저장 3→0·초기 읽기 2→1·연속 요청의 쓰기/직렬화 12→2를 표시하는 캡처도 검토했다.
- 첫 배포/UI 검사 `2026-09-20T15-51-50-476Z/`·`lab-ui-2026-09-20T15-51-50-437Z/`는 preview의 base 불일치로 시작 화면을 불러오지 못했다. 실패 원본과 `s2-save-hooks-*-preview-base-failure.log`를 보존한다. `npm run preview -- --host 127.0.0.1 --port 5193 --strictPort --base=/gaesup-world/`로 빌드의 경로와 맞춘 뒤 위 최종 검사에서 통과했다.

이전 구독·저장 복원 단계 검증:

- 전체 Jest 334 suite/2,865개 통과, 기존 1개 건너뜀. 새 복원 수명·공유 구독·월드/시간 검사 25개를 포함한다. 타입·전체 lint·ESM/CJS/타입 빌드·별도 package consumer·examples build·배포 청크 검사도 통과했다(`s2-observers-*-final.log`).
- 최종 dev 34개는 `.artifacts/performance/2026-09-19T23-11-02-578Z/`, 배포 형태 34개는 `2026-09-19T23-14-41-860Z/`에서 모두 통과했다. 배포 소스 식별값은 `169e77d81a2e02daa7f4103b5a41a09a5630bd84da75785b820ea67ccd31a95d`다. 새 원본 6개는 `2026-09-20-s2-restore-observers.json`에 baseline 3개·candidate 3개와 소스 manifest 3개로 보존한다.
- `lab-ui-2026-09-19T23-14-41-575Z/`에서 기본 원본 119개, 새 전후 비교, 실시간 시나리오 34개, JSON 내보내기/불러오기, IndexedDB 재접속, 페이지 오류 0을 확인했다. 구독 5→3·2→1과 복원 중 갱신 6→0의 수치 화면도 캡처 검토했다. 2026-09-21 재개 시 현재 HEAD `70ea372c`의 소스 식별값이 위 검증 대상과 같음을 확인했다.
- 구독/경합 baseline은 `2026-09-19T22-53-11-001Z/`, 일시 정지 baseline은 `2026-09-19T23-09-45-487Z/`다. 초기 candidate와 첫 33개 회귀도 각각 `2026-09-19T22-57-04-729Z/`, `2026-09-19T23-06-20-284Z/`에 남겨 둔다.

이전 게임패드 단계 검증:

- 전체 Jest 331 suite/2,840개 통과, 기존 1개 건너뜀. 새 게임패드/입력 수명/물리/카메라 검사 30개를 포함한다. 타입·전체 lint·ESM/CJS/타입 빌드·별도 package consumer·examples build·배포 청크 검사도 통과했다(`s2-gamepad-*-final.log`).
- dev 31개는 `.artifacts/performance/2026-09-19T22-36-41-328Z/`, 배포 형태 31개는 `2026-09-19T22-42-35-514Z/`에서 모두 통과했다. 배포 소스 식별값은 `98e29a0abf60471fe8b41ea64f3360d88fa07652432514a18b23598342df22f3`다. 추가 WebGL 물리/카메라 검사는 `2026-09-19T22-43-15-243Z/`에서 통과했으며 두 렌더러의 절반/최대 입력 속도는 약 5/10 world/s다.
- `lab-ui-2026-09-19T22-42-35-556Z/`에서 기본 원본 113개, 새 전후 비교, 실시간 시나리오 31개, JSON 내보내기/불러오기, IndexedDB 재접속, 페이지 오류 0을 확인했다. 실제 장면과 수치 화면도 캡처 검토했다. 새 원본 4개는 `2026-09-20-s2-gamepad.json`에 baseline 2개·candidate 2개와 소스 manifest 2개로 보존한다.
- 첫 배포 검사 `2026-09-19T22-41-22-237Z/`는 preview가 이전 빌드를 제공해 새 시나리오를 찾지 못했다. 임시 디렉터리에 만드는 `test:demo`와 별개로 `build:demo`를 실행한 뒤 위 최종 검사에서 통과했다. 첫 실패 로그도 `s2-gamepad-*-stale-preview.log`로 보존한다.

이전 시네마틱 단계 검증:

- 전체 Jest 325 suite/2,810개 통과, 기존 1개 건너뜀. 새 시네마틱 수명/editor 검사 14개를 포함한다. 타입·전체 lint·ESM/CJS/타입 빌드·별도 package consumer·examples build·배포 청크 검사도 통과했다(`s2-cinematic-*-final.log`). 기존 worldCharacterScene 검사는 활성 월드에서 실행하고, 완료된 임시 fade가 복원되는 계약으로 갱신했다.
- 최종 dev 29개는 `.artifacts/performance/2026-09-19T21-53-51-199Z/`, 배포 형태 29개는 `2026-09-19T21-56-59-155Z/`에서 모두 통과했다. 배포 소스 식별값은 `9ad4dda2eb2d94cbb3bac61f2c16e1952e0ba2dc95a4690f4d933501a1b4f743`다. 시네마틱 세 검사는 공개 API/store/editor 실행 검증으로, GPU 렌더링이나 FPS 개선 증거가 아니다.
- `lab-ui-2026-09-19T22-00-21-112Z/`에서 기본 원본 109개, 새 전후 비교, 실시간 시나리오 29개, JSON 내보내기/불러오기, IndexedDB 재접속, 페이지 오류 0을 확인했다. 취소·복원 오류 1→0의 화면도 캡처 검토했다. 새 원본 6개는 `2026-09-20-s2-cinematics.json`에 baseline 3개·candidate 3개와 소스 manifest 2개로 보존한다.

이전 상호작용 입력 단계 검증:

- 전체 Jest 323 suite/2,796개 통과, 기존 1개 건너뜀. 새 action/store 검사 15개와 기존 입력/월드 회귀를 포함한다. 타입·전체 lint·ESM/CJS/타입 빌드·별도 package consumer·examples build·배포 청크 검사도 통과했다(`s2-input-actions-*-final.log`).
- 최종 dev 26개는 `.artifacts/performance/2026-09-19T21-33-40-246Z/`, 배포 형태 26개는 `2026-09-19T21-36-02-678Z/`에서 모두 통과했다. 배포 소스 식별값은 `edd6263d3cf572cba3ccbd5f7a20e92cf6277900c49f04bf9f9d5edbf0c0fca6`다. 도구/좌표 장면의 WebGL 추가 검사는 `2026-09-19T21-36-02-862Z/`에서 통과했다.
- `lab-ui-2026-09-19T21-36-02-791Z/`에서 기본 원본 103개, 상호작용·도구 전후 비교, 실시간 시나리오 26개, JSON 내보내기/불러오기, IndexedDB 재접속, 페이지 오류 0을 확인했다. 부모 변환/제거 후 장면과 수치 화면도 캡처 검토했다. 새 원본 5개는 `2026-09-20-s2-input-actions.json`에 baseline 2개·candidate 3개와 소스 manifest 2개로 보존한다.

이전 커스텀 입력 단계 검증:

- 전체 Jest 321 suite/2,781개 통과, 기존 1개 건너뜀. 새 입력 포트·런타임·registry 검사 15개와 기존 입력/플러그인 검사를 포함한다. 최종 소스의 타입·전체 lint·ESM/CJS/타입 빌드·별도 package consumer·examples build·배포 청크 검사도 통과했다(`s2-custom-input-*-final.log`).
- 최종 dev 23개는 `.artifacts/performance/2026-09-19T21-05-47-497Z/`, 배포 형태 23개는 `2026-09-19T21-08-07-956Z/`에서 모두 통과했다. 배포 소스 식별값은 `05184855d630b95d3c8315290b7b07e28d05948d780b8413d6f0a5b5d84299c5`다. 입력 변경이 기존 실제 브라우저 키보드·터치, NPC·grass·카메라 재현을 깨뜨리지 않는 것도 확인했다.
- `lab-ui-2026-09-19T21-08-08-007Z/`에서 기본 원본 98개, 입력 전후 비교 화면, 실시간 시나리오 23개, JSON 내보내기/불러오기, IndexedDB 재접속, 페이지 오류 0을 확인했다. 새 원본 3개는 `2026-09-20-s2-custom-input.json`에 baseline 1개·candidate 2개와 소스 manifest 2개로 보존한다.

이전 NPC 단계 검증:

- 전체 Jest 318 suite/2,766개 통과, 기존 1개 건너뜀. 새 adapter/런타임 검사 12개에 같은 ID의 월드 분리, 설정 사본, 중복 요청 억제, timeout, 응답 TTL, JSON 해석 중 무효화, 잘못된 행동, bulk 교체, setup 실패, 50회 재시작이 포함된다. 최종 소스의 타입·전체 lint·ESM/CJS/타입 빌드·별도 package consumer·examples build·배포 청크 검사도 통과했다(`s2-npc-*-final.log`).
- dev 21개는 `.artifacts/performance/2026-09-19T20-41-58-584Z/`, 배포 형태 21개는 `2026-09-19T20-44-10-051Z/`에서 모두 통과했다. 배포 소스 식별값은 `e8c82b4742c8f61c843abbb029db0fe76631f9e90f895f7a28e5c6ef9172375f`다. WebGL NPC 장면 추가 검사는 `2026-09-19T20-44-10-394Z/`에 있다.
- `lab-ui-2026-09-19T20-44-10-107Z/`에서 기본 원본 실행 95개, 새 전후 수치, 실시간 시나리오 21개, JSON round-trip, IndexedDB 재접속, 페이지 오류 0을 확인했다. 실제 두 NPC의 렌더링과 검사 수치 화면도 캡처 검토했다. 새 묶음 `2026-09-20-s2-npc-adapters.json`은 baseline 2개·candidate 6개와 3개 소스 manifest를 보존한다. 이후 UI에서 실행한 이력은 브라우저에 추가로 누적된다.

이전 단계 검증:

- 전체 Jest 316 suite/2,754개 통과, 기존 1개 건너뜀. 타입·전체 lint·ESM/CJS/타입 빌드·별도 package consumer·examples build·배포 청크 검사 통과(`s2-world-bridge-*-final.log`). examples의 내부 경로 import를 공개 API로 바꾼 뒤 전체 회귀를 다시 통과했다.
- dev에서 새 3개·회귀 20개 재현 통과(`.artifacts/performance/2026-09-19T20-10-56-709Z/`). 공개 API 경로의 최종 3개는 `2026-09-19T20-15-39-039Z/`, 소스 `a9a6f0bd1410bcdde5a2f5ccf6117bbbfd9816424f750fb3383bbba9649ac878`에서 확인했다. 배포 형태 최종 23개는 `2026-09-19T20-16-45-579Z/`, 소스 `2badb31614bd4bb64dbf41f8316b8e3197b47784e31dc37f08d300146a8522b8`에서 통과했다. WebGL 카메라/커서 추가 재현은 `2026-09-19T20-16-45-631Z/`에 있다.
- `lab-ui-2026-09-19T20-16-45-668Z/`에서 87개 원본 실행·새 비교 수치·실시간 기능 18개·JSON round-trip·IndexedDB 재접속·페이지 오류 0을 확인했다. 두 canvas와 생성 좌표·전후 수치 화면을 캡처 검토했다. 새 원본 8개는 `2026-09-20-s2-world-bridge.json`이며 공개 API 전환 전의 기능 검사와 이전 단계 원본도 보존돼 있다.
- 별도 `test:harness`는 현재 사용자 `AGENTS.md`에 없는 과거 문구 `canonical write path`를 요구해 실패한 상태다. 사용자 지침을 변경하거나 이 실패를 통과로 계산하지 않았다.

S2 복원 중 효과 수명 — 2026-09-21:

- [SaveSystem](../src/core/save/core/SaveSystem.ts)에 `registerRestoreGuard()`를 추가했다. 모든 domain 준비/검증 이후, 첫 적용 이전에 들어가고 적용·롤백이 끝난 뒤 역순 해제한다. storage 읽기 동안 효과를 정지하지 않으며 잘못된 snapshot은 기존 시네마틱을 취소하지 않는다. guard 진입 실패는 적용을 차단하고 이미 들어간 guard를 해제한다. 해제 오류도 나머지 정리를 막지 않고 진단/오류로 노출한다. 해제 단계 오류가 이미 확정된 데이터를 다시 rollback하지는 않는다.
- runtime이 시네마틱·장면 전환을 일시 중단하고 이전 SFX/지연 decode를 취소한다. 복원 중 시네마틱과 장면 이동 재진입, AudioStore/AudioEngine의 새 재생을 차단한다. 적용 또는 rollback 이후 현재 활성 세대만 재개한다. 취소한 이전 효과는 재실행하지 않는다. guard는 월드별로 등록·해제하며 반복 setup/dispose 10회에서 잔여 소유자 0이다.
- `useAmbientBgm`의 공유 구독은 적용 중 시간·날씨 알림을 건너뛰고 최종 상태를 한 번 반영한다. 복원 중 unmount된 소유자는 나중 해제 콜백으로 다시 재생하지 않는다. 수동 BGM과 다른 월드의 소리는 유지한다. 변경은 runtime 소유 경로에 적용되며 임의 외부 콜백이나 직접 store 쓰기를 모두 트랜잭션으로 만드는 것은 아니다.

| 재현 | 변경 전 → 후 | 확인 범위 |
| --- | --- | --- |
| `world-restore-effects` | 늦은 시네마틱 효과 1→0, 취소 누락 1→0, 재진입 장면 오류 1→0, 중간 BGM 재생 2→0, rollback 효과 오류 3→0 | 두 실제 Provider·IndexedDB·공유 BGM 훅·잘못된 snapshot·새 효과 재개·다른 월드 보존 |
| `world-restore-audio-decode` | 이전 소리/abort 누락/다른 상태 훼손/재개 누락 각각 0 | 실제 AudioContext와 WAV 디코드를 지연시킨 뒤 복원. 수동 BGM·다른 월드 SFX 보존. 변경 전 baseline 없음 |

원시 baseline은 `.artifacts/performance/2026-09-20T23-28-07-045Z/da2850c2-6ddb-4a21-bf22-3a815576507c.json`, source `e1c4c830…`이다. 수정 후 8개 관련 재현은 `2026-09-20T23-35-28-038Z/`, source `51cdd82a…`에서 통과했다. 새 candidate `381c4b86…`·`92087026…`와 baseline을 [복원 효과 번들](../examples/performance/baselines/2026-09-21-s2-restore-effects.json)에 보존했다. 이들은 기능 계수이며 CPU/GPU 성능 개선율로 계산하지 않는다.

최종 전체 Jest 338개 suite·2,899개 검사 통과, 기존 suite/test 1개 skip. 새 검사 14개는 guard 순서·실패/취소·동일 함수 중복 등록·중간 해제·지연 storage 읽기·BGM/SFX·다른 월드·10회 재시작을 포함한다. 타입·ESLint·ESM/CJS/타입 빌드·publint·별도 package consumer·demo build/초기 chunk 검사 통과(`.artifacts/performance/restore-effects-*.log`). 전체 harness 문구 불일치는 이전 상태와 같으며 `verify:full` 통과로 표시하지 않는다.

최종 production source `ef0fada6…`에서 새 2개와 회귀 8개 시나리오 모두 통과했다(`.artifacts/performance/2026-09-20T23-39-48-459Z/`). lab UI는 저장 실행 137개·실시간 시나리오 40개·새 전후 계수·JSON/IndexedDB 왕복·페이지 오류 0을 확인했다(`lab-ui-2026-09-20T23-39-48-441Z/`). 미니홈피 DPR 2·실제 WebGPU/WebGL fallback·장치 복구·이동/편집·PNG/GLB·저장/공유·모바일 흐름도 다시 통과했다(`.artifacts/minihome/2026-09-21-restore-effects/`).

S2 후속 순서:

1. **월드 데이터 소유권**: 비동기 gameplay action의 취소, 유지된 실행 context의 쓰기 차단, 복원 중 명령 재진입, 플래그·일회성 이력 저장을 연결했다. 임의 외부 효과는 await 뒤 `commitGameplayEffect(context, effect)` 또는 취소 신호 확인을 사용하는 계약이다. 외부 서비스의 이미 완료된 효과까지 rollback하는 계약과 실제 USB/Bluetooth 장치 확인은 남긴다.
2. **실행 주체 통합**: NetworkSystem은 `postSimulation`, NetworkBridge 알림은 `publish`에 연결했다. 다음은 물리·NPC의 기존 프레임 루프 통합이다. 표시만 보간하고 중복 소비자가 계산을 늘리지 않게 한다.
3. **공통 계약**: core/next 엔티티·transform revision, command sequence·권위 tick·snapshot revision을 정의하고 동일 입력 재생으로 검증한다. 자동 event trigger·flag/실행 이력 저장·부분 효과의 원자성도 R30에서 다룬다.
4. **초기화·패키지 경계**: 내부 루트 import 순환과 import 시 전역 초기화를 제거하고 명시적 world 생성·headless smoke·초기 로드 bytes를 검증한다. R25/R26은 전체 조건이 끝날 때까지 일부 구현으로 표시한다.

### 미니홈피 3D·공개 API·성능 검증 — 2026-09-21

추가 제품 범위는 실제 `examples/minihome`의 렌더링·조작·저장/공유 흐름과 공개 API 검증이다. 미니홈피의 제품 개선을 기존 31개 코어 요구사항 전체 완료로 계산하지 않는다. 별도 결과 보고서 대신 이 PRD와 `/performance`의 원시 실행을 갱신한다.

| 순서 | 작업·현재 상태 | 재현·완료 조건 |
| --- | --- | --- |
| M1 정확성·수명 | 구현: 공개 SceneRuntime의 계층/world transform·scale·enabled 반영, 가구 인스턴싱, 변경 시 렌더링, 화면 비활성/종료 시 중단. 드래그는 미리 보기 후 한 번만 명령으로 확정하며 취소·revision 충돌을 처리 | `minihome-lifecycle`, 배치/RAF 단위 검사, 실제 편집·실행 취소·종료 검사 |
| M2 3D·조작 품질 | 구현: 모서리 형상·재질·ACES 조명, 낮/저녁, 그림자·DPR 3단계, 카메라 3종·모바일 제스처·키보드, 장애물 회피 이동, PNG·GLB·전체 화면·복구 | 실제 WebGPU/WebGL2, DPR 2, 데스크톱/모바일, 장치 손실 후 새 canvas 복구 |
| M3 공개 API 활용·검사 | 구현: 렌더러·SceneRuntime·NavigationSystem을 제품 경로에 연결. 별도 fixture에서 11개 계약, 라이브러리 56개·예제 7개 명명된 호출 경로 검사 | 미니룸의 `API·성능` → `API 기능 검사 실행`, `/performance`의 `minihome-api`. 현재 방·브라우저 저장을 바꾸지 않고 실제 반환값/상태 검사 |
| M4 부하·반복 측정 | 구현: 실제 미니룸 엔진의 1~1,000개 가구, 크기·DPR·backend·예열/측정 시간 설정, 원시 표본·전후 비교·JSON 보존 | `minihome-rendering`. 정식 측정은 같은 기기·브라우저·설정에서 각각 3회, 회당 10초 예열·30초 측정 |
| M5 다음 제품 통합 | 대기: 외부 GLB/텍스처의 공통 로더·캐시/해제, 실제 아바타 애니메이션·편집 도구 확대, 코어 GPU 경로와 계약 통합 | S3/S4/S5와 연결. 자산 교체/반복 방문의 메모리 안정화, picking·카메라·저장 round-trip, 실제 모바일 GPU 비교 |
| M6 네트워크 준비·통합 | S2 계약/S8 순서 유지: document 명령·안정 ID·revision·snapshot을 권위 서버·다중 사용자 입력·재접속과 연결 | 실제 두 클라이언트, 권한·중복/stale 명령·복원·공유 충돌·대역폭 검증 후 승인 |

실제 제품의 [roomEngine.ts](../examples/minihome/roomEngine.ts), [roomBatches.ts](../examples/minihome/roomBatches.ts), [demandLoop.ts](../examples/minihome/demandLoop.ts)를 사용한다. 부하 검사에 별도 모사 렌더러를 두지 않는다. 내비게이션은 공개 `NavigationSystem`의 장애물 grid·경로 탐색을 사용하고 월드 종료 시 해제한다. GLB는 공유 GPU 배치 버퍼 대신 논리 장면의 일반 mesh를 내보낸다.

품질 변경 중 WebGPU가 이미 폐기된 `ShadowDepthTexture`를 제출하는 오류를 실제로 재현했다. 그림자 크기를 제자리에서 바꾸는 대신 light/shadow 소유 객체를 교체하고 다음 제출 후 이전 자원을 해제했다. 이후 3개 품질 전환·DPR 2·내보내기에서 GPU validation 오류가 없어졌다. Three.js의 [attachment view 캐시 관련 이슈](https://github.com/mrdoob/three.js/issues/34301)와 유사한 증상이며, 이슈의 모든 원인이 본 프로젝트와 동일하다고 단정하지 않는다.

API 검사는 [apiChecks.ts](../examples/minihome/apiChecks.ts)에서 장면 생성/직렬화/명령·revision 충돌·계층/쿼리·SaveSystem·Unity 왕복·독립 runtime/plugin·고정 tick·경로 탐색·편집 이력·공유 개인정보를 확인한다. 56개는 중복을 제거한 공개 함수/메서드 경로 수이며, 패키지 전체 API 통과율이나 네트워크 통합 완료율이 아니다. `API·성능` 화면에서 검사별 실제 사용 API와 실패 원인을 펼쳐 볼 수 있다.

정식 미니룸 A/B: 가구 40개, 960×540, DPR 1, WebGPU NVIDIA/Blackwell, Chrome 153. 환경·설정·의존성·호스트 식별값 일치. 개선 전 5,386프레임, 개선 후 5,400프레임이다.

| 지표 | 개선 전 | 개선 후 | 해석 |
| --- | --- | --- | --- |
| draw call / 프레임 | 623 | 75 | 88.0% 감소. 프레임 reset 이후 모든 pass 합계 |
| CPU render 제출 p95, 3회 중앙값 | 4.5ms (4.0~5.1) | 1.2ms (1.0~1.2) | 73.3% 감소. GPU 실행 시간은 별도이며 현재 미수집 |
| 프레임 간격 p95, 3회 중앙값 | 23.4ms (18.8~26.3) | 17.0ms (17.0~17.1) | p50은 양쪽 약 16.7ms. 60Hz 제한에서 FPS 배수 개선으로 환산하지 않음 |
| 대기 중 RAF callback / 표시 30프레임 | 30 | 0 | draw는 양쪽 0. 렌더뿐 아니라 대기 루프도 중단 |
| disabled 가구 표시 불일치 | 1 | 0 | 실제 SceneDocument 명령 이후 투영 검사 |
| API 계약 검사 | 기존 없음 | 11/11 통과 | 라이브러리 56개·예제 7개 호출 경로 |

동일한 입력 장면·가구 수의 제품 경로 전체 비교다. 올바른 scale 반영, 형상/조명 변경, 인스턴싱, 정적 그림자 재사용이 함께 적용되었으므로 한 가지 최적화만의 기여도나 동일 픽셀 화질 비교라고 해석하지 않는다. 전체 renderer triangles는 54,281→46,245이며, renderer가 집계한 할당 bytes는 약 14.73→14.91MB다. 이 값은 총 VRAM이 아니다. 저사양/모바일 실기기 및 GPU timestamp 검증은 후속 범위다.

원시 증거는 `.artifacts/performance/2026-09-20T16-05-44-315Z`(이전 기능/진단), `2026-09-20T16-06-06-023Z`(이전 정식 3회), `2026-09-20T16-41-25-387Z`(이후 기능/진단), `2026-09-20T23-14-11-346Z`(이후 정식 3회)에 보존한다. 디렉터리 시각은 UTC다. 이전 source hash `e7fcd357…`, 이후 `fbdb2500…`이며, 11개 실행·2개 전체 source manifest를 [미니홈피 번들](../examples/performance/baselines/2026-09-21-minihome.json)에 보존한다.

추가 짧은 진단에서 WebGPU 가구 6/200/1,000개 모두 draw 75·오류 0, WebGL 가구 40개 draw 74·대기 callback 0을 확인했다. 각각 250ms 예열·1.5초 측정이므로 정식 성능 회귀 판정에 합치지 않는다. 원시 기록은 `.artifacts/performance/2026-09-20T23-16-39-586Z`, `23-16-45-325Z`, `23-16-50-992Z`, `23-16-56-978Z`에 있다.

재현 명령:

```sh
node scripts/performance/probe.mjs --url http://127.0.0.1:5191/performance --scenario minihome-api,minihome-lifecycle,minihome-rendering --count 40 --role candidate
node scripts/performance/probe.mjs --url http://127.0.0.1:5191/performance --scenario minihome-rendering --count 40 --role candidate --benchmark --repeat 3
node scripts/probe-minihome.cjs
```

브라우저 제품 검사는 `GAESUP_PROBE_URL`, `GAESUP_PROBE_OUTPUT`, `GAESUP_PROBE_DPR` 환경 변수로 URL·증거 경로·DPR을 지정한다. 회귀 검증은 TypeScript·ESLint, Jest 336개 suite/2,885개 검사 통과(기존 1개 skip), demo build/초기 chunk 검사와 실제 브라우저 흐름을 구분한다. 기존 harness의 `AGENTS.md` 문구 요구 불일치 때문에 전체 `verify:full` 통과를 주장하지 않는다.

최종 번들을 포함한 production demo에서도 다음을 확인했다.

- 미니홈피 전체 브라우저 흐름 통과: WebGPU·DPR 2, WebGL2 fallback/장치 손실 후 재시도, 카메라·이동·품질/조명·PNG·GLB·전체 화면·드래그 취소, 저장/복원·undo/redo·Unity·공유·개인 기록 보존·quota/손상 파일·모바일 overflow 없음. GLB validator 오류 0, 브라우저/GPU 오류 0. `.artifacts/minihome/2026-09-21-production-integrated/`에 화면과 결과 보존.
- `/performance` UI에서 저장 실행 134개, 미니룸 전후 draw 623→75·대기 callback 30→0, 실시간 시나리오 38개 통과, JSON 내보내기/새 context 불러오기/IndexedDB 재로드 일치. 증거: `.artifacts/performance/lab-ui-2026-09-20T23-19-39-947Z/`.
- 최종 source `4fa283c8…`로 미니홈피 3개 시나리오 재실행 통과. `.artifacts/performance/2026-09-20T23-20-42-171Z/`. 정식 측정 source와의 차이는 측정 번들 JSON·해당 import뿐이며 렌더링 코드가 동일하다. 이 짧은 재검사를 정식 측정 반복 수에 합치지 않는다.
- 최종 demo build, TypeScript, ESLint, demo 초기 chunk 검증 통과. 초기 정적 JavaScript는 6개 chunk·196,511 bytes이며 3D 엔진은 지연 로드된다. 테스트/검증 로그는 `.artifacts/performance/minihome-*-integrated.log`에 보존.

### 공간 검색·카메라 충돌 — 2026-09-21 후속

R04는 중심점 검색과 world-space AABB 인덱스를 분리했다. 최근접 광선·최대 거리·큰 경계 상자·갱신/삭제와 극단 반경의 유한 작업량을 검사한다. R05는 장면의 렌더 여부와 무관하게 신규 메시를 조회하고, 이전 반환 위치를 보존하며, 구와 삼각형의 연속 충돌로 반경을 적용한다. 명시적으로 제외한 아바타 subtree는 유지한다. instance/batch/skinning/morph를 실제 Three 객체로 검증한다.

`spatial-query`와 `camera-obstacles`의 기존 오류는 native WebGPU 반복 실행에서 해소했다. 추가 `spatial-scale`과 `camera-radius`는 CPU 질의 정확성·규모 비용을 기록한다. 1만 객체의 선형 기준 대조와 1만 메시 카메라 질의는 [실행 기록](prd-execution-2026-09.md)에 raw 경로·source hash·측정 한계를 남겼다. 전체 컨트롤러 경로, 복잡 장면·실기기·peer 조합과 정식 성능 예산은 남아 있어 R04/R05를 `working`으로 유지한다.

구 충돌의 면·모서리·꼭짓점 분해는 [Fauerby의 원문](https://peroxide.dk/papers/collision/collision.pdf)을 참고했으며, 구현의 정확성은 독립적인 거리 최소화 기준과 실제 메시 회귀 검사로 대조한다.

### 비동기 명령 복원·네트워크 clock — 2026-09-21 재개

R02/R25의 기존 진행 중 코드를 검증하고 회귀 검사를 보강했다. 복원은 게임 명령 세대를 취소하고 아직 끝나지 않은 사용자 Promise와 관계없이 dispatch 호출을 종료한다. 이전 context의 플래그/실행 이력 쓰기와 뒤따르는 action을 차단하고, 플래그·일회성 이력을 저장·복원한다. 검증되지 않은 snapshot은 실행 중인 명령을 취소하지 않으며, 적용 실패 시 기존 상태를 rollback한 뒤 새 명령을 받을 수 있다. 동기 action 사이의 불필요한 microtask도 제거했다.

- `world-gameplay-restore`: 미종료 호출 1→0, 늦은 보상 1→0, 늦은 플래그 2→0, 복원 중 재진입 보상 1→0, 저장 상태 불일치 2→0, 일회성 정책 불일치 1→0. 다른 월드의 실행은 유지한다.
- `gameplay-command-order`: 동기 action 중간 상태를 노출하는 microtask 1→0.
- 실제 명령 1,000개×8 action의 10초 예열·30초 측정 3회: baseline 중앙값 0.8/0.7/0.7ms, candidate 0.7/0.8/0.7ms. 각 중앙값의 중앙값이 약 0.7ms로 같으므로 속도 개선을 주장하지 않는다. 기준 5쌍의 정식 성능 인수도 아니다. 원시 기록은 [gameplay 번들](../examples/performance/baselines/2026-09-21-s2-gameplay-commands.json)에 보존한다.

R25/R26의 네트워크는 runtime이 지연 생성한 전용 `networkBridge`를 소유한다. NetworkSystem의 단독 타이머를 월드 고정 clock 등록으로 대체하고, 공유 소비자는 하나의 갱신/알림 등록과 RAF를 사용한다. 계산 뒤에만 알림을 발행하며, 변경하지 않은 updateFrequency 재적용이 갱신을 계속 미루지 않게 했다. 오래된 시간 기반 snapshot 캐시를 제거하고 현재 tick의 객체·연결 수를 반영한다. 기본 설정은 60 tick 중 30회 갱신하며, 설정 빈도가 clock 빈도를 넘으면 tick당 1회로 제한한다.

- `world-network-clock`: 두 월드의 같은 systemId 공유 1→0, 기존 clock 미연결 0회→초당 30회 갱신/알림. 30/60/144Hz와 소비자 1/2개 조합을 검사한다. 종료 후 엔진 잔존 1→0, 이전 bridge 재사용 1→0.
- `world-network-consumers`: 실제 Provider·공개 훅을 두 월드에 연결해 월드별 RAF 1개, 초당 갱신/알림 30회, 개별 종료·재시작, 최종 RAF 잔여 0을 브라우저에서 확인했다. React 재시작 수명은 별도 단위 검사에서 10회 반복했다.
- 비교 원본과 source manifest는 [network clock 번들](../examples/performance/baselines/2026-09-21-s2-network-clock.json)에 보존한다. 최종 dev 실행은 `.artifacts/performance/2026-09-21T13-37-51-663Z/`의 6개 시나리오 모두 통과, page errors 0이다.

검증 범위:

- 개발 화면과 production build 화면에서 각각 실시간 시나리오 44개, 전후 수치 표시, JSON 내보내기/불러오기, 새 브라우저의 IndexedDB 복원, page errors 0을 확인했다. 캡처: `.artifacts/performance/lab-ui-2026-09-21T13-48-45-142Z/`, `.artifacts/performance/lab-ui-2026-09-21T13-51-07-712Z/`.
- 일반 Jest 345 suite/2,957 tests, 메모리 5 suite/88 tests 통과. 이전부터 제외된 suite/test 1개는 유지한다. 새 회귀는 지연 Promise 취소·실패, 보존 context, 잘못된 저장 데이터, rollback, 실제 네트워크 훅, Provider 교체, 반복 종료/재시작과 재등록된 엔진을 포함한다.
- ESM/CJS/타입 build·publint·fresh tarball consumer 통과. 설치한 ESM/CJS 패키지에서도 60 tick→네트워크 30회와 플래그·일회성 이력 복원을 검사한다. 패키지 파일 목록은 소비자 문서를 명시해 작업 기록이 npm tarball에 들어가지 않게 했다.
- Node 기반 방 서버 검사는 `test:minihome:service`로 전체 verify에 포함하고 Jest 수집과 분리했다. 미니홈피 수명 검사에 남아 있던 가구 6개 고정 가정을 없앴다. 타일·가구 12종·Bloom으로 부하 구성이 바뀐 미니홈피 시나리오는 v2로 올려 이전 장면의 성능 비교와 구분한다.
- `test:demo`의 초기 정적 JavaScript는 6개 chunk·196,542 bytes이며 3D 엔진 지연 로드를 확인했다.
- 전체 `verify:full`은 `.tmp/prd-resume-all-final.log`에서 통과했다. 이후 같은 설정 재적용의 불필요한 알림을 차단하고 실제 훅 15개 집중 검사·타입·lint·재빌드·publint·설치 소비자를 다시 통과했다(`.tmp/prd-network-clock-config.log`, `.tmp/prd-resume-last-consumer.log`). 최종 production source `940b0e38…`의 관련 8개 시나리오도 모두 통과했다(`.artifacts/performance/2026-09-21T13-56-25-038Z/`).

네트워크 갱신 주기·소유권을 검증한 단계다. 아래 물리 후속을 포함해도 NPC의 전체 clock 통합, 네트워크 내부 wall-clock timestamp의 재생 계약, core/next 엔티티 계약, 권위 명령·부분 외부 효과의 원자성은 남아 있다. 따라서 R25/R26과 S2는 `working`으로 유지한다.

### 2026-09-21 후속: 실제 물리 고정 tick과 표시 보간

[WorldPhysics](world-physics-clock.md)를 추가해 공개 `PhysicsEntity`의 조작·접지 계산을 `simulation`, Rapier의 공개 수동 step을 `physics` 단계에 연결했다. 여러 물리 장면도 runtime의 공유 clock lease를 사용한다. multiplayer 화면·blueprint preview·NPC 편집 preview에 적용했다. 원본 Rapier Physics를 직접 사용하는 소비자의 기존 경로는 유지한다.

물리 자세와 표시 자세를 분리했다. `PhysicsEntity`와 `useWorldPhysicsInterpolation`이 연결된 시각 group은 이전/현재 물리 tick을 보간하며 collider와 Rapier 위치는 변경하지 않는다. 부모의 이동·회전·스케일, teleport, 제거된 Rapier body의 지연 cleanup을 검사한다. 일시정지·종료·재시작·다른 월드 종료와 다중 물리 소비자도 회귀 검사에 포함한다.

- 새 `world-physics-clock`: 30/60/144Hz 각각 실제 Rapier 180 step, 전체 tick 위치 기록 차이 0, 화면 보간 오차 0. 이동·점프·착지·종료 후 step 차단·최종 등록 해제도 통과했다.
- WebGL 실행: `.artifacts/performance/2026-09-21T14-24-45-391Z/`. 새 시나리오와 기존 접지·게임패드 물리·NPC 프레임 소유권 4개가 모두 통과했다.
- 네이티브 WebGPU 실행: `.artifacts/performance/2026-09-21T14-26-03-778Z/`. 실제 NVIDIA 어댑터에서 같은 위치·보간 오차 0을 확인했다.
- 새 시나리오의 원시 실행 2개와 source manifest 2개는 [물리 clock 번들](../examples/performance/baselines/2026-09-21-s2-physics-clock.json)에 보존한다. 기존 시나리오 회귀 3개는 위 원시 artifact에 유지한다. 단위 `world`를 lab 저장·복원·표시에 추가했다.
- 초기 브라우저 검사에서 거리 단위의 parser 누락과 R3F의 지연 unmount를 확인해 수정했다. 실패 기록도 `.artifacts/performance/2026-09-21T14-20-09-933Z/`, `2026-09-21T14-21-15-636Z/`에 남겼다.
- 전체 `verify:full` 통과: 일반 Jest 347 suite/2,965 tests, 메모리 5 suite/88 tests, lint·build·publint·설치 ESM/CJS 소비자·demo 검사를 포함한다(`.tmp/prd-physics-verify-full.log`). 기존 제외 suite/test 1개는 유지한다. 초기 정적 JavaScript는 6 chunk·196,619 bytes다.
- 개발/production UI 각각 45개 실시간 시나리오·전후 표시·JSON·IndexedDB 복원 통과, page errors 0. 기록: `.artifacts/performance/lab-ui-2026-09-21T14-30-52-610Z/`, `lab-ui-2026-09-21T14-32-00-149Z/`. 최종 번들은 181개 실행을 포함한다. 호환 baseline이 없는 별도 backend 회귀 실행을 기존 비교 번들에 섞으면 미측정으로 표시됨을 확인했고, 새 physics 시나리오 2개만 해당 번들에 포함했다.

고정 tick의 기능 동등성 증거이며 FPS 개선이나 전체 R26 인수는 아니다. NPC의 이동·판단은 아직 시각 컴포넌트 수명과 렌더 프레임에서 분리해야 한다. 게임패드 폴링, 모든 입력의 tick 기록/재생, 전체 장면 부하 성능도 남아 있다.

### 2026-09-22 후속: NPC 시뮬레이션 분리와 감지 CPU 측정

`NPCSimulation`이 runtime의 고정 tick에서 이동·AI 판단을 실행한다. React의 NPC 표현이 LOD로 사라져도 자세와 경로는 유지한다. 재마운트한 Rapier body는 현재 자세를 받고, LOD·경로 시작·저장도 실제 시뮬레이션 위치를 읽는다. tick마다 store를 갱신하지 않으며, 같은 판단 주기의 관측 결과는 한 번에 게시한다. 물리 sensor는 시각 보간 group 밖에 둔다.

`NPCPerceptionIndex`는 기존 `SpatialGrid`를 재사용한다. 후보 수를 줄인 뒤 원래 감지 함수를 호출하므로 높이를 포함한 거리 판정과 동률의 순서를 유지한다. 브라우저 RAF가 없는 Node에서는 타이머 없이 수동 tick을 사용할 수 있다.

- 전체 로컬 `verify:full`: 일반 Jest 349 suites/2,975 tests, 별도 메모리 88 tests, lint·build·publint·설치 소비자·showcase 통과. `.tmp/prd-npc-verify-final.log`에 기록했다. 설치한 ESM/CJS 패키지에서 NPC 수동 이동·현재 위치 저장도 검사한다.
- `npc-distance`: 실제 NPCSystem·Rapier로 화면 밖 이동, 현재 위치 기반 LOD, 이동 중 저장, 재등장, runtime 종료를 WebGL과 네이티브 WebGPU에서 통과했다. 재마운트 위치 오차는 최대 약 `6.36e-7 world`로 검사 허용치 `1e-5` 이내다.
- `npc-perception` v2: 같은 source `29c2aacc…`, seed·1,000 NPC·환경에서 기존 선형 계산과 공간 인덱스를 5쌍 교차 실행했다. 매 실행 warmup 10초+측정 30초이며 인덱스 refresh 비용을 포함한다. 10회 모두 결과 동등성 검사 통과, 브라우저 오류 0.
- 감지 배치 CPU p95의 5회 중앙값은 **21.6→10.3ms, 52.3% 감소**다. baseline p95 범위 20.1–26.8ms, candidate 9.9–12.5ms. 표본은 각각 6,858/11,546개다. 이 값은 전체 NPC 관측 1배치의 CPU 시간이며 GPU 시간이나 전체 장면 FPS가 아니다.
- 100 NPC에서도 같은 방식으로 5쌍 교차 실행했다. CPU p95 중앙값은 baseline/candidate 모두 **0.3ms**이며, 측정 해상도 내에서 중앙값 회귀가 없었다. source `12a353d3…`, 표본 29,273/29,509개, 10회 모두 결과 동등성 통과다. 1,000개 실행과 source가 다르므로 서로 직접 비교하지 않는다.
- 원시 측정: 1,000개는 `.artifacts/performance/2026-09-21T15-11-25-383Z/`, 100개는 `.artifacts/performance/2026-09-21T15-23-33-669Z/`. 기능 실행 2개와 정식 CPU 실행 20개는 [NPC 증거 번들](../examples/performance/baselines/2026-09-22-s3-npc.json)에 보존했다. 앞선 짧은 v1 진단은 정식 비교에서 제외한다.

R09/R26은 `working`이다. 500 NPC 부하, 전체 장면의 다른 비용·프레임 예산, 50회 수명 반복, 물리 모바일 장치, 게임패드 폴링·모든 입력의 tick 기록/재생은 남아 있다. npm 중간 릴리스 진행 상태는 코어 성능 인수와 별도로 확인한다.

## 1. 목표와 범위

사용자가 일반 월드와 GPU 런타임에서 같은 동작을 얻고, 대규모 장면을 안정적으로 편집·탐색하며, 각 개선을 examples에서 직접 재현하고 수치로 확인할 수 있게 한다.

핵심 결과는 다음과 같다.

1. 상태 손상, 반복 렌더링, 잘못된 충돌, 리소스 종료 실패를 수정한다.
2. 월드별 상태 소유권과 고정 tick 실행 순서를 정립한다.
3. 기존 월드와 `next`가 엔티티·변경 정보·렌더링 서비스를 공유한다.
4. GPU 배치·다중 카메라·대형 지형·에셋·후처리를 일관된 리소스 계약으로 관리한다.
5. 각 요구사항을 실제 구현을 사용하는 examples 시나리오와 연결한다.
6. 기능 정확성, 속도, 화질, 메모리를 구분해 변경 전후 결과를 표시한다.
7. 후속 네트워킹에 필요한 ID·tick·명령·스냅샷 계약을 앞 단계에서 정한다.

이번 문서는 실행 순서와 완료 기준을 정한다. 문서 작성 자체를 코드 개선 완료로 계산하지 않는다. 전체 멀티플레이 서비스와 운영 인증 구현은 후속 S8에서 수행하되, 데이터 계약은 S2부터 반영한다. 관리자 권한을 운영에 사용하는 시점에는 R12 완료가 선행해야 한다.

## 2. 현재 상태

| 구분 | 현재 확인된 상태 | 남은 작업 |
| --- | --- | --- |
| 소스 감사 | 비테스트 TS/TSX/JS/JSX 906개 대상 검색과 주요 경로 상세 검토, 일부 실행 재현 | 재현을 지속 실행 가능한 examples 시나리오로 옮기기 |
| 일반 월드 GPU 배치 | 구현 존재. 재질 동기화·다중 카메라·버전 의존 문제 확인 | R06, R13, R17, R27 |
| TRAA/GTAO | 구현 존재. 합성 순서·변형 motion vector·history 수명 개선 필요 | R15, R16 |
| `/engine` example | CPU/GPU/all 모드와 frameMs, cullMs, drawCalls 등 표시 존재 | 측정 의미 검증, p50/p95, 저장된 전후 비교, 감사 시나리오 확장 |
| 브라우저 검증 | `/performance` 시나리오 69개, 원본 실행 179개. dev·배포 examples와 probe가 같은 시나리오를 사용 | 일반 월드/editor 통합, 지원 조합·수명 반복 확대 |
| 성능 개선 완료 판정 | 감사 지적 31개 중 본 PRD의 examples·수치 기준을 충족한 항목 0개 | 기능 구현률과 혼동하지 않는다. 기존 구현을 없던 것으로 계산하는 수치가 아니다. |
| 공식 성능 baseline | 네이티브 WebGPU에서 10초 예열·30초 측정 5회, 총 9,000프레임 기록 | 다양한 부하와 변경 후 5쌍 A/B 필요. 제공되지 않는 GPU 시간·메모리는 미측정 유지 |

기존 기반:

- [examples 진입점](../examples/main.tsx), [EngineShowcase](../examples/engine/EngineShowcase.tsx), [현재 통계 타입](../examples/engine/types.ts)
- [일반 월드 fixture](../scripts/fixtures/unified-world.tsx), [브라우저 probe](../scripts/probe-unified-world.cjs)
- [후처리 fixture](../scripts/fixtures/rendering-performance.tsx), [브라우저 probe](../scripts/probe-rendering-performance.cjs)
- [CPU runtime benchmark](../scripts/benchmark-runtime.cjs), [문서 명령 benchmark](../scripts/benchmark-scene-commands.cjs)

fixture·단위 테스트의 통과만으로 examples 통합이나 네이티브 GPU 성능을 통과 처리하지 않는다.

## 3. 상태 관리와 공통 완료 조건

요구사항마다 세 상태를 따로 기록한다.

| 상태 축 | 허용 값 | 의미 |
| --- | --- | --- |
| 구현 | 미착수 / 작업 중 / 구현됨 | 실제 수정 코드의 상태 |
| examples | 미연결 / 재현됨 / 수정 검증됨 / 회귀 | 장면 또는 실서비스 호출 기반 검증 상태 |
| 수치 | 미측정 / baseline 있음 / 비교됨 / 기준 충족 / 회귀 / 해당 없음 | 근거 있는 측정·기능 카운터 상태 |

완료는 다음 조건을 모두 만족할 때만 표시한다.

- 실제 `src` 구현을 수정하고 관련 회귀 검사를 통과한다.
- examples에서 동일한 시나리오를 실행할 수 있으며, 기대 동작을 화면에서 확인한다.
- 변경 전후 결과와 소스 식별값·환경·원시 표본을 연결한다.
- 속도 항목은 동일 조건 비교를 통과한다. 정확성 항목은 누락 수·오류 수·활성 리소스 수 등 수치로 통과를 표시한다.
- 변경 항목이 새로운 상태 오염·누수·GPU 오류·화질 회귀를 만들지 않는다.
- 코드 리뷰와 해당 단계의 호환성 검사를 마친다.

미측정은 `null` 및 사유로 저장하고 UI에는 `미측정`으로 표시한다. 미지원은 `미지원`으로 표시하며 0ms나 성공으로 바꾸지 않는다. 차단 상태에는 원인과 다음 조치를 기록한다. 회귀하면 완료 상태를 해제한다.

진행률은 세 가지를 함께 표시한다: 구현 수/전체, examples 통과 수/전체, 최종 검증 완료 수/전체. R01–R31과 기술 검토 T01–T06의 분모를 분리한다. baseline 실행이 실패한 기능 오류도 유효한 실패 baseline이지만, 실패한 실행의 FPS를 성능 비교에 사용하지 않는다.

## 4. 우선순위와 실행 단계

S0 → S1 → S2 → S3 → S4 → S5 → S6 → S7 순서로 코어 개선을 진행한다. S8은 후속 네트워킹 단계다. 독립 작업은 앞당길 수 있지만 검증 의존성을 건너뛰지 않는다.

| 단계 | 우선순위·목적 | 작업 묶음 | 선행 조건 | 종료 기준 |
| --- | --- | --- | --- | --- |
| S0 | P0: 재현·계측 기반 | examples lab, 상태 registry, backend별 통계, 실행 식별값, 결과 저장·비교, 실제 클래스 테스트 | 없음 | 대표 시나리오 8종 실행, baseline 저장·재생·비교, 미측정/미지원 표현, R14·R31 검증 |
| S1 | P0: 기능 오류 수정 | R01·02·06·07·08·10·11, 실패한 플러그인 정리 R24b | S0 실행 기반 | 항목별 실패 재현 → 수정 후 통과. 저장 부분 적용 0, 반복 렌더 루프 0, 재질 불일치 0, 정지 후 활성 BGM 0 |
| S2 | P1: 상태·실행 구조 | R25·26·29, R27의 엔티티 계약, R30의 tick/command 계약 | S1 데이터·ID 안정화 | 두 월드 간 상태 오염 0, clock owner 1/월드, 30/60/144Hz 표시에서 같은 고정 tick 입력의 결과 일치 |
| S3 | P1: 물리·카메라·NPC | R03·04·05·09, 공간 검색 서비스 정리 | S2 월드·시뮬레이션 소유권 | 높은 발판·경사·큰 AABB·카메라 반경·원거리 NPC 장면 통과, collision/AI 비용 계측 |
| S4 | P1: GPU 실행 통합 | R13·17·27·28, 재질별 batching, r186 호환 어댑터 T01·T02 | S2 상태 계약, S3 공간·가시성 기준 | 메인+보조 뷰 누락 0, 지원 장치에서 draw 경로의 동기 CPU readback 0, CPU/GPU 표시 동등성, 반복 해제 통과 |
| S5 | P1: 월드 규모·편집·에셋 | R18·19·20·21·22·23·24a, T04·T05·T06 | S2 변경 추적; GPU 비교는 S4 | 변경 청크만 갱신, 편집 지연·로드·메모리 전후 비교, 리소스 plateau, 다중 미리보기 비용 감소 |
| S6 | P2: 시간 기반 화질 | R15·16, GTAO·TRAA·OIT T01·T03 | S4 리소스·뷰 계약; 에셋 장면은 S5 | 이동·카메라 cut·변형·투명 장면 비교, 화질 승인 및 GPU 비용 측정, 프리셋별 결과 공개 |
| S7 | P1: 코어 통합 완료 | 일반 월드·engine·editor 통합, 모든 선행 항목 회귀, 공개 API·호환성 | S0–S6 | 실제 examples 및 배포 형태의 example build 통과, 지원 조합 검증, 남은 항목과 수치 공개 |
| S8 | 후속: 네트워크·운영 권한 | R12·R30의 실제 권위 서버·인증·복구 연결 | S2 계약, S7 코어 기준선 | 두 브라우저+테스트 서버에서 지연·중복·재접속 검증, 서버 권한 우회 0, 동기화 수치 표시 |

S7은 R12·R30의 후속 운영 구현까지 완료했다는 뜻이 아니다. 코어 완료와 전체 PRD 완료를 구분한다. 운영 관리자 공개가 앞당겨지면 R12도 그 전에 앞당긴다.

### 단계별 구현 경계

- S0에서 모든 버그를 먼저 고치지 않는다. lab과 대표 8종을 만든 뒤, 나머지 재현 시나리오는 각 항목 수정 직전에 추가한다.
- S1의 GPU 재질 수정은 현재 경로의 정확성을 복구한다. GPU 서비스 통합은 S4에서 별도로 수행한다.
- S2에서 canonical entity ID, 내부 슬롯·generation, world ID, tick, command sequence, snapshot revision의 역할을 구분한다. 공개 API는 호환 어댑터를 두고 단계적으로 이전한다.
- S3에서 NPC 시뮬레이션을 컴포넌트 표시 수명에서 분리한다. 원거리 계산 빈도는 낮출 수 있지만 단순 unmount 때문에 권위 있는 상태가 사라지면 안 된다.
- S4의 카메라별 가시성은 메인·보조·그림자를 포함한다. 버전 업그레이드, 배치 변경, 화질 변경은 별도 비교 실행으로 원인을 구분한다.
- S5에서는 dirty 영역·증분 갱신을 먼저 만든 뒤 Worker 이전을 검토한다. 스레드 이동만으로 전체 재계산을 유지하지 않는다.
- S6은 모든 효과를 기본값으로 켜는 단계가 아니다. 성능·균형·화질 프리셋에서 비용과 화질을 검증해 적용한다.
- S8을 위해 core를 브라우저 렌더러 없이 실행할 수 있게 하되, 네트워크 서비스 완성을 S2의 완료로 계산하지 않는다.

## 5. 감사 31개 항목의 추적표

아래 초기 상태는 2026-09-19 감사 이후의 개선 작업 기준이다. `재현`은 감사 중 일회성 실행으로 확인했다는 뜻이며 examples 연결 완료를 뜻하지 않는다. 초기 구현 상태는 모두 미착수, examples는 모두 미연결, 정식 비교 수치는 모두 미측정이다. 작업 시작 시 해당 행에 상태·증거 run ID를 갱신한다.

| ID | 요구사항·주요 코드 | 감사 근거 | 단계 | examples 시나리오 | 완료를 판정할 수치·조건 |
| --- | --- | --- | --- | --- | --- |
| R01 | 안정적인 selector: [시간](../src/core/time/hooks/useGameTime.ts), [인벤토리](../src/core/inventory/hooks/useInventory.ts) | 재현 | S1 | state-hooks | 상태 미변경 안정화 후 render 증가 0, snapshot 경고 0 |
| R02 | 원자적 저장 복원: [SaveSystem](../src/core/save/core/SaveSystem.ts) | 재현 | S1 | save-transaction | 중간 도메인 실패 시 모든 도메인 이전 상태 유지, 부분 적용 0 |
| R03 | 실제 접지 정보: [PhysicsSystem](../src/core/motions/core/system/PhysicsSystem.ts), [연결 계약](physics-grounding.md) | 실제 Rapier·공개 entity 경로 일부 검증, working | S3 | locomotion / entity-grounding | 정상·고지대 발판 landing 후 접지, 공중 오접지 0, 점프·경사 통과 |
| R04 | 최근접 ray·큰 AABB: [WorldSystem](../src/core/world/core/WorldSystem.ts) | 재현 | S3 | spatial-query | 최근접 오선택 0, 범위 밖 hit 0, 큰 AABB 충돌 누락 0 |
| R05 | 카메라 bounds·결과 소유권·반경: [camera](../src/core/camera/utils/camera.ts) | 재현 | S3 | camera-obstacles | 신규 장애물 누락 0, 이전 반환값 변조 0, 반경 침투 0 |
| R06 | GPU 재질 동기화: [GpuBatchBridge](../src/core/rendering/GpuBatchBridge.tsx) | 네이티브 WebGPU 재현 | S1/S4 | gpu-material | 색·roughness·opacity 변경 후 원본/표시 불일치 0, 불필요한 pipeline 재생성 계측 |
| R07 | BGM 정지·로드 경합: [AudioEngine](../src/core/audio/core/AudioEngine.ts) | 재현 | S1 | audio-lifecycle | 정지 후 활성 source 0, 늦게 완료된 이전 곡의 재생 0 |
| R08 | 용량·ID 재사용: [NextWorld](../src/next/core/World.ts) | 재현 | S1 | entity-lifecycle | 0/음수/비정수 용량 정책 검증, 10,000회 슬롯 재사용 후 stale handle 허용 0 |
| R09 | NPC 표시/시뮬레이션 분리: [NPCSystem](../src/core/npc/components/NPCSystem/index.tsx) | 코드 확인 | S3 | npc-distance | 화면 밖 이동 진행, remount 위치 불연속 0, 실제 위치 기반 LOD, AI 시간 p95 |
| R10 | GLTF URL 변경·빈 값·preload: [useGaesupGltf](../src/core/motions/hooks/useGaesupGltf.ts) | 코드 확인 | S1 | asset-switch | A→B 크기 갱신, 빈 URL 파싱 오류 0, preload 후 크기 확인 가능 |
| R11 | 재질 조회/수정 키: [MaterialManager](../src/core/building/core/MaterialManager.ts) | 코드 확인 | S1 | material-editor | 생성→ID 갱신 성공, 공유 재질의 비의도 변경 0 |
| R12 | 운영 관리자 인증: [authStore](../src/admin/store/authStore.ts) | 코드 확인 | S8/운영 공개 전 | authority-admin | 로컬 상태 변조·잘못된 세션으로 보호 API 실행 0 |
| R13 | 뷰별 GPU 가시성: [GpuBatchBridge](../src/core/rendering/GpuBatchBridge.tsx) | 코드 확인 | S4 | gpu-multiview | 메인 밖/보조 안 물체 누락 0, 그림자·피킹 일치 |
| R14 | WebGPU 통계 정규화: [PerformanceCollector](../src/core/perf/PerformanceCollector.tsx) | 코드·네이티브 관찰 | S0 | metrics | render invocation/draw call 분리, backend 참조 카운터와 일치 |
| R15 | AO 합성·노이즈: [WorldPostProcessing](../src/core/rendering/postprocess/WorldPostProcessing.tsx) | 코드 확인 | S6 | temporal-quality | AO 시간 안정성·denoise·조명 합성 비교, 화질 승인, pass GPU ms |
| R16 | 변형 이전 위치·history reset: [weather](../src/core/rendering/tsl/weather.ts) | 코드 확인 | S6 | temporal-motion | weather/변형/cut/re-entry 비교, 잔상 지표, reset 할당·프레임 spike |
| R17 | 버전/내부 API 어댑터: [gpuInstanceBatch](../src/core/rendering/gpuInstanceBatch.ts) | 코드 확인 | S4 | backend-compat | 선언한 지원 조합에서 기능 선택·fallback 이유 표시, 해제 오류 0 |
| R18 | 타일 이웃·청크 갱신: [TileSystem](../src/core/building/components/TileSystem/index.tsx) | 복잡도 확인 | S5 | terrain-edit | 재생성 청크 수, 메싱 p95, 지형·collider 일치 |
| R19 | 증분 내비 장애물: [ObstacleDriver](../src/core/building/components/BuildingNavigationObstacleDriver/index.tsx) | 코드 확인 | S5 | navigation-edit | dirty 셀 수, 갱신 p95, 전량 재계산 참조와 경로 동등성 |
| R20 | 문서 구조 공유·부분 검증: [commands](../src/core/scene-object/commands.ts) | 코드 확인 | S5 | document-edit | 1k/10k 객체 명령 p95, undo/redo·문서 불변성 통과 |
| R21 | 공통 로더·압축·색 공간·캐시: [GLTFAssetCache](../src/core/assets/GLTFAssetCache.ts) | 코드 확인 | S5 | asset-budget | 동일 에셋 경로별 성공, 색 공간 일치, 전송/디코딩/texture 추정 bytes·cache hit |
| R22 | 복제 skeleton 수명: [모델](../src/core/building/components/mesh/model/index.tsx), [캐릭터](../src/core/motions/entities/refs/PhysicsEntity.tsx) | 코드 확인 | S5 | asset-lifecycle | 50회 교체 후 owned skeleton/bone texture 잔존 0, resource plateau |
| R23 | 미리보기 Canvas 공유: [AssetPreviewCanvas](../src/core/assets/components/AssetPreviewCanvas/index.tsx) | 코드 확인 | S5 | asset-gallery | 24/96개 카드에서 Canvas/context 수, idle render 수, hover 응답 p95 |
| R24 | a: 저장 비용, b: 실패해도 전체 종료: [SaveSystem](../src/core/save/core/SaveSystem.ts), [PluginRegistry](../src/core/plugins/PluginRegistry.ts) | 코드 확인 | S1(24b)/S5(24a) | save-lifecycle | serialize/IDB 각각 p95, 저장된 revision, 하나의 dispose 실패 후 미정리 plugin 수 0 |
| R25 | 월드별 서비스·store: [runtime](../src/core/runtime/createGaesupRuntime.ts) | 코드 확인 | S2 | world-isolation | 두 월드의 시간·엔티티·저장·내비 오염 0, 개별 종료 가능 |
| R26 | 단일 clock·실행 단계: [useGameTime](../src/core/time/hooks/useGameTime.ts), [NetworkBridge hook](../src/core/networks/hooks/useNetworkBridge.ts) | 코드 확인 | S2 | tick-determinism | clock owner 1/월드, 중복 소비자 추가 시 tick/알림 증폭 0, 표시 주기별 결과 오차 |
| R27 | core/next 데이터·GPU 서비스 계약: [next backend](../src/next/backend/gpuCulledInstances.ts) | 코드 확인 | S2/S4 | runtime-parity | 동일 명령의 엔티티·transform 결과 일치, 가시 인스턴스 수·draw 인자 검증 |
| R28 | 그래프와 실제 실행/리소스 연결: [RenderGraph](../src/next/core/RenderGraph.ts) | 코드 확인 | S4 | render-lifecycle | 뷰/패스 순서 추적, history·target 소유권, 반복 생성/해제 plateau |
| R29 | 내부 import·초기화·패키지 경계: [index](../src/index.ts), [MultiplayerCanvas](../src/core/networks/components/MultiplayerCanvas.tsx) | 코드 확인 | S2 | package-boundary | 내부→루트 runtime import 순환 제거, 명시적 초기화, headless smoke·초기 로드 bytes |
| R30 | 권위 tick·명령·복구: [contracts](../src/core/networks/adapter/contracts.ts) | 구조 검토 | S2계약/S8실행 | network-recovery | 중복 적용 0, stale snapshot 적용 0, 복구 시간·보정 거리·대역폭 p95 |
| R31 | 운영 구현을 검사하는 테스트: [MessageQueue 테스트](../src/core/networks/core/__tests__/MessageQueue.test.ts), [NPC 테스트](../src/core/networks/core/__tests__/NPCNetworkManager.test.ts) | 코드 확인 | S0 | test-contract | 대상 자체의 복제 구현 검사 제거, 실제 구현 import, 의도적 결함이 검사에 잡힘 |

R24a/b, R27의 계약/실행, R30의 계약/실행처럼 여러 단계인 요구사항은 모든 하위 조건을 만족해야 완료로 집계한다.

## 6. examples 재현 화면 요구사항

구현 경로: `examples/performance/`와 `/performance` 라우트. 수동 UI와 자동 runner가 같은 시나리오 모듈을 가져와 재현·비교한다. 주요 수정은 마지막에 실제 `/engine` 및 일반 월드/editor 동작으로도 확인한다.

필수 화면:

1. 개선 항목 목록: ID, 단계, 구현/examples/수치 상태, 마지막 검증 시각·run ID.
2. 재현 화면: 실제 world/camera/model, 시나리오 설명, 실행·초기화·중지 버튼.
3. 조건: seed, 객체 수, backend, DPR, 해상도, 카메라 경로, 품질 프리셋, 에셋 manifest.
4. 수치: baseline/current/p50/p95/차이/개선율, 각 값의 단위·측정 범위·표본 수.
5. 기능 결과: 기대값, 실제값, 실패 횟수. 실패가 화면이나 카운터에 드러나야 한다.
6. 증거: 비교 run 선택, JSON 내보내기·불러오기, 원시 표본과 화면 캡처 링크.

시나리오 모듈은 `setup → warmup → run → measure → assert → dispose` 수명을 갖는다. 수동 UI와 자동 브라우저 실행이 같은 모듈을 호출한다. 기대 결과를 테스트용 복제 클래스에서 생성하지 않는다. 공간 검색 등 참조 해법은 독립적인 단순 알고리즘을 사용하고 운영 결과와 비교한다.

대표 8종을 S0에서 우선 연결한다:

- `state-hooks`: ErrorBoundary/시간 제한이 있는 격리 영역에서 실제 공개 훅 사용. 오류가 lab 전체를 멈추지 않게 한다.
- `save-transaction`: 실제 SaveSystem과 실패를 주입할 수 있는 도메인. IndexedDB end-to-end 검사는 별도로 포함한다.
- `spatial-query`: 가까운 물체와 먼저 등록한 먼 물체, 큰 AABB를 화면에 표시한다.
- `camera-obstacles`: 신규 메시·좁은 모서리·연속 질의의 위치를 표시한다.
- `gpu-material`: 원본 재질 편집과 GPU 표시를 나란히 검사한다.
- `entity-lifecycle`: 용량/슬롯 재사용과 살아 있는 엔티티 상태를 표시한다.
- `audio-lifecycle`: 사용자 재생 버튼으로 실제 AudioContext를 시작하고 활성 source 수를 표시한다.
- `metrics`: 고정 장면에서 WebGL/WebGPU 카운터를 검증하고 run 결과를 저장한다.

무한 루프·예외·오디오 자동재생 제한 등으로 재현이 불가능한 경우 성공으로 숨기지 않는다. 격리된 실행의 실패와 사유를 기록한다. 수정 전의 위험한 코드를 운영 런타임에 영구 보관하지 않는다. baseline은 소스가 고정된 별도 빌드와 저장된 결과로 비교한다.

## 7. 수치와 비교 프로토콜

### 측정 항목

| 영역 | 필수 지표 | 해석 규칙 |
| --- | --- | --- |
| 프레임 | frame interval p50/p95/p99, FPS, 예산 초과율, long task 수 | FPS 평균만으로 통과하지 않는다. refresh rate·foreground 여부 기록 |
| CPU | simulation, physics, camera, culling submission, mesh build, command, serialization ms | JS 제출 시간은 GPU 실행 시간이 아니다. 함수 경계와 inclusive/exclusive 여부 기록 |
| GPU | 지원 시 전체/패스별 timestamp ms, drawCalls, triangles, visible/submitted instances | 미지원 GPU 시간은 null. render 호출 수와 draw call 수 분리 |
| 데이터 이동 | GPU readback 횟수·bytes, instance upload bytes, dirty instance/chunk/cell 수 | 컬링을 위해 필요한 readback과 진단용 비동기 readback을 구분 |
| 메모리 | 소유한 live resource 수, geometry/texture bytes 추정, 가능한 경우 JS heap, context 수 | 추정값·JS heap을 실제 GPU VRAM이라고 표기하지 않는다 |
| 기능 | mismatch, stale ID 허용, 부분 복원, 침투, 활성 source, 누락 객체 수 | 정상 목표는 0. pass/fail 외에 실제 카운터도 공개 |
| 화질 | 같은 카메라 경로의 영상·프레임, edge/잔상/시간 변동 지표, 수동 승인 | 수치 하나로 좋은 화질이라고 판정하지 않는다. reference와 노출 설정 고정 |
| 네트워크 | RTT/jitter, bytes/s, queue 길이, 중복 적용, 보정 거리, recovery ms | S8 서버 실행과 client simulation을 구분 |

### 비교 조건

- source commit + dirty diff/content hash + untracked manifest, lockfile hash, scenario version, asset manifest hash를 기록한다. 키·토큰·사용자 저장 데이터는 결과에 포함하지 않는다.
- CPU/GPU·OS·브라우저 버전·실행 flags·Three/R3F/React 버전·backend·adapter 정보를 기록한다. 하드웨어 GPU/소프트웨어/미확인을 구분한다.
- 같은 기기·브라우저·해상도·DPR·seed·카메라 경로·객체 수·품질로 baseline/candidate를 실행한다.
- steady-state 측정은 초기 목표로 warmup 10초 이상, 측정 30초 이상, baseline/candidate 5쌍을 번갈아 실행한다. 리소스·셰이더 준비가 끝나지 않으면 warmup을 연장한다.
- 각 실행의 표본과 p50/p95를 남기고, 실행 간 중앙값과 범위를 함께 표시한다. 열·전원·백그라운드 등 환경 변화가 있으면 비교를 무효화한다.
- cold load와 warm steady-state 결과를 분리한다. 여러 기능을 동시에 변경한 결과만으로 특정 최적화의 효과를 주장하지 않는다.
- HUD 갱신은 최대 4Hz이며 측정 조건에 HUD on/off를 기록한다. 계측 자체의 비용도 S0에서 측정한다.
- 프레임을 가로막는 동기 GPU readback을 측정용으로 추가하지 않는다.
- baseline을 선택하지 않았거나 조건이 다르면 개선율은 표시하지 않는다.
- 시간 감소율은 `(baseline - candidate) / baseline × 100`이다. baseline이 0이거나 값이 없으면 비율을 계산하지 않는다.
- 정상 실행뿐 아니라 오류·타임아웃·미지원·중단도 run 결과로 남긴다. 실패 실행을 분모에서 조용히 제거하지 않는다.

### 초기 성능 목표

다음 값은 **측정 결과가 아닌 초기 목표**다. S0에서 기준 장치를 등록하고 workload별 baseline·측정 흔들림을 확인한 뒤 목표표를 고정한다. 결과가 목표에 못 미쳤다는 이유만으로 목표를 소급 완화하지 않는다. 변경이 필요하면 장면·기기·이유와 이전 목표를 기록한다.

| 대상 | 초기 목표·통과 기준 |
| --- | --- |
| 표준 desktop 장면 | 1920×1080, DPR 1, 목표 60fps / 프레임 예산 16.67ms. 브라우저 표시 지연과 CPU/GPU 작업 시간을 분리해서 판정 |
| 표준 mobile 장면 | 기준 실기기에서 목표 30fps / 프레임 예산 33.33ms. desktop emulation 결과를 대체 증거로 사용하지 않음 |
| 병목 최적화 | 목표 CPU/GPU 구간 p95 15% 이상 감소를 초기 목표로 설정. 5쌍 결과의 변동과 함께 유의한 개선인지 확인 |
| 비대상 경로 | 동일 조건 p95 악화 5% 또는 S0에서 고정한 측정 오차 중 큰 값 초과 시 회귀 조사. 데이터·화질 오류는 오차 허용 없이 실패 |
| 편집 응답 | 10k 문서 객체의 단일 수정 main-thread 처리 p95 16.67ms 이하를 초기 목표로 설정. 드래그 preview와 확정 commit 각각 측정 |
| 리소스 해제 | 50회 mount/swap/dispose 뒤 인스턴스 소유 리소스 잔존 0. 마지막 10회는 명시적으로 허용한 공유 캐시를 제외하고 지속 증가 없음 |
| GPU 컬링 경로 | 정상 draw 경로에서 컬링 결과를 CPU로 동기 회수하는 횟수 0. 제출/가시 객체 수는 참조 결과와 일치 |
| 정확성 수정 | 각 시나리오의 mismatch/누락/부분 적용/중복 적용 0 |

부하 단계는 건물 1k/10k/50k, 타일 256/4,096, NPC 100/500/1,000, 문서 1k/10k, 에셋 카드 24/96, 수명 반복 50회로 시작한다. 모든 최대 부하에 같은 FPS를 보장한다는 뜻이 아니다. 표준 목표 부하와 stress 한계를 구분하고 둘 다 결과를 공개한다.

고정 tick 재현은 같은 seed·tick 번호별 입력·물리 설정을 사용한다. 엔티티 수·이벤트 순서·revision은 정확히 일치해야 한다. 위치·회전 등 부동소수 결과의 허용 오차는 시나리오에 명시하며 초기 위치 오차 목표는 1e-4 world unit이다. 다른 물리 버전이나 장치 간 결정성을 이 검사 하나로 보장하지 않는다.

### 저장 결과의 최소 계약

scenario/status registry와 versioned run JSON의 기본 구현이 있으며, 아래 계약의 남은 항목은 후속 시나리오와 함께 확장한다.

```ts
type ImprovementStatus = {
  id: string; // R01 ... R31, T01 ... T06
  stage: string;
  implementation: 'pending' | 'working' | 'implemented';
  example: 'unlinked' | 'reproduced' | 'verified' | 'regressed';
  measurement: 'unmeasured' | 'baseline' | 'compared' | 'passed' | 'regressed' | 'not-applicable';
  baselineRunId: string | null;
  candidateRunId: string | null;
  blocker: string | null;
};
// Run JSON: schemaVersion, runId, requirementIds, sourceIdentity,
// environment, scenario/config/seed/assets, measurementProtocol,
// samples with units and scopes, aggregates, assertions,
// unsupportedReasons, errors, evidence references, status, timestamps.
```

서로 다른 schema/scenario/environment의 결과는 자동으로 같은 비교군에 넣지 않는다. status registry는 최신 검증 run을 참조하고, UI의 진행률도 동일 데이터에서 계산한다. 문서 표와 화면에 숫자를 따로 하드코딩하지 않는다.

S0의 구현 파일 배치는 다음과 같다.

- `examples/performance/requirements.ts`: 요구사항·단계·상태와 증거 run ID의 단일 registry.
- `examples/performance/scenarios/`: 수동 examples와 자동 runner가 함께 사용하는 시나리오.
- `examples/performance/baselines/`: 승인한 baseline의 요약·환경·소스 식별값. 변경 이력을 버전 관리한다.
- `.artifacts/performance/<runId>/`: run JSON, 원시 표본, 로그, 이미지·영상. 큰 원시 산출물은 소스와 분리해 보관한다.
- 브라우저 UI의 JSON 내보내기/불러오기는 같은 schema를 사용한다. artifacts 접근이 안 되면 링크만 있는 완료 항목으로 남기지 않고 증거 확인 불가를 표시한다.

## 8. 감사 중 관찰한 초기 수치

아래는 앞선 대화의 일회성 감사 실행에서 관찰한 값이다. 지속 실행 가능한 시나리오·원시 표본·소스 hash가 함께 보관된 정식 baseline은 아니다. S0/S1에서 재현해 run ID를 부여한다.

| 항목 | 감사 관찰 | 수정 후 기대 |
| --- | --- | --- |
| R01 | 상태 변경 없이 렌더 18회 관찰 후 안전장치로 중단, snapshot 경고 | 안정화 후 추가 render 0, 경고 0 |
| R02 | 복원 실패를 반환했지만 먼저 적용한 도메인은 변경됨 | 부분 적용 0 |
| R03 | y=10 표면에 정지한 입력 60회 갱신 후 grounded=false | 접촉 정보를 반영한 정상 접지 |
| R04 | near 대신 먼저 등록한 far 선택, 실제 AABB overlap=true인데 결과 0개 | nearest 선택, 해당 overlap 검출 1개 |
| R05 | 반환 위치 z=2가 다음 질의 후 z=4로 바뀜 | 이전 반환값 변화 0 |
| R06 | 원본 color=00ff00, GPU color=8b4513 | 색 불일치 0 |
| R07 | URL BGM start 1회 뒤 stopBgm 호출, source.stop 호출 0회 | 활성 source 0, 이전 로드 재생 0 |
| R08 | capacity=0에서 count=1이지만 alive=false; 2,048회 재사용 후 stale ID 재인식 | 입력 검증 및 stale handle 허용 0 |
| R14 | 같은 관찰에서 render.calls=91, frameCalls=17, drawCalls=40 | 정의가 다른 카운터를 구분해 표시 |
| 성능 전체 | 이 프로토콜로 측정한 FPS/p95/GPU ms/메모리 증감 없음 | baseline/candidate 실측값 표시 |

## 9. Web3D 기술 적용 추적

최신 여부를 확인한 조사일은 2026-09-19다. 구현을 시작할 때 대상 릴리스와 문서를 다시 확인한다. 기술 도입만으로 개선 완료를 판정하지 않고 동일한 examples·측정 조건을 적용한다.

| ID | 기술 | 단계·우선순위 | 평가 장면·수치 | 초기 상태 |
| --- | --- | --- | --- | --- |
| T01 | Three.js r186 호환, GTAO 개선, 공개 자원 수명 API 검토 | S4 호환/S6 화질 | 현재 지원 버전별 기능·해제·frame/GPU ms, AO 화질 | 검토 대기 |
| T02 | 동일 형상 instancing + 동일 재질의 상이 형상 batching + GPU indirect | S4 | 건물 부하 단계별 draw/submit/visible/upload/readback/CPU/GPU ms | 기존 indirect 구현 확장 필요 |
| T03 | Weighted Blended OIT | S6 | 교차 투명 물체·날씨의 정렬 오류, GPU ms·추가 target bytes | 비교 실험 대기 |
| T04 | 공통 Meshopt/Draco/KTX2 로더와 텍스처 색 공간 | S5 | 같은 에셋의 전송 bytes·decode·첫 표시·warm cache·texture bytes 추정 | 통합 대기 |
| T05 | 공간 BVH, 청크/HLOD, 후속 GPU occlusion | S3 공간/S5 규모 | 충돌·피킹 p95, 거리별 triangles, 가시성 누락, occlusion 추가 비용 | 단계별 실험 대기 |
| T06 | 공유 Canvas/scissor와 필요할 때 렌더링 | S5 | 카드 수별 context/idle frame/CPU/GPU/hover 지연 | 통합 대기 |

GPU occlusion은 청크·LOD·뷰별 정확성이 확보된 뒤 가려지는 장면에서 비용을 비교한다. OIT는 transmission을 포함한 모든 투명 재질의 해법으로 취급하지 않는다. 기술을 채택하지 않는 결론도 측정 장면·결과·사유를 남기며, 해당 문제를 해결하는 대안과 연결한다.

공식 참고: [r186 release](https://github.com/mrdoob/three.js/releases/tag/r186), [Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide), [GTAO](https://threejs.org/docs/pages/GTAONode.html), [OIT](https://threejs.org/docs/pages/OITPassNode.html), [BatchedMesh](https://threejs.org/docs/pages/BatchedMesh.html), [IndirectStorageBufferAttribute](https://threejs.org/docs/pages/IndirectStorageBufferAttribute.html), [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh), [R3F performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance).

## 10. 첫 작업 단위와 검증 운영

첫 작업은 S0부터 시작한다. PR은 논리적으로 분리하고, 후속 PR의 선행 조건을 명시한다.

1. **S0-A: 계측 계약·통계 수정.** R14, backend adapter, run schema, 소스·환경 fingerprint, 실제 클래스 검사 R31. 종료: 카운터 의미 검증과 JSON round-trip.
2. **S0-B: examples lab·대표 8종·baseline.** `/performance`, 상태 목록, 시나리오 실행/초기화, 전후 결과 불러오기·표시, 같은 시나리오를 쓰는 브라우저 runner. 종료: 기존 오류 재현, 실측 baseline, 화면에서 결과 확인.
3. **S1-A: selector·저장 원자성.** R01·R02를 별도 변경/검증 단위로 수정. 종료: 실패 baseline과 수정 run이 연결되고 examples와 회귀 검사에서 통과.
4. **S1-B 이후:** 엔티티 ID → 오디오·플러그인 종료 → GLTF·재질 API → GPU 재질 동기화 순서. 각 묶음마다 같은 완료 조건을 적용한다.

검증은 해당 변경의 단위/통합 검사, 실제 examples 브라우저 실행, 타입·빌드·공개 패키지 검사를 연결한다. S7에서 저장소의 최종 전체 검증과 실제 example build를 수행한다. 테스트 대상 클래스의 복제 구현으로 통과시키지 않는다.

호환 행렬은 선언된 React 18/R3F 8/Rapier 1 계열과 React 19/R3F 9/Rapier 2 계열, 지원 Three 버전, WebGL fallback과 WebGPU를 구분한다. 모든 Cartesian 조합을 지원한다고 가정하지 않고 지원 조합을 명시한다. r186 추가 시 peer 범위·호환 어댑터·배포 패키지 검사도 함께 갱신한다.

각 작업 결과에는 변경 항목 ID, 상태 세 축, examples 시나리오, baseline/candidate run ID, 주요 수치, 남은 제한을 포함한다. 별도 장문의 결과보고서는 필수로 만들지 않는다. 상태 registry와 재현 가능한 run 결과를 근거로 이 PRD의 진행 상태를 갱신한다.
