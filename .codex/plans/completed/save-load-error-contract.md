# Epoch: Save load error contract

## 목표와 범위

- SaveSystem 복원 실패와 LocalStorage IO 실패를 호출부로 전달한다. source of truth는 기존 domain store와 SaveSystem binding으로 유지한다.
- 복원은 다른 도메인을 계속 처리하고 진단을 전달한 뒤 AggregateError를 던진다. 성공 true / 슬롯 없음 false 계약을 유지한다. 부분 복원 rollback은 제공하지 않는다.
- WorldSystems의 기존 load 성공 후 autosave 활성화 경로를 사용한다. 수동 save를 전역 차단하는 새 상태는 도입하지 않는다.

## 검증

- save, scene-object saveBinding, runtime, WorldSystems lifecycle 테스트
- build/root 타입 검사, 변경 파일 lint, publicApi/packageExports

## 완료 조건

- [x] 복원 실패가 reject되어 자동 저장 준비 상태로 진입하지 않는다.
- [x] LocalStorage 실패와 빈 슬롯을 구분하고 정상 왕복을 유지한다.
- [x] 검증 실행·통과, HARNESS.md 기록 append

## 결과

- 10 suites / 80 tests 통과. 실제 SaveSystem과 useAutoSave를 사용하는 WorldSystems 테스트에서 hydrate 실패 후 120초 및 beforeunload에도 write가 호출되지 않음을 확인했다.
- build/root 타입 검사, build:types, production 변경 파일 ESLint, diff --check 통과. 테스트 파일 4개는 저장소 ESLint ignore 대상이다.
- 자체 검토: 정상 domain hydrate와 diagnostic 전달은 계속 수행된다. false는 슬롯 없음만 의미한다. 실패 복원의 rollback 및 수동 save 차단은 없다. LocalStorage를 사용할 수 없는 환경도 이제 reject한다.
- 전체 Jest, 브라우저, demo/package 검증은 이번 slice에서 미실행. 전체 examples/renderer 목표는 계속 active다.
