# Todo List

Date: 2026-04-23

## Current Status

- [x] `corepack pnpm exec eslint src examples server info.tsx --report-unused-disable-directives --max-warnings 0`
- [x] `corepack pnpm lint`
- [x] `corepack pnpm test -- --runInBand --watchman=false`
- [x] `corepack pnpm exec tsc -p tsconfig.build.json --pretty false`

Initial lint baseline:
- `153` source-scope errors
- `import/order`: `76`
- `react/no-unknown-property`: `63`
- `@typescript-eslint/no-unused-vars`: `8`
- `@typescript-eslint/no-unsafe-function-type`: `4`
- `prefer-const`: `1`
- `no-restricted-imports`: `1`

Current baseline:
- [x] lint: `0` errors
- [x] tests: passing
- [x] type check: passing

## Completed Steps

### 0. Lint scope cleanup
- [x] Excluded `demo-dist/**` in `eslint.config.js`

### 1. `react/no-unknown-property`
- [x] Expanded allowed R3F / three.js props in ESLint config
- [x] Cleaned unused imports in `examples/pages/MiniRoom.tsx`

Added props:
- [x] `blending`
- [x] `decay`
- [x] `dispose`
- [x] `distance`
- [x] `gradientMap`
- [x] `groundColor`
- [x] `metalness`
- [x] `polygonOffset`
- [x] `polygonOffsetFactor`
- [x] `polygonOffsetUnits`
- [x] `shadow-bias`
- [x] `sizeAttenuation`
- [x] `vertexColors`
- [x] `windStrength`

### 2. `import/order`
- [x] Ran `eslint --fix`
- [x] Cleaned remaining manual import-order issues
- [x] Representative manual fix: `src/core/building/components/BuildingSystem/index.tsx`

### 3. `@typescript-eslint/no-unused-vars`
- [x] `info.tsx`
- [x] `src/core/building/render/core.ts`
- [x] `src/core/networks/core/network.worker.ts`
- [x] `src/core/scene/stores/sceneStore.ts`

### 4. `@typescript-eslint/no-unsafe-function-type`
- [x] `src/core/boilerplate/decorators/bridge.ts`
- [x] `src/core/boilerplate/decorators/monitoring.ts`
- [x] `src/core/boilerplate/decorators/types.ts`
- [x] Replaced unsafe `Function` usage with explicit callable types

### 5. Layer cleanup
- [x] Removed `react` import from `src/core/motions/core/types.ts`
- [x] Kept core-layer typing on `RuntimeValue` side

### 6. Verification
- [x] Full repo lint passed
- [x] Test suite passed
- [x] Build type check passed

## Notes

- Jest still prints existing console warnings in some suites, but the run passes:
  - `react-test-renderer is deprecated`
  - `WARNING: Multiple instances of Three.js being imported`
  - some expected warning logs from tests

## Files Touched Directly In Manual Follow-up

- [x] `eslint.config.js`
- [x] `examples/pages/MiniRoom.tsx`
- [x] `info.tsx`
- [x] `src/core/boilerplate/decorators/bridge.ts`
- [x] `src/core/boilerplate/decorators/monitoring.ts`
- [x] `src/core/boilerplate/decorators/types.ts`
- [x] `src/core/building/components/BuildingSystem/index.tsx`
- [x] `src/core/building/render/core.ts`
- [x] `src/core/motions/core/types.ts`
- [x] `src/core/networks/core/network.worker.ts`
- [x] `src/core/scene/stores/sceneStore.ts`

## Next Candidates

- [ ] Decide whether to reflect lint / verification status in project docs
- [ ] Review the large auto-format/import-order diff before commit

## Planned Gameplay And Presentation Features

Goal: the next gameplay-facing work should restore or add features that are visible and usable from `examples/`, not only hidden in core modules. Each item below must ship with public exports, example wiring, package-surface coverage, and focused tests.

### P0: Character Customization And Equipment

- [x] Character outfit swapping
  - Target: swap clothing/parts at runtime through the character store and `CharacterCreator`/example UI.
  - Scope: clothing asset metadata, selected outfit state, save/hydrate path, example controls.
  - Example requirement: `examples/` must expose at least one outfit change workflow using public `gaesup-world` APIs.
- [x] Facial expression swapping
  - Target: change expression presets or blendshape-like named states independently from outfit.
  - Scope: expression registry/state, animation or material binding, save/hydrate path.
  - Example requirement: a visible example control or interaction changes expression in the world.
- [x] Weapon equipment
  - Target: equip/unequip weapon items and attach them to character hand/back sockets.
  - Scope: item `equippable` metadata, attachment slot model, inventory/hotbar integration, save/hydrate path.
  - Example requirement: equip a seed/demo weapon from inventory or action bar and show it on the character.

### P0: Rideable Feature Restore

- [x] Restore rideable mount/dismount flow
  - Target: nearby rideable objects can be mounted/dismounted with an interaction key.
  - Scope: `Rideable` component, rideable store slice, mode switching, rider offset, prompts, cleanup on dismount.
  - Example requirement: vehicle/airplane ride flow must be usable in the main world example.
- [x] Stabilize rideable controls
  - Target: mounted controls choose the correct motion mode (`vehicle`, `airplane`, later boat/bike).
  - Scope: movement tuning, camera handoff, collision/physics handoff, animation state.
  - Example requirement: at least one ground vehicle and one airplane path remain reachable from examples.

### P0: Teleport Feature Restore

- [x] Restore click-to-teleport to a specific point
  - Target: clicking a configured teleport marker or world point moves the player to that position.
  - Scope: runtime event-bus teleport path, legacy DOM fallback quarantine, cooldown/availability state.
  - Example requirement: `examples/components/teleport` or world HUD must let the user click a destination and move there.
- [x] Teleport markers and zones
  - Target: named destinations can be registered by scene/world data and shown in UI or 3D markers.
  - Scope: destination registry helper, marker component, example integration. Scene serialization compatibility remains a follow-up for scene-authored zones.
  - Example requirement: at least two named destinations in the world example.

### P1: Close-Up / Cinematic Zoom Restore

- [x] Restore close-up camera mode
  - Target: temporary close-up/inspection camera can focus on character, NPC, object, or interaction target.
  - Scope: camera plugin API, zoom target state, easing, restore previous camera state.
  - Example requirement: example UI or interaction triggers a close-up and exits cleanly.
- [x] Cinematic zoom transitions
  - Target: smooth dolly/zoom/focus transition for dialog, interaction, equip preview, or cutscene beats.
  - Scope: camera timeline command, easing presets, interruption/cancel behavior.
  - Example requirement: one scripted zoom beat in the main world or editor preview.

### P1: Cinematic System

- [x] Add a lightweight cinematic timeline
  - Target: sequence camera moves, character/NPC actions, dialog, fades, postprocess, and events.
  - Scope: timeline data model, player/runner, runtime plugin, save-safe serialized format.
  - Example requirement: example scene includes a short cinematic that can be started from UI/interact prompt.
- [x] Cinematic camera actions
  - Target: pan, orbit, look-at, dolly, close-up, shake, fade in/out.
  - Scope: camera action definitions, focus interpolation, restore/cancel handling, fade/shake action hooks.
- [x] Cinematic gameplay actions
  - Target: trigger dialog, teleport, animation, expression, equip/unequip, NPC movement.
  - Scope: store-backed dialog/expression/equipment beats plus handler-backed teleport/animation/NPC/event bridges.
- [x] Cinematic editor panel
  - Target: minimal timeline/event panel in editor shell.
  - Scope: add/list/reorder actions, preview/run, serialize timeline JSON.

### P2: Supporting Work

- [x] Character socket/attachment model
  - Needed by weapons, tools, clothing props, cinematic props, and rideable rider offsets.
- [x] Action/equipment UX
  - Needed by weapon equip, outfit preview, expression preview, tool use, and cinematic triggers.
- [x] Example coverage gate
  - Every restored feature must be reachable from `examples/World.tsx`, `examples/packageSurface.ts`, or a routed example page.
- [x] Package consumer coverage gate
  - Public API additions must pass `test:package`, `test:demo`, and package export synchronization tests.

## Unity-Style Engine Gap Checklist

목표: `gaesup-world`를 단순 3D 예제/라이브러리에서 Unity식 제작 경험을 가진 웹 월드 엔진으로 키우기 위해 부족한 기능을 추적한다.

### Priority Legend

| Priority | Meaning |
| --- | --- |
| P0 | 엔진 정체성을 결정하는 필수 기반 |
| P1 | 제작툴로 쓰려면 반드시 필요한 핵심 기능 |
| P2 | 제품 완성도와 확장성을 높이는 기능 |
| P3 | 장르/규모에 따라 나중에 선택할 기능 |

### Status Legend

| Status | Meaning |
| --- | --- |
| Not Started | 아직 명확한 구현 없음 |
| Partial | 일부 도메인에 흩어져 있거나 데모 수준 |
| Needs Unification | 구현은 있으나 공통 모델/API로 묶어야 함 |
| Keep | 현재 방향을 유지하며 다듬기 |
| Optionalize | 코어에서 빼고 플러그인/킷으로 격리 |

### Engine Core

| Done | Priority | Feature | Current Status | Target | Notes |
| --- | --- | --- | --- | --- | --- |
| [x] | P0 | SceneObject model | Keep | `SceneObject` with `id`, `name`, `parentId`, `transform`, `components` | Added `src/core/scene-object` |
| [x] | P0 | Component system | Keep | 표준 `Transform`, `Renderer`, `Collider`, `Script`, `Interactable` 컴포넌트 | Added standard scene component factories |
| [x] | P0 | Scene serialization | Keep | scene JSON 저장/로드/검증 | Added parse/serialize/validation helpers |
| [x] | P0 | Runtime scene loader | Keep | 저장된 scene을 R3F 런타임으로 렌더 | Added pure runtime hierarchy index |
| [x] | P0 | Transform hierarchy | Keep | parent/child transform 전파 | Added world transform composition |
| [x] | P1 | Entity query API | Keep | tag/layer/component query | Added scene runtime query helpers |
| [x] | P1 | Scene migration | Keep | scene/prefab/schema version migration | Added migration registry and migrate helper |
| [x] | P1 | Project settings | Keep | physics, rendering, input, build settings | Added project settings schema, defaults, validation, serialization |
| [x] | P2 | Layer/tag system | Keep | collision/render/editor layer 구분 | Added layer/tag registry, scene validation, collision matrix helpers |

### Editor Core

| Done | Priority | Feature | Current Status | Target | Notes |
| --- | --- | --- | --- | --- | --- |
| [x] | P0 | Hierarchy panel | Keep | scene object tree, parent/child, search | Added built-in SceneObject hierarchy panel |
| [x] | P0 | Inspector panel | Keep | selected object component edit/add/remove | Added generic SceneObject inspector with edit callbacks |
| [x] | P0 | Transform gizmo | Keep | move/rotate/scale, local/global, snapping | Added Drei TransformControls wrapper and transform helpers |
| [x] | P0 | Global undo/redo | Keep | 모든 editor command를 transaction으로 기록 | Added observable command stack and transactions |
| [x] | P1 | Project/Assets panel | Keep | assets, scenes, prefabs, materials 탐색 | Added searchable Project panel for assets/materials/scenes/prefabs |
| [x] | P1 | Selection system | Keep | single/multi select, hover, outline | Added shared selection state, multi/range/toggle select, hover flow |
| [x] | P1 | Play mode | Keep | edit/play 전환, runtime state reset | Added play mode controller, snapshot restore, editor controls |
| [x] | P1 | Editor command stack | Keep | create/update/delete/move all through commands | Added SceneObject command factory |
| [x] | P2 | Shortcut system | Keep | configurable keybinds | Added shortcut registry, formatter, hook, and EditorLayout integration |
| [x] | P2 | Command palette | Keep | editor action search/run | 검색 가능한 명령 팔레트와 Ctrl/Cmd+K 실행 단축키 추가 |
| [x] | P2 | Dirty state/autosave UI | Keep | unsaved changes 표시, autosave status | Added save status model, autosave hook, sidebar UI, save controls |

### Prefab And Asset Pipeline

| Done | Priority | Feature | Current Status | Target | Notes |
| --- | --- | --- | --- | --- | --- |
| [x] | P0 | Prefab model | Keep | scene object tree template | Added prefab document model, validation, serialization, instantiation |
| [ ] | P0 | Prefab instance overrides | Not Started | instance별 property override 추적 | Unity식 prefab 완성도 |
| [ ] | P1 | Asset metadata | Partial | `assetId`, `type`, `url`, `thumbnail`, `dependencies`, `importSettings` | assetStore 확장 |
| [ ] | P1 | Asset import pipeline | Partial | GLB/texture/audio/material import validation | 지금은 catalog/load 중심 |
| [ ] | P1 | Material asset system | Partial | material preset, editable material asset | 렌더 품질과 제작 UX |
| [ ] | P1 | Thumbnail generation | Partial | asset/prefab preview image | Project panel에 필요 |
| [ ] | P2 | Dependency graph | Not Started | asset usage/dependency tracking | bundle/export에 필요 |
| [ ] | P2 | Content bundle versioning | Partial | manifest/schema/hash | content 쪽과 통합 |
| [ ] | P2 | Missing asset fallback UI | Partial | 깨진 asset 표시/복구 UX | 운영 안정성 |

### Building And World Authoring

| Done | Priority | Feature | Current Status | Target | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | P0 | Footprint model | Partial | `cell`, `edge`, `corner`, `volume`, `free` footprint | 범용 배치 시스템 기반 |
| [ ] | P0 | Placement rule API | Partial | plugin-style placement rules | no-overlap/support/zone rules |
| [ ] | P1 | Edge-based walls | Partial | door/window attachable wall edge model | 현재 position/rotation 중심 보강 |
| [ ] | P1 | Multi-floor support | Partial | floors, stairs, ceiling, roof | 빌딩 제작 확장 |
| [ ] | P1 | Batch edit tools | Not Started | multi-select move/delete/copy/paste | 제작 속도 |
| [ ] | P1 | Nav obstacle generation | Partial | placed objects produce navigation obstacles | NPC/pathfinding 통합 |
| [ ] | P2 | Terrain tools | Not Started | terrain paint/sculpt or tile terrain | 장르 따라 선택 |
| [ ] | P2 | Room/zone authoring | Partial | room bounds, portals, visibility edit | scene 도메인과 통합 |

### Runtime Systems

| Done | Priority | Feature | Current Status | Target | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | P0 | Input abstraction polish | Partial | keyboard/mouse/gamepad/touch/replay backend | 이미 방향 좋음 |
| [ ] | P1 | Physics authoring | Partial | collider edit, trigger, rigidbody options | Rapier 사용은 있으나 제작툴 부족 |
| [ ] | P1 | Collision layers | Not Started | collision matrix/layer rules | Unity Physics Settings에 해당 |
| [ ] | P1 | Animation state machine | Partial | locomotion/action/interact states | 캐릭터 품질 핵심 |
| [ ] | P1 | Script component | Not Started | user behavior component API | Unity의 MonoBehaviour 역할 |
| [ ] | P2 | Runtime profiler | Partial | frame, draw calls, physics, memory panels | perfStore 확장 |
| [ ] | P2 | Loading/error states | Partial | asset loading, scene loading, recoverable errors | 제품 UX |

### Optional Kits

| Done | Priority | Kit | Current Status | Target | Decision |
| --- | --- | --- | --- | --- | --- |
| [ ] | P1 | Cozy life kit | Needs Unification | inventory, quests, farming, town, mail, catalog 묶음 | Optionalize |
| [ ] | P2 | NPC AI kit | Partial | schedule, dialog, behavior graph, memory | Optionalize / Experimental |
| [ ] | P2 | Network kit | Partial | multiplayer, visit room, authority contracts | Optionalize / Experimental |
| [ ] | P2 | Admin kit | Partial | login/admin shell/editor policy | Optionalize |
| [ ] | P3 | RL policy server | Partial | separate example/server package | Experimental |

### Rendering And Visual Direction

| Done | Priority | Feature | Current Status | Target | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | P1 | Stylized render preset | Partial | cozy toon lighting/material/color preset | 데모가 예뻐지는 핵심 |
| [ ] | P1 | Scene/Game camera split | Partial | editor scene camera vs runtime game camera | Unity식 편집 UX |
| [ ] | P2 | Lighting authoring | Partial | lights, sky, fog, shadow settings editor | 현재 기능을 제작툴화 |
| [ ] | P2 | Postprocess presets | Partial | LUT, color grade, bloom, outline preset | 렌더 일관성 |
| [ ] | P2 | Asset scale/style guide | Not Started | model size, material, palette guide | 예제/콘텐츠 품질 |

### Documentation And Quality

| Done | Priority | Task | Current Status | Target | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | P0 | README encoding repair | Not Started | 깨진 한글 문서 복구 | 신뢰도 최우선 |
| [ ] | P0 | Core concept docs | Partial | runtime/plugin/scene/component/save 설명 | 사용자 온보딩 |
| [x] | P1 | Minimal example | Complete | physics/world/editor 없는 최소 예제 | `/minimal` route uses public runtime, character, equipment, and cinematic APIs |
| [ ] | P1 | Full demo separation | Partial | cozy town demo as product example | examples 분리 작업 계속 |
| [x] | P1 | Browser smoke tests | Complete | dev server + route load + canvas nonblank | `test:browser` launches Vite + Playwright and verifies `/minimal` plus the world canvas |
| [ ] | P2 | Visual regression tests | Not Started | screenshot/canvas pixel checks | 3D UI 안정화 |
| [ ] | P2 | Bundle budget checks | Partial | chunk size budget CI | manualChunks 이후 추적 |
| [ ] | P2 | API surface audit | Partial | root export 축소, subpath 정리 | 패키지 안정성 |

### Recommended Implementation Order

| Step | Priority | Task | Expected Outcome |
| --- | --- | --- | --- |
| 1 | P0 | Define `SceneObject` and component schema | Done: `src/core/scene-object` |
| 2 | P0 | Build scene serialization and runtime loader | Done: parse/serialize + runtime hierarchy index |
| 3 | P0 | Add Hierarchy and generic Inspector | Unity식 제작 UX 시작 |
| 4 | P0 | Add selection and transform gizmo | 씬 직접 편집 가능 |
| 5 | P0 | Introduce prefab model | 재사용 가능한 제작 단위 확보 |
| 6 | P1 | Normalize asset metadata/import pipeline | Project panel과 prefab 기반 |
| 7 | P1 | Reframe building as component/placement system | 빌딩 기능을 엔진 모델 위로 올림 |
| 8 | P1 | Add Play Mode boundary | editor/runtime 분리 명확화 |
| 9 | P1 | Move cozy/network/admin into optional kits | 코어 정체성 정리 |
| 10 | P1 | Repair docs and add minimal tutorial | 외부 사용자 기준 사용 가능 |
