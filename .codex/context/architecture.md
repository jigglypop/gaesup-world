# Architecture

## Product direction

Gaesup World의 목표는 Blender 기반 asset authoring, persistent world model, R3F와 Three.js projection, Rapier physics, data-oriented rendering, world creator, multiplayer와 social interaction을 하나의 3D social world platform으로 연결하는 것이다.

## Target layers

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

## Current repository map

- `src/core/runtime`, `src/core/plugins`: runtime composition, plugin registry, service wiring
- `src/core/save`, `src/core/world`: save binding, world runtime and persistence
- `src/core/building/model`: grid, placement, cell and edge coordinates
- `src/core/building/render`, `visibility`: typed arrays, snapshots, dirty ranges, upload plans, culling
- `src/core/networks`: adapters, authority contracts, queues, connection pools, visit flows
- `src/core/assets`: asset records, catalog, preview and seed assets
- `src/next`: data-oriented world, task graph, render graph, WebGPU backend experiments
- `src/blueprints`: blueprint runtime, registry, factory and editor
- `examples`: public package consumer, integration harness and product showcase

## Current source of truth

Domain stores and systems currently own state by domain. Runtime plugins and SaveSystem bind those stores. Building placement and render indices are valuable specialized sources. There is not yet one canonical WorldDocument spanning editor, runtime, persistence and networking.

## Target source of truth

Persistent world mutations eventually pass through one versioned WorldDocument command path. Simulation, render, physics, network and editor become projections. This is a target contract, not authorization for a repository-wide rewrite.

## Migration rule

Use strangler slices. Preserve working domain engines and optimized data structures, introduce a contract at one boundary, designate the canonical path, verify compatibility, then retire the old path in a later slice.
