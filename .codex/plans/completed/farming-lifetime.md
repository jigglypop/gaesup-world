# Farming lifetime and shared clock

## 목표와 범위

- 현재 CropPlot마다 시간 구독이 전체 plot을 tick하고 unmount가 영속 plot을 삭제한다. 목표는 plotStore가 수명을 소유하고 unregisterPlot이 명시적 삭제 경로가 되는 것이다.
- canonical 시간 구독은 acquireFarmingClock 하나다. farming plugin이 runtime 수명 동안 소유하고 standalone CropPlot도 같은 구독을 빌린다. 마지막 소유자가 해제될 때 unsubscribe한다.
- tick은 시간 변경당 전체 plot을 한 번 순회하며 변경이 있을 때만 record를 복제한다.
- 제외: cross-store 트랜잭션, 농사 시각 효과 batching, 여러 독립 world의 store 분리.
- 호환성: CropPlot API/저장 형식 유지. unmount 후 작물 상태를 남기는 의도적 수명 변경이며 삭제는 unregisterPlot으로 요청한다.

## 검증

- 여러 CropPlot/runtime 소유자가 시간 구독 1개를 공유하고 해제 후 정리되는지 확인.
- rerender/unmount/remount 및 runtime만 남은 동안 작물 상태와 성장이 유지되는지 확인.
- 농사/runtime 도메인, build 타입·lint·memory 및 public guard 확인.

## 완료 조건

- [x] 공유 clock ownership과 지속 plot 수명 검증
- [x] 검증 결과와 HARNESS 기록

## 결과

- 21개 CropPlot과 2개 plugin context에서 구독 1개 및 시간 변경당 tick 1회를 확인했다. view unmount 후 runtime에 의한 성장, standalone remount, 마지막 owner의 해제와 명시적 삭제를 검증했다.
- 관련 92 tests, memory 88 tests, 전체 Jest 280 suites / 2557 tests 통과(기존 1 suite / 1 test skip). build 타입·production ESLint·build:types 통과. 테스트 과정의 import 순서 오류를 수정했다.
- 자체 검토: 기존 public API/저장 형식 유지, clock 구독과 plot 영속 수명 분리. 실제 브라우저 FPS/GPU 측정은 하지 않았으며 호출 횟수 검증을 성능 실측으로 대신하지 않는다.
