# Epoch: Save load cancellation

## 목표와 범위

- `SaveSystem.load(slot, signal?)`로 저장 데이터 적용 전 취소를 검사한다. 기존 SaveSystem과 domain binding이 canonical write path이며 source of truth는 바뀌지 않는다.
- `useLoadOnMount`의 슬롯 전환과 unmount는 진행 중인 로드의 상태 적용을 취소한다. adapter의 실제 I/O 중단은 범위 밖이다.
- 기존 signal 없는 호출과 boolean 반환을 유지한다. 취소된 로드는 false를 반환한다.

## 검증

- save 및 managed entity 회귀 테스트, memory 테스트, build/root 타입 검사와 변경 production ESLint
- publicApi/packageExports 및 build:types

## 완료 조건

- [x] 이전 슬롯의 늦은 응답과 unmount 후 응답이 domain을 변경하지 않는다.
- [x] 취소하지 않은 로드와 기존 호출의 호환성이 유지된다.
- [x] 검증 실행·통과, HARNESS.md 기록 append

## 검증 결과

- real SaveSystem과 지연 adapter를 사용하는 hook 테스트에서 슬롯 교체와 unmount 후 응답의 hydrate 및 콜백 미실행을 확인했다. 사전 취소는 adapter read도 실행하지 않는다.
- save/managed hook 5 suites / 58 tests, memory 5 suites / 88 tests, publicApi/packageExports 2 suites / 24 tests 통과. build/root TypeScript, 변경 production ESLint, build:types 및 diff check 통과.
- 초기화 실패 시 useManagedEntity의 cleanup을 실행하고 cleanup 오류보다 원래 초기화 오류를 유지한다. 초기화 성공 경로의 반환과 정리는 기존 동작을 유지한다.
- 저장 schema, adapter contract 및 canonical domain binding은 그대로다. 브라우저 및 package/demo 빌드는 이 slice에서 실행하지 않았다.
- 최종 전체 Jest: 222 suites / 2001 tests 통과, 1 suite/test skip. 완료 조건을 충족해 이 slice만 completed로 이동했다.
