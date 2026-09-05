# 미리보기 키보드 설정 연결

## 목표와 범위

- Blueprint controls.enableKeyboard를 GaesupController의 선택적 enableKeyboard prop으로 전달한다. EntityController가 키보드 구독을 소유하며 미리보기의 중복 구독은 제거한다. 기존 InputAdapter가 입력 상태의 source of truth다.
- useKeyboard 기존 인자를 유지하고 네 번째 enabled 인자를 추가한다. 기본값 true로 기존 소비자 동작을 유지한다. 키보드 해제 시 복수 입력 소유권 정리는 후속 slice다.

## 검증

- keyboard/preview/controller 테스트, build/root 타입 검사와 변경 구현 ESLint.
- publicApi/packageExports 가드.

## 완료 조건

- [x] 꺼짐에서 물리 키와 직접 pushKey가 차단되고 다시 켜면 입력 가능하다.
- [x] 미리보기 설정이 EntityController에 전달되며 중복 구독이 없다.
- [x] 단위 검증 통과 및 HARNESS 기록.
- [x] 실제 예제 브라우저에서 켜짐/꺼짐 전환에 따른 이동을 확인한다.

## 검증 결과와 자체 검토

- 5 suites 56 tests, build/root 타입 검사, 변경 구현 ESLint 및 publicApi/packageExports 통과.
- 실제 /blueprints의 키보드 사용 버튼을 true → false → true로 전환하고 D 키를 500ms씩 입력했다. 기존 useGenericRefs의 body ref를 테스트 응답에서만 노출해 실제 Rapier 위치를 읽었다. 수평 이동 5.0417 → 0 → 5.0643, pageerror 0. probe 정상 종료 및 Node syntax 통과.
- 기존 InputAdapter 상태 경로와 기본 켜짐 호환성 유지. 새 export/subpath 없음. unmount 및 복수 컨트롤러 입력 소유권은 범위 외이며 미완료로 유지한다.
- 스크린샷에서 이동한 캐릭터가 화면 밖에 있어 미리보기 카메라 추적 후속 검토가 필요하다. 전체 목표 완료를 의미하지 않는다. 전체 스위트·package/demo 재빌드는 이번 slice에서 미실행.
