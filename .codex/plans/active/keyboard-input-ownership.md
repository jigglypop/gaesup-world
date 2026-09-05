# 키보드 입력 소유권

## 목표와 범위

- 동일 InputAdapter를 사용하는 useKeyboard 구독과 화면 버튼의 키 소유권을 추적한다. 입력 상태는 기존 adapter가 소유하고, 각 훅은 일시적인 누름만 소유한다. 마지막 소유자가 해제할 때 false를 전송한다.
- 기존 인자 및 반환 API 유지. 다른 어댑터 객체가 같은 외부 상태를 감싸는 경우와 useKeyboard 밖의 직접 write는 이번 소유권 범위 밖이다.

## 검증 및 완료 조건

- [x] 동일/다른 키 동시 입력, 마지막 소유자 해제, backend 교체와 unmount 검증.
- [x] 설정 변경 재렌더가 누른 키를 취소하지 않는다.
- [x] hook 및 관련 컨트롤러 테스트, 타입 검사, lint 통과.
- [ ] 실제 예제 입력/해제 확인 및 HARNESS 기록.

## 진행

- 창 blur 후 backend는 해제되지만 GamePadButton의 pressed ref와 aria-pressed가 남는 문제를 실패 테스트로 재현했다. 누른 동안에만 blur/visibilitychange를 구독해 로컬 누름을 해제하고, 해제 또는 unmount 시 구독을 제거한다. 실제 useKeyboard와 memory adapter를 연결한 창 포커스 이탈·탭 숨김·다음 누름 테스트를 추가했다. 관련 4 suites 37 tests, build 타입 검사 및 변경 구현 lint 통과. 실제 브라우저 검증은 아직 남아 있다.

- Gamepad.input.test.tsx는 실제 useKeyboard/ownership와 memory InputAdapter를 연결한다. 물리 키+화면 버튼 중첩, pointercancel, 버튼 제거, 게임패드 모드 종료, 남아 있는 컨트롤러의 keyup/unmount를 검증했다(2 tests). 브라우저 이벤트·실제 Rapier까지 포함한 검증은 아니다.
- 최신 production 코드의 test:package와 test:demo 통과. ESM/CJS import 및 패키지 소비자 빌드 확인. 큰 청크 경고는 유지된다. root 타입 검사 통과.

- GamePad의 각 버튼 useKeyboard를 제거하고 부모의 단일 pushKey를 전달한다. 비활성 모드에서는 버튼을 마운트하지 않아 눌린 버튼 상태를 남기지 않는다. 기본 표시 이름은 한글이며 사용자 label override는 유지한다. pointer/mouse 이중 누름, pointercancel, Enter, unmount와 모드 변경 테스트 추가. 관련 3 suites 33 tests, build/root 타입 검사 및 구현 lint 통과. 실제 브라우저 복합 입력 조건은 남아 있다.

- 4 suites 38 tests 통과. 같은 키 복수 소유자, 화면 버튼/물리 키 중첩, 다른 키 및 독립 backend, unmount와 blur를 검증했다. 실제 hook backend 교체 및 브라우저 조합 검증은 남아 있다.
- clearAllKeys는 다른 useKeyboard 소유자가 누른 키를 보존한다. 기존 backend 직접 write의 소유권은 이 추적에 포함되지 않는다. getKeyboard 상태는 기존 backend에서 읽는다.

- 실제 useKeyboard의 backend 교체 시 이전 상태 해제·새 상태 미전이·새 입력 후 unmount 해제 테스트 통과. 동기 구독자의 즉시 해제 요청이 소유권 등록 전 도착해 키가 남는 문제를 실패 테스트로 재현하고, 내부 기록을 먼저 갱신한 뒤 backend를 호출하도록 수정했다. 해제 중 다른 소유자의 동기 획득도 검증했다. 최종 4 suites 41 tests 및 build/root 타입 검사·구현 lint 통과. 브라우저 완료 조건은 여전히 미완료다.
