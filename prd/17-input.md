# PRD-17 입력

| 항목 | 값 |
|---|---|
| 우선순위 | P1 |
| 트랙 | Fast (도메인 내부 확장) |
| 선행 PRD | 11 (input 단계) |
| 관련 active plan | `keyboard-input-ownership` |

## 1. 배경과 문제

- 키보드 입력은 `hooks/useKeyboard`와 `ownership.ts`로 소유권 정리가 되어 있다. blur와 visibilitychange에서 키를 해제한다.
- 입력은 `InteractionSystem.updateKeyboard`, `updateMouse`로 들어가고 zustand `interaction` 슬라이스와 `useInteractionSystem` 상태에 복제된다(`interactions/stores/slices.ts:139`).
- `project-settings.input`에 `bindings: Record<string, ProjectInputBinding[]>`, `gamepad`, `touchControls`, `pointerLock` 스키마가 있지만 런타임이 이것을 읽지 않는다.
- 게임패드, 터치 조이스틱, 리바인딩 UI, 입력 기록·재생이 없다. `input` 도메인에는 테스트가 없다.
- `useInteractionSystem.ts:29-33`은 입력 변화마다 새 객체로 setState를 호출해 React 재렌더를 만든다.

## 2. 목표 / 비목표

### 목표
1. 액션 맵: 게임 코드는 키가 아니라 액션(`move`, `jump`, `run`, `interact`)을 읽는다.
2. 디바이스 백엔드: 키보드, 마우스, 게임패드, 터치.
3. `project-settings.input.bindings`가 런타임의 원본이다.
4. 리바인딩 UI와 저장.
5. 입력 기록·재생: 테스트와 버그 재현에 쓴다.

### 비목표
- VR 컨트롤러(WebXR). P3.

## 3. 요구사항

| ID | 요구사항 |
|---|---|
| FR-1 | 액션 타입: button(pressed, down, up), axis1D, axis2D |
| FR-2 | 바인딩: 디바이스, 코드, scale, 합성(WASD → axis2D), 데드존 |
| FR-3 | `input` 단계에서 모든 디바이스를 폴링하고 액션 값을 계산. 게임패드는 Gamepad API 폴링 |
| FR-4 | 터치: 가상 조이스틱과 버튼 컴포넌트, `touchControls` 설정으로 표시 |
| FR-5 | 입력 컨텍스트(gameplay, ui, editor) 스택. 상위 컨텍스트가 액션을 소비하면 하위에 전달 안 함. 기존 키보드 소유권을 이 모델로 흡수 |
| FR-6 | 리바인딩 API와 UI, 충돌 감지, project-settings에 저장 |
| FR-7 | 기록: 프레임 번호별 액션 값 스트림 저장. 재생: 디바이스 대신 스트림에서 공급 |
| FR-8 | 스크립트 API `ctx.input.action('jump').down` |
| NFR-1 | 액션 평가 프레임당 할당 0 |
| NFR-2 | React 재렌더 없음. React가 필요하면 선택자 구독으로 필요한 액션만 |

## 4. 설계

```
src/core/input/
  core/
    actions.ts        액션 정의와 값 버퍼
    bindings.ts       project-settings 바인딩 → 평가기
    devices/keyboard.ts, mouse.ts, gamepad.ts, touch.ts
    contexts.ts       컨텍스트 스택 (keyboard ownership 흡수)
    recorder.ts       기록·재생
  react/
    TouchControls/, RebindPanel/
```

- `InteractionSystem`은 액션 값을 읽는 소비자가 된다. 키 코드를 직접 다루지 않는다.
- zustand `interaction` 슬라이스로의 매 입력 복제는 UI 표시가 필요한 필드만 남긴다.

## 5. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 17-a | 액션 코어와 키보드·마우스 백엔드, 기본 바인딩 | 단위 테스트 (input 도메인 첫 테스트) |
| 17-b | `InteractionSystem`을 액션 소비자로 전환 | interactions 테스트 |
| 17-c | 컨텍스트 스택, 키보드 소유권 흡수 | 에디터 입력과 게임 입력 충돌 테스트 |
| 17-d | 게임패드 | Gamepad API mock 테스트 |
| 17-e | 터치 조이스틱 | 모바일 브라우저 테스트 |
| 17-f | 리바인딩 UI와 저장 | 에디터 테스트 |
| 17-g | 기록·재생, 브라우저 E2E에서 사용 | 재생으로 캐릭터 이동 경로 재현 |

## 6. 공개 API 영향

- 추가: `defineInputActions`, `useInputAction`, `TouchControls`, `RebindPanel`, `inputRecorder`.
- `useKeyboard`는 유지하되 내부를 액션 코어로 교체.

## 7. 검증과 완료 기준

- input 테스트 신설, interactions, motions 테스트
- 브라우저: 키보드, 게임패드(mock), 터치 에뮬레이션

## 8. 열린 질문

1. 기록 포맷을 저장본과 함께 공유(버그 리포트 첨부)할지.

## 구현 현황 (2026-09-23, 2차)

| Slice | 상태 | 내용 |
|---|---|---|
| 17-a | 완료 | `input/actions`: `InputActionMap`(button, axis1D, axis2D, 데드존, down/up 프레임), 기본 액션(move, jump, run, interact: 키보드·게임패드·터치), 브라우저 디바이스 수집기 |
| 17-d | 완료 | Gamepad API 폴링(`button:n`, `axis:n`) |
| 17-g | 완료 | `InputRecorder`, `InputReplay` |
| 추가 | 완료 | `inputActionsFromProjectSettings`, `useInputActions`(`input` 단계) |
| 17-b, 17-c, 17-e, 17-f | 미착수 | `InteractionSystem` 전환, 컨텍스트 스택, 리바인딩 UI |

검증: 타입체크(src, examples)와 변경 파일 린트 통과. 새 테스트는 메모리 제약으로 실행하지 않았다.
