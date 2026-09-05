# Architecture

## 제품 방향

Gaesup World의 목표는 Blender 기반 asset authoring, persistent world model, R3F와 Three.js projection, Rapier physics, data-oriented rendering, world creator, multiplayer와 social interaction을 하나의 3D social world platform으로 연결하는 것이다.

## 목표 계층

```text
Experience
  House | Town | Creator | Social | Gameplay
World Model
  WorldDocument | Entity | Component | Prefab | Command | Event | Query | Migration
Simulation
  Clock | Input | Movement | Interaction | Animation | Physics Coordination | Spatial
Projection
  Render | Physics | Network | Editor
Platform
  Persistence | Storage | Auth | Transport | Browser Capability | Assets
```

React는 experience와 projection integration을 담당한다. canonical world state와 authoritative simulation state를 소유하지 않는다.

## 현재 저장소 지도

- `src/core/runtime`, `src/core/plugins`: runtime 조합, plugin registry, service 배선
- `src/core/save`, `src/core/world`: save binding, world runtime과 persistence
- `src/core/building/model`: grid, placement, cell과 edge 좌표
- `src/core/building/render`, `visibility`: typed array, snapshot, dirty range, upload plan, culling
- `src/core/networks`: adapter, authority contract, queue, connection pool, visit 흐름
- `src/core/assets`: asset record, catalog, preview와 seed asset
- `src/next`: data-oriented world, task graph, render graph, WebGPU backend 실험
- `src/blueprints`: blueprint runtime, registry, factory와 editor
- `examples`: 공개 패키지 소비자, 통합 하네스, 제품 showcase

## 현재 source of truth

현재는 도메인별 store와 system이 도메인 단위로 상태를 소유한다. runtime plugin과 SaveSystem이 그 store들을 바인딩한다. building placement와 render index는 보존 가치가 높은 특화 자산이다. editor, runtime, persistence, networking을 관통하는 canonical WorldDocument는 아직 없다.

## 목표 source of truth

자동화 실행은 전역 InteractionBridge와 store 명령이 공유하는 default AutomationSystem을 canonical 경로로 사용한다. store.automation은 엔진 이벤트로 갱신되는 projection이며, DirectionComponent는 큐를 소비하지 않는다. default 엔진은 hasArrived가 명시된 이동 입력 종료 또는 completeMovement를 도착으로 처리한다. 단순 입력 종료와 목표 교체는 취소이며 timeoutDuration 초과는 기존 재시도 정책을 따른다. 독립 생성 AutomationSystem의 기존 이벤트 발행 후 완료 방식은 기본값으로 유지하며 constructor의 waitForMovementCompletion으로 opt-in한다. examples의 이동·재시도·실패 실측은 완료했고, 복수 runtime/캐릭터 입력 소유권과 루프 감사는 active automation-execution plan에 남아 있다.

persistent world mutation은 최종적으로 하나의 versioned WorldDocument command 경로를 통과한다. simulation, render, physics, network, editor는 projection이 된다. 이것은 목표 계약이지 저장소 전체 재작성의 허가가 아니다.

## Migration 규칙

집의 영속 수명은 townStore가 소유한다. HousePlot은 registerHouse로 누락된 집을 seed하고 저장된 위치·크기·입주 상태를 표시한다. 화면 unmount는 삭제하지 않으며 unregisterHouse가 명시적 삭제 경로다. moveOut은 집 크기를 보존한다. 화면 geometry는 R3F 선언적 자식으로 생성·해제한다.

농사 plot의 수명은 plotStore가 소유한다. CropPlot unmount는 plot을 삭제하지 않으며 명시적 unregisterPlot이 삭제 경로다. farming plugin과 standalone CropPlot은 acquireFarmingClock의 단일 시간 구독을 공유한다. runtime이 남아 있으면 화면 밖 작물도 갱신하고 마지막 소유자가 해제되면 구독을 정리한다.

Blueprint 기본 컴포넌트는 registerDefaultComponents가 누락된 종류만 등록한다. BlueprintFactory와 useBlueprintEntity가 이 경로를 공유하며 ComponentRegistry의 기존 구현과 사용자 override를 보존한다. 명시적인 register/registerComponentFactory는 교체를 허용한다. 능력치·행동 등 기존 placeholder의 구현 범위는 이 등록 경로 통합으로 확대되지 않는다.

InteractionBridge는 주입 또는 default resolver에서 받은 InteractionSystem을 빌려 사용한다. dispose는 자체 구독·타이머와 직접 생성한 AutomationSystem만 해제한다. 주입된 AutomationSystem의 해제는 호출자 책임이며, 전역 default automation은 disposeGlobal이 명시적으로 해제한다. 명시적인 reset 명령은 기존처럼 연결된 시스템 상태를 초기화한다.

같은 MouseState를 사용하는 자동 이동은 마지막 요청이 입력 소유권을 갖는다. InteractionBridge의 WeakMap은 일시적인 실행 소유권만 관리하고, 다른 엔진의 이전 이동을 취소한다. 같은 엔진을 공유하는 브리지 간에는 projection 소유권만 넘긴다. 도착·정지·취소·dispose에서 소유권을 해제하며 이전 브리지 정리는 새 소유자의 입력을 비활성화하지 않는다.

strangler slice를 사용한다. 동작하는 도메인 엔진과 최적화된 자료구조를 보존하고, 하나의 boundary에 계약을 도입하고, canonical path를 지정하고, 호환성을 검증한 뒤, 이후 slice에서 old path를 제거한다.
