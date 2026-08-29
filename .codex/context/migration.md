# Migration Strategy

## Method

Use small strangler migration slices. A slice should change one architecture boundary and keep the world runnable.

Every active plan records objective, current state, problem, scope, excluded scope, current and target sources of truth, compatibility strategy, risks, tests, performance checks and completion criteria.

## Epochs

1. Epoch 0: record build, tests, routes, examples UX and renderer dependencies.
2. Epoch 1: install Codex harness, architecture context and invariants.
3. Epoch 2: introduce examples shell, scenario routes and developer separation without changing simulation.
4. Epoch 3: migrate to R3F 10 alpha with compatibility tests.
5. Epoch 4: introduce WebGPURenderer, capability detection and explicit WebGL fallback.
6. Epoch 5: consolidate RenderSnapshot, GPU buffers, instancing, batching, LOD, visibility and resource ownership.
7. Epoch 6: define WorldDocument, entities, components, commands, events and schema versions.
8. Epoch 7: integrate building commands and projections while preserving placement and spatial specialization.
9. Epoch 8: add Blender-to-manifest asset pipeline with collider, socket, LOD, Meshopt and KTX2 metadata.
10. Epoch 9: formalize network authority, snapshot, delta, interpolation and reconciliation.
11. Epoch 10: prototype identity, ownership, visits, presence, chat and post references.

Do not combine R3F migration, WorldDocument introduction, building rewrite, networking rewrite and examples rewrite in one slice.
