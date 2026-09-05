# Epoch: Town house lifetime

## 목표와 범위

- HousePlot cleanup이 삭제하던 집의 수명을 townStore가 소유한다. registerHouse는 초기 seed, unregisterHouse는 명시적 삭제이며 화면은 저장된 위치와 크기를 표시한다.
- moveOut은 입주 정보만 초기화하고 집 크기를 보존한다. geometry는 R3F 선언적 소유권을 사용한다.
- Save schema와 public exports는 유지한다. 여러 store의 transaction과 renderer 전환은 별도 slice다.

## 검증

- town 도메인 테스트: 기본 크기 렌더, 예약/입주 후 rerender와 remount, hydrate 좌표/크기, 명시적 삭제, moveOut 크기 보존.
- build TypeScript, 변경 production ESLint, test:memory.

## 완료 조건

- [x] 화면 수명과 배열 props 변경으로 저장 상태가 삭제되지 않는다.
- [x] 저장된 위치/크기가 화면과 일치하며 이사 후 크기가 유지된다.
- [x] 검증 실행·통과, 자체 검토, HARNESS.md 기록 append.

## 결과

- town 2 suites / 21 tests, build TypeScript, production ESLint, memory 5 suites / 88 tests 통과.
- 자체 검토: seed는 기존 집을 덮어쓰지 않으며 명시적 삭제 직후 view도 제거된다. Save version 1과 public exports 유지. 부모가 삭제된 집을 다시 seed하는 props 갱신이나 remount는 기존 registerHouse 계약을 따른다.
- R3F test renderer 내부 THREE.Clock deprecation 경고가 있다. 전체 suite, package build, browser/FPS/GPU 검사는 이 slice에서 미실행.
