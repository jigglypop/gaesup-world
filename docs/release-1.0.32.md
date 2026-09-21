# gaesup-world 1.0.32

Runtime performance PRD의 중간 릴리스다. 현재 구현과 검증을 통과한 코어 변경을 제공하며, PRD 전체 성능 목표의 최종 인수를 뜻하지 않는다.

## 코어 변경

- `WorldPhysics`가 물리 조작, Rapier 적분, 네트워크 갱신을 runtime의 고정 clock에 연결한다. 화면 보간은 시각 객체에 적용하고 collider는 물리 자세를 유지한다. [사용법](world-physics-clock.md)
- NPC 이동과 AI를 React 마운트와 화면 LOD에서 분리했다. 화면 밖에서도 진행하며, 다시 표시하거나 저장할 때 현재 시뮬레이션 자세를 사용한다. `runtime.npcSimulation`으로 현재 자세와 저장용 복사본을 조회할 수 있다.
- NPC 감지는 기존 공간 grid를 재사용하고, 같은 결정 주기의 관측 결과를 store에 한 번에 반영한다.
- 물리 접지는 소유 Rapier world의 실제 접촉을 사용한다. 경사, 점프, 제거된 body와 다른 world의 body 처리를 보완했다. 직접 `PhysicsSystem`을 사용하는 코드는 `physicsWorld`를 전달해야 한다. [접지 연결](physics-grounding.md)
- 월드 공간 질의와 카메라 충돌 탐색을 개선하고, 반복 작업의 임시 객체 할당을 줄였다.
- 네트워크의 clock 소유권과 runtime 종료·재개 처리를 정리했다. 저장 복원 중 이전 gameplay 실행과 효과가 새 상태를 덮어쓰지 않도록 보호했다.
- 브라우저 RAF가 없는 환경에서도 runtime을 생성하고 수동 고정 tick으로 NPC를 진행할 수 있다.

## 호환성과 검증

기존 Rapier `Physics`를 직접 사용하는 화면은 기존 프레임 경로를 유지한다. 새 고정 clock 경로는 `WorldPhysics`를 통해 사용한다. 공개 ESM/CJS 진입점과 React 18/19, R3F 8/9 소비자 검증을 유지한다.

배포 준비 시 전체 Jest 349 suites / 2,975 tests, 별도 메모리 88 tests, lint, 패키지 빌드, publint, 새 설치 소비자 및 showcase 빌드 검증을 통과했다. NPC 화면 밖 이동·재마운트와 실제 Rapier clock 동등성은 WebGL 및 네이티브 WebGPU에서 확인했다. 전체 부하의 성능 개선율과 모바일 실기기 인수는 진행 중이다.

`examples/`의 미니홈피 편집·마을·카메라·진단 개선은 저장소 예제에 포함된다. npm 패키지는 빌드된 라이브러리와 공개 자산을 제공하며, 예제 웹사이트의 배포 상태는 별도로 확인해야 한다.

## English

This interim runtime release adds shared fixed-clock physics, presentation-only interpolation, offscreen NPC simulation, indexed NPC perception and batched observation updates. It also improves ground-contact validation, spatial and camera queries, network ownership, and save/restore cancellation. Headless consumers can advance NPC simulation manually without a browser RAF.

Use `WorldPhysics` to opt into fixed-clock physics. Existing direct Rapier `Physics` consumers retain their frame path. Direct physics-system integrations must supply the owning `physicsWorld`. Full PRD performance acceptance and physical mobile-device measurements remain in progress.
