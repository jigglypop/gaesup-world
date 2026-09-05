# Epoch: Automation execution ownership

## 공유 입력 이동 소유권 보완

- 같은 입력 상태를 사용하는 브리지 사이에서 마지막 자동 이동 요청이 소유권을 갖는다. 목적지 좌표가 같아도 이전 자동화는 취소하며 이전 브리지 정리가 새 이동을 중지하지 않는다.
- 입력 상태 객체를 키로 한 WeakMap으로 실행 중 소유권만 관리한다. 저장 모델과 공개 API는 변경하지 않는다. 정지·도착·취소·dispose에서 소유권을 해제한다.
- 동일/다른 목표의 소유권 교체, 이전 브리지 dispose, 새 소유자의 도착, 독립 입력의 기존 동작과 재진입을 검증한다.
- 동일 목표에서 이전 자동화가 실행 중으로 남는 회귀를 먼저 재현했다. 수정 후 동일/다른 목표, 중지 listener에서 세 번째 이동을 시작하는 재진입, 하나의 엔진을 두 브리지가 공유하는 projection 교체를 실제 엔진 테스트로 검증했다. 공유 엔진 자체는 취소하지 않는다.
- 최종 interactions 10 suites / 148 tests, build 타입 검사 및 production lint 통과. memory 88 tests 통과. 브라우저 반복/복수 입력의 실제 물리 검증은 남아 있으며 epoch는 active다.

## 목표와 범위

- 자동화 큐를 실행하는 canonical 경로를 하나로 통합한다. 현재 store slice는 actions/isRunning/isPaused를 관리하고, AutomationSystem은 독립 큐를 실행하며, DirectionComponent도 store 큐를 직접 shift한다.
- 현재의 Bridge → AutomationSystem 명령 경로를 기준으로 store API 호환성과 진행 상태 projection을 조사하고 연결한다. 이동 코드에서는 입력 projection만 수행한다. 목표 위치 도착 여부와 wait 완료를 명시적으로 구분한다.
- moveRequested는 InteractionBridge의 moveTo로 연결되어 있다. 현재 AutomationSystem의 move는 도착을 기다리지 않고 이벤트 발행만으로 완료되므로 이 동작까지 테스트해야 한다.
- DirectionComponent.handleClicker의 wait clock.stop/start 분기는 상위 handleMouseDirection이 같은 nonempty queue 조건을 먼저 소비하여 일반 호출 경로에서는 도달할 수 없다. 단순 per-character timer 교체는 실제 실행 문제를 해결하지 못한다.
- 전역 렌더러 clock을 정지하지 않는다. pause/resume/stop, 반복, 큐 교체, unmount/dispose 및 복수 캐릭터의 ownership을 검증한다.

## 검증

- interactions core/bridge/store, motions, navigation 테스트 및 build/root 타입 검사
- publicApi/packageExports, examples에서 move → wait → move 및 pause/resume 확인

## 완료 조건

- [x] store와 전역 bridge 명령이 같은 실행 경로를 사용한다.
- [x] 목표 도착 전 큐를 소모하지 않고 대기·일시정지를 적용한다.
- [x] 전역 clock 의존 및 중복 실행 경로를 제거한다.
- [ ] 기존 API 호환성, examples 시나리오, lifetime 검증 및 HARNESS 기록

## 독립적으로 완료한 이동 경로 개선

- DirectionComponent의 동일한 waypoint/angle/run 상태 입력 재발행을 생략했다. 큐 소비나 실행 주체는 바꾸지 않았다.
- 120회 동일 프레임 갱신에서 setMouseInput 추가 호출 0회, waypoint 전환/위치 이탈/run 변경 반영 테스트 통과. FPS 개선 수치는 측정하지 않았다.

## 실행 통합 진행

- defaultAutomation이 전역 엔진을 소유한다. store action과 InteractionBridge.getGlobal은 같은 엔진을 사용하며 stateChanged 이벤트가 store projection을 갱신한다. 독립 Bridge/AutomationSystem은 기존 인스턴스 격리를 유지한다.
- DirectionComponent에서 큐 shift, 미사용 memo 갱신과 clock.stop/start 타이머를 제거했다. 입력 타깃에서 현재 위치에 맞춰 방향을 계산한다.
- default 엔진은 이동 종료 입력을 기다린다. Bridge가 moveTo를 입력에 적용하며 pause/stop/dispose는 자신이 시작한 자동 이동만 비활성화한다. clearQueue는 진행 중 실행도 취소한다.
- standalone AutomationSystem은 기존 즉시 moveRequested 완료를 기본값으로 유지한다. constructor의 waitForMovementCompletion=true는 입력 종료와 completeMovement 연결이 있는 경우 사용한다.
- move → wait → move, pause/resume, clear 중 취소, 전역 dispose 후 재생성, store/bridge 큐 혼용 테스트 통과. 실제 examples 물리 이동, 반복·복수 캐릭터·수동 입력 취소 의미 검증은 남아 있으므로 epoch는 active다.

## 실제 examples 검증

- /automation을 개발자 메뉴에 추가했다. WorldPage의 runtime 내부 overlay와 Canvas 내부 probe를 사용하며, 북쪽 들판 이동 후 4m 이동 → 2초 대기 → 복귀를 실행한다.
- 초기 World 로드 완료와 실제 지면 상태를 확인한 뒤 실행한다. DOM 패널에서 Canvas 전용 훅을 호출하거나 runtime 밖에서 teleport를 호출하지 않는다.
- Chromium: 북쪽 들판 X36에서 실행, 일시정지 X39.37에서 600ms 위치 유지, 재개 후 3개 동작 완료 및 X36.93에서 정지. 기존 목표 도착 반경 1m를 유지한다. 일시정지는 짧은 경로의 타이밍 경합을 피하기 위해 DOM 버튼 click과 timer로 유발했고 재개는 Playwright 클릭으로 수행했다.
- 390x844 화면 패널 x8/y120/width374, 가로 넘침 없음, pageerror 0. 스크린샷은 시스템 임시 폴더 gaesup-automation-mobile.png.
- 브라우저에서 발견한 종료 후 관성 이동을 수정했다. mouse 입력 활성→비활성 시 수평 속도를 한 번 제동하고 수직 속도와 계속되는 키보드 이동은 유지한다. 실제 물리 재검증과 회귀 테스트 통과.
- 입력/물리 28 suites / 261 tests, examples 관련 3 suites / 12 tests, route/consumer 2 suites / 20 tests 통과. build/root 타입 검사 및 변경 production lint 통과. 마지막 전체 Jest는 이 slice 이전 1977 tests 통과이며 이번에는 전체를 다시 실행하지 않았다.
- 반복·복수 캐릭터·수동 입력 취소와 다른 runtime의 자동화 ownership 검증은 계속 남아 있어 epoch는 active다.

## 도착·취소·실패 계약 보완

- 검토에서 재현한 입력 종료의 성공 오인, 이동 timeout 미작동, 1m 고정 도착 반경과 waypointThreshold 충돌을 수정했다.
- 실행 source of truth는 기존 default AutomationSystem이다. MouseState.hasArrived를 선택 필드로 추가해 물리 도착을 명시한다. moveTo는 false로 초기화하고 DirectionComponent는 실제 도착 시 true와 비활성 입력을 함께 발행한다. 단순 입력 중단은 취소이며 다른 목표로의 입력 교체는 자동화만 중지하고 새 입력을 유지한다.
- 호환성: MouseState 기존 생성 코드는 유지된다. 도착 대기 모드를 사용하는 custom input integration은 종료 입력에 hasArrived: true를 제공하거나 엔진의 completeMovement를 호출해야 한다. 독립 AutomationSystem의 기본 즉시 완료 모드는 유지된다.
- 이동은 timeoutDuration을 적용하고 기존 maxRetries/retryDelay 정책을 따른다. actionError에서 자동 이동 입력을 중지한다. pause/stop/reset/dispose와 도착은 대기 timer를 정리한다.
- 경로가 남아 있으면 waypoint 소비 함수만 도착을 판정한다. 직접 이동의 기존 1m 반경은 유지한다. 경로 종료 프레임에서도 방향 벡터를 비운다.
- 예제 완료 횟수를 실행마다 계산하고 준비·중지·완료·실패 및 재시도 안내를 한글로 표시한다. 재시도 후 성공한 경우 실패 안내를 지운다.
- Chromium 실제 /automation: 연속 두 번 실행 모두 완료한 동작 3개, 최종 X36.87과 X37.67. 각 실행의 시작점으로부터 기존 1m 반경에 정지했다. 100ms/1ms timeout만으로 실패를 유발하려던 두 검증은 실제 재시도 후 도착하여 실패 대기 조건이 시간 초과했다. UI 실패를 증명한 것으로 계산하지 않았다.
- 별도 격리 브라우저에서 queued move 목표를 X100000으로 주입하고 timeout/retry 100ms를 설정했다. 이동 두 개는 각각 4회 실패하고 wait 한 개만 완료했다. 한글 실패 안내와 390x844 화면의 패널 x8/y120/width374/height295.98을 확인했다. 스크린샷: 시스템 임시 폴더 gaesup-automation-result-mobile.png. 이 검증은 기본 예제 목표를 바꾸지 않는 테스트 fixture다.
- 검증: 관련 36 suites / 348 tests, 전체 Jest 221 suites / 1991 tests 통과(1 suite/test skip). memory 5 suites / 86 tests 통과. build/root 타입 검사, 변경 production ESLint, publicApi/packageExports, build:types 및 diff check 통과. test:demo/test:package/native WebGPU 실측은 이번 slice에서 실행하지 않았다.
- 복수 runtime/캐릭터 ownership과 루프 실행 감사, renderer 현대화 및 전체 제품 UI 감사가 남아 있으므로 목표와 epoch는 active다.

## 반복 실행 재시도 감사

- 재시도 횟수를 caller 소유 action.data에서 엔진 내부 actionRetryCount로 이동했다. 성공 또는 재시도 소진 후 다음 액션/반복은 새 한도를 사용하고 pause/resume은 진행 중인 한도를 유지한다. 새 start는 새 한도를 사용한다.
- action.data.retryCount는 더 이상 엔진 bookkeeping 필드가 아니다. caller payload를 그대로 보존하며 기존 maxRetries/retryDelay 설정과 총 시도 횟수는 유지한다.
- 성공 후 반복, 실패 소진 후 반복, caller payload 보존 테스트를 추가했다. 기존 pause/resume과 기본 재시도 횟수 테스트도 통과했다. interactions/networks 27 suites / 364 tests 통과.
- 복수 runtime/캐릭터 ownership 및 실제 브라우저 루프 실행은 남아 있다.

## Bridge의 borrowed engine 수명 slice

- 두 브리지가 같은 InteractionSystem을 주입받은 상태에서 한쪽 dispose가 공유 시스템을 해제하고, 주입된 AutomationSystem의 진행 중 wait까지 취소하는 회귀 테스트 2개가 실패했다.
- 입력 시스템은 주입 또는 default resolver에서 빌려오며 브리지가 생성하지 않는다. 브리지 dispose는 자체 listener/timer와 직접 생성한 automation만 정리한다. 주입된 automation은 호출자가 해제한다. 전역 default automation은 disposeGlobal에서 명시적으로 해제해 기존 store projection 재생성 계약을 유지한다.
- 완료 조건: 공유 입력의 listener 유지, 주입 자동화의 실행 유지, 자체 자동화 해제, 전역 dispose 후 재생성 및 기존 도메인·공개 API·memory 검증. 저장 상태/source of truth는 바꾸지 않는다. 복수 브리지가 동시에 같은 이동 목표를 실행하는 authority 문제는 별도 미완료 항목이다.
- 위 수명 slice 검증 완료: 실제 회귀 2개 실패 후 수정, interactions/API/export 167 tests, memory 88 tests 및 전체 Jest 2,013 tests 통과(1 skip). 타입·린트·declaration 빌드 통과. 외부 주입 엔진은 이제 호출자가 명시적으로 dispose해야 한다. 이 검증으로 전체 multi-runtime 이동 authority나 automation epoch를 완료 처리하지 않는다.

### 독립 입력·자동화 반복 실행 검증

- 실제 InteractionSystem/AutomationSystem(true)/InteractionBridge 두 쌍으로 독립 입력 경로를 검증했다. A의 pause는 A 입력만 정지하고 B는 도착을 반영해 다음 반복을 시작한다. A의 resume 후 bridge 및 소유 엔진을 해제해도 B 입력은 활성 상태로 유지된다. B는 두 번째 도착을 기록하고 다시 반복하며 stop 후 timer 0이다.
- 이 검증은 fake timer를 사용한 실제 엔진 통합이며 Rapier/browser 물리 증거는 아니다. 공유된 하나의 입력을 두 엔진이 동시에 조종하는 경우의 arbitration 및 실제 브라우저 반복 실행은 계속 미완료다. 독립 인스턴스 통합에서 생산 코드 수정은 필요하지 않았다.
