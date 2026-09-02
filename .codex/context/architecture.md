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

persistent world mutation은 최종적으로 하나의 versioned WorldDocument command 경로를 통과한다. simulation, render, physics, network, editor는 projection이 된다. 이것은 목표 계약이지 저장소 전체 재작성의 허가가 아니다.

## Migration 규칙

strangler slice를 사용한다. 동작하는 도메인 엔진과 최적화된 자료구조를 보존하고, 하나의 boundary에 계약을 도입하고, canonical path를 지정하고, 호환성을 검증한 뒤, 이후 slice에서 old path를 제거한다.
