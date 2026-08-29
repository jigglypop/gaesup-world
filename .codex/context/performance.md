# Performance

## Regression signals

Track CPU frame time, GPU frame time, FPS, draw calls, triangles, material count, texture and geometry memory estimates, rigid body and collider counts, JS heap, recurring allocation, entity count, network bytes and messages, bundle size and asset size when available.

## Scenario tiers

- SMALL: one house, one avatar and dozens of objects.
- MEDIUM: neighborhood, multiple avatars and hundreds to low thousands of visible entities.
- STRESS: intentionally exceeds expected production density.

## Guardrails

- No React setState every frame for simulation data.
- No unnecessary Zustand write every frame.
- Minimize recurring allocations and reuse scratch objects.
- Avoid one subscription or one independent useFrame per world object.
- Avoid one material and draw call per repeated prop.
- Dispose material, geometry, texture and GPU resources through explicit ownership.
- Bound shadow casters and define LOD for large environment assets.
- Performance numbers are regression baselines, not marketing claims.
