# Gaesup World SDK Architecture Spec

## Purpose

Gaesup World is intended to grow into a general-purpose web 3D world SDK.

The SDK should support multiple kinds of 3D games, worlds, simulations, and editors rather than being tied to one life-sim example. The current codebase already has most of the required ingredients. The next step is to stabilize module boundaries, public APIs, and shared contracts.

## Product Definition

Gaesup World SDK provides:

- A runtime for starting and disposing a 3D world application.
- A world/root component layer for React Three Fiber scenes.
- Character and entity control.
- Camera systems.
- Physics and motion systems.
- Input and interaction systems.
- Save/load infrastructure.
- Asset/content loading.
- Plugin-based extension.
- Blueprint/prefab-style entity creation.
- Optional editor tooling.
- Optional feature packs such as building, NPC, networking, and life-sim gameplay.

## Core Principle

The root package must stay light.

```ts
import { GaesupWorld, GaesupController } from 'gaesup-world';
```

Advanced or heavy features should use subpath imports.

```ts
import { createGaesupRuntime } from 'gaesup-world/runtime';
import { createPluginRegistry } from 'gaesup-world/plugins';
import { BuildingPanel } from 'gaesup-world/editor';
import { BlueprintFactory } from 'gaesup-world/blueprints';
```

## Required Core Modules

### Runtime

Subpath:

```txt
gaesup-world/runtime
```

Responsibilities:

- Application setup and disposal.
- Plugin setup and disposal.
- Save binding registration.
- Asset loading.
- Service lookup.
- Runtime lifecycle ownership.

Expected API:

```ts
createGaesupRuntime(options);
runtime.setup();
runtime.dispose();
runtime.loadAssets();
runtime.getService(id);
runtime.requireService(id);
```

### Plugin System

Subpath:

```txt
gaesup-world/plugins
```

Responsibilities:

- Plugin registration.
- Required and optional dependency resolution.
- Setup order.
- Reverse dispose order.
- Extension registries.
- Shared event bus.
- Plugin manifest exposure.

Needed improvements:

- Plugin-owned event listener cleanup.
- Capability query API.
- Namespace policy for plugin-owned extensions.
- Manifest import/export story.

### World and Scene

Suggested subpaths:

```txt
gaesup-world/world
gaesup-world/scene
```

Responsibilities:

- World configuration.
- Scene root composition.
- Room and portal structure.
- Visibility drivers.
- World snapshot support.

Current relevant APIs:

- `GaesupWorld`
- `GaesupWorldContent`
- `WorldConfigProvider`
- `SceneRoot`
- `RoomRoot`
- `RoomPortal`
- `RoomVisibilityDriver`

### Entity, Component, System

Suggested subpath:

```txt
gaesup-world/entities
```

This is the most important missing contract for a Unity-like SDK.

Required concepts:

- `Entity`
- `Component`
- `System`
- `Transform`
- Tags
- Layers
- Queries
- Lifecycle

Expected API shape:

```ts
createEntity();
destroyEntity(entity);
addComponent(entity, component);
removeComponent(entity, componentType);
getComponent(entity, componentType);
queryEntities(filter);
registerSystem(system);
```

Current candidates to unify:

- `src/blueprints/core`
- `src/core/boilerplate/entity`
- `src/core/motions/entities`
- `src/core/world/core/WorldSystem`

### Blueprints

Subpaths:

```txt
gaesup-world/blueprints
gaesup-world/blueprints/editor
```

Responsibilities:

- Prefab-like entity definition.
- Data-driven entity creation.
- Component registry.
- Blueprint loading.
- Blueprint factory/spawner.
- Editor integration.

Needed improvements:

- Integrate with the standard entity/component contract.
- Add runtime spawn/despawn conventions.
- Add schema validation.
- Add blueprint versioning.

### Camera

Suggested subpath:

```txt
gaesup-world/camera
```

Responsibilities:

- Camera controller abstraction.
- First person, third person, chase, top down, side scroll, fixed, and isometric modes.
- Camera transitions.
- Camera collision.
- Camera presets.

Root should expose only the common surface such as `Camera` and `CameraPresets`. Debug panels and low-level controllers belong in the camera subpath.

### Motion and Physics

Suggested subpaths:

```txt
gaesup-world/motions
gaesup-world/physics
gaesup-world/controllers
```

Responsibilities:

- Character movement.
- Physics bridge.
- Input adapter integration.
- Entity movement state.
- Force components.
- Controller abstraction.

Needed improvements:

- Separate generic physics from character controller behavior.
- Treat vehicle and airplane control as optional controllers.
- Standardize motion runtime services.

### Interactions and Input

Suggested subpath:

```txt
gaesup-world/interactions
```

Responsibilities:

- Keyboard, mouse, touch, and gamepad input.
- Interactable registry.
- Interaction prompts.
- Click-to-move.
- Tool-use actions.

Potential consolidation:

- `input`
- `interactions`
- `tools`

`tools` can likely become an interaction feature rather than a separate core pillar.

### Navigation

Suggested subpath:

```txt
gaesup-world/navigation
```

Responsibilities:

- Navigation grid.
- Pathfinding.
- Dynamic obstacles.
- Weighted paths.
- NPC path movement.
- Click-to-move path movement.

Current status:

- `NavigationSystem` exists.
- Export exists.
- Integration is weak.
- Test coverage is still needed.

Required work:

- Test `worldToGrid` and `gridToWorld`.
- Test blocked cells and path avoidance.
- Test blocked start/goal behavior.
- Test diagonal corner-cut prevention.
- Test JS fallback when WASM is unavailable.
- Connect navigation to NPC movement.
- Connect navigation to click-to-move.
- Consider exposing navigation as a runtime service or plugin.

### Save and Snapshot

Suggested subpath:

```txt
gaesup-world/save
```

Responsibilities:

- Domain bindings.
- Serialize/hydrate.
- Storage adapters.
- Migration.
- Player progress snapshots.
- World snapshots.

Current overlap:

- `src/core/save`
- `src/core/platform`
- `src/core/world/persistence`

Recommended direction:

- Use `SaveSystem` as the primary save contract.
- Move world/player snapshot helpers under the save/runtime layer.
- Convert legacy world persistence to adapters or remove it.

### Assets and Content

Subpaths:

```txt
gaesup-world/assets
gaesup-world/content
```

Responsibilities:

- Asset registry.
- Asset sources.
- HTTP asset source.
- Metadata.
- Preview components.
- Content bundle import/export.

Needed improvements:

- Asset schema.
- Asset dependency tracking.
- Preload groups.
- Editor asset browser integration.

### Editor

Subpath:

```txt
gaesup-world/editor
```

Responsibilities:

- Editor shell.
- Panel registry.
- Scene hierarchy.
- Inspector.
- Asset browser.
- Blueprint editor.
- Building/world editor.
- Runtime preview.
- Export/import pipeline.

Current concern:

The editor currently has many useful panels, but some are game-specific. A general SDK editor should separate generic editor shell features from feature-pack panels.

Needed improvements:

- Generic scene hierarchy.
- Generic inspector.
- Asset browser.
- Panel injection from plugins.
- Feature-pack panel boundaries.

## Optional Feature Packs

Feature packs should not be required by the root package.

Suggested subpaths:

```txt
gaesup-world/building
gaesup-world/npc
gaesup-world/network
gaesup-world/rendering
gaesup-world/gameplay
```

### Building Pack

Includes:

- Building editor.
- Grid/tile/wall/block placement.
- Building store.
- Building render drivers.
- Environment mesh helpers such as grass, sakura, sand, snowfield, water, billboard, and fire.

### NPC Pack

Includes:

- NPC store.
- NPC system.
- NPC components.
- NPC schedule.
- NPC brain/behavior helpers.
- Reinforcement/LLM adapter hooks.

Root should not expose NPC brain internals.

### Network Pack

Includes:

- Network system.
- Message queue.
- Connection pool.
- Player/NPC sync.
- Multiplayer hooks.
- Multiplayer UI components.
- Network adapter.

### Rendering Pack

Includes:

- Toon material helpers.
- Outlines.
- Sky.
- Fog.
- Postprocessing.
- WebGPU renderer helpers.

### Gameplay Pack

This should be treated as a starter kit rather than SDK core.

Candidate modules:

- Items
- Inventory
- Economy
- Crafting
- Farming
- Quests
- Dialog
- Mail
- Town
- Relations
- Weather
- Events
- Audio
- Catalog

## Root API Policy

Root `gaesup-world` should expose:

```ts
GaesupWorld
GaesupWorldContent
WorldConfigProvider
GaesupController
Camera
Interactable
InteractionPrompt
MotionUI
Teleport
SaveSystem
createGaesupRuntime
useGaesupStore
usePlayerPosition
useTeleport
```

Root should not expose:

- Editor panels.
- Debug panels.
- Seed data.
- NPC brain internals.
- Network UI.
- Building mesh batch internals.
- Blueprint examples.
- Low-level registries.

## Recommended Subpath Map

```txt
gaesup-world
gaesup-world/runtime
gaesup-world/plugins
gaesup-world/world
gaesup-world/scene
gaesup-world/entities
gaesup-world/camera
gaesup-world/controllers
gaesup-world/physics
gaesup-world/motions
gaesup-world/interactions
gaesup-world/navigation
gaesup-world/assets
gaesup-world/content
gaesup-world/save
gaesup-world/editor
gaesup-world/blueprints
gaesup-world/building
gaesup-world/npc
gaesup-world/network
gaesup-world/rendering
gaesup-world/postprocessing
gaesup-world/gameplay
```

## Prioritized Plan

### Phase 1: Public API Stabilization

- Keep root API small.
- Add missing subpaths.
- Move editor/network/building/NPC internals out of root.
- Update examples to use public subpaths.
- Keep package typecheck and build typecheck passing.

### Phase 2: Shared Contracts

- Reuse existing config types instead of duplicating literal unions.
- Standardize world config, camera config, mode config, and URL config.
- Standardize runtime options.
- Standardize plugin manifests and capabilities.
- Standardize save domain bindings.

### Phase 3: Entity Standardization

- Define the SDK-level entity/component/system contract.
- Unify existing entity-like systems around the contract.
- Connect blueprints to the entity model.
- Make editor inspector work against the standard entity model.

### Phase 4: Navigation Integration

- Add tests for `NavigationSystem`.
- Connect navigation to NPC movement.
- Connect navigation to click-to-move.
- Support dynamic obstacles from placed world objects.
- Expose navigation as a runtime service/plugin.

### Phase 5: Save Consolidation

- Make `SaveSystem` the central save path.
- Move world and player snapshots into save/runtime helpers.
- Retire or adapt legacy world persistence.

### Phase 6: Editor SDK Work

- Add generic scene hierarchy.
- Add generic inspector.
- Add asset browser.
- Add plugin panel registration.
- Separate generic editor shell from feature-pack panels.

### Phase 7: Feature Pack Boundaries

- Formalize building pack.
- Formalize NPC pack.
- Formalize network pack.
- Formalize gameplay pack.
- Formalize rendering pack.

## Readiness Assessment

The project has enough functionality to become a strong general-purpose SDK.

The main gap is not missing features. The main gap is contract clarity:

- Module boundaries need to be fixed.
- Entity/component contracts need to be standardized.
- Save/runtime/platform overlap needs to be resolved.
- Editor needs to become generic instead of game-specific.
- Feature packs need to be separated from core.

With these refinements, Gaesup World can become a credible Unity-like web SDK rather than only a feature-rich game example library.
