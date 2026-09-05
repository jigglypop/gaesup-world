# Save failure protection

## 목표와 범위

- SaveSystem이 직렬화 오류 시 부분 blob을 성공으로 반환/저장하던 동작을 실패로 변경한다. canonical binding/adapter write path와 save schema는 유지한다.
- 필요한 migration 누락, 비진행 migration, 미래/잘못된 version은 hydrate 전 거부한다.
- 기존 도메인 진단은 유지한다. 호출자는 이미 Promise rejection을 처리하는 save 경로를 사용한다.

## 검증 및 완료 조건

- [x] 직렬화 실패 시 기존 슬롯 보존 및 진단 테스트.
- [x] 지원하지 않는 version/migration은 hydrate 호출 전에 실패.
- [x] 저장/runtime/editor 영향 테스트, build 타입 검사와 lint 통과.
- [x] 호환성 변경과 결과를 HARNESS.md에 기록.

## 검증 결과

- 5 suites / 39 tests, build tsc, 변경 ESLint와 diff check 통과.
- createBlob은 AggregateError를 던지고 save는 reject한다. 각 실패 도메인의 기존 진단은 유지한다. schema/export/type signature는 유지하되 기존의 부분 저장 성공 동작은 중단한다.
- 도메인 hydrate 자체가 실패했을 때의 기존 부분 적용/진단 정책은 이번 slice 범위 밖이다. 전체 Jest/browser/package 검증은 후속 통합 검증에 남긴다.
