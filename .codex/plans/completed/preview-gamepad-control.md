# 미리보기 화면 게임패드 연결

## 목표와 범위

- enableGamepad를 미리보기의 GamePad 및 임시 controller 모드에 연결한다. canonical 입력 상태는 기존 InputAdapter에 유지한다.
- useKeyboard의 선택적 다섯 번째 인자로 물리 키 구독을 분리한다. 기본값 true로 기존 호출을 보존하고 GamePad는 false로 호출한다.
- 미리보기 종료 시 기존 controller 모드를 복원한다. 물리 게임 컨트롤러 장치 지원은 이 화면 버튼과 별개다.

## 검증

- 미리보기, GamePad, useKeyboard 테스트 및 build/root 타입 검사, 변경 구현 lint.
- publicApi/packageExports 가드 및 실제 미리보기 브라우저 입력.

## 완료 조건

- [x] 키보드 비활성 상태에서 화면 버튼만 동작한다.
- [x] 게임패드 설정 변경과 미리보기 종료 시 누름 해제 및 기존 모드 복원.
- [x] 화면 크기에 맞는 배치와 실제 브라우저 입력 검증, HARNESS 기록.

## 진행

- 실제 1440x900 및 390x844 브라우저에서 화면 버튼 단독, 물리 키/화면 버튼 양방향 해제 순서, 전체 해제, 게임패드 끄기/재진입 검증 통과. 입력 유지 시 500ms 약 2.44~2.52 이동, 전체 해제 시 0. 페이지·콘솔 오류 없음. 작은 화면의 초기 실패는 스크립트가 화면 밖 좌표를 누른 원인이며 버튼 스크롤 후 해결했다.
- 캡처에서 버튼이 캐릭터를 가리는 문제를 확인해 Canvas/버튼/정보를 grid의 별도 행으로 배치했다. 모바일 게임패드 미리보기 높이 440px. 수정 후 양쪽 화면 검사 통과 및 캡처 직접 확인. 데스크톱에서 Canvas와 버튼 영역 비중첩, 모든 버튼 44px 이상과 가로 화면 경계도 검사했다. TEMP/gaesup-gamepad-{browser,compact}.log.
- 자체 검토: 기존 InputAdapter ownership 유지, listenToKeyboard 기본값 true, GamePad의 물리 키 구독 제거는 의도한 동작. 리스너 해제 및 StrictMode 모드 복원은 단위 테스트로 확인했다. 물리 컨트롤러 장치, 전체 현대화 및 native WebGPU 완료를 뜻하지 않는다.

- BlueprintPreview에서 enableGamepad에 따라 GamePad를 표시하고 임시 controller 모드를 적용·복원한다. 버튼은 미리보기 안에서 줄바꿈하며 48px 크기로 배치한다. 실제 화면 배치는 미검증이다.
- useKeyboard 선택적 다섯 번째 인자 listenToKeyboard(default true) 추가. GamePad는 false를 전달해 물리 키 구독을 제거하면서 pushKey와 blur/visibility 해제를 유지한다. 런타임에 인자를 false로 바꾸면 물리 키 소유권만 해제한다.
- 미리보기/GamePad/keyboard 및 publicApi/packageExports 7 suites 72 tests, build 타입 검사 및 변경 구현 lint 통과. 브라우저 검증 후에만 완료 조건을 닫는다.
