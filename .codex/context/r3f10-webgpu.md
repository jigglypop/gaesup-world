# R3F 10 and WebGPU Direction

## Decision

The target stack is React Three Fiber 10 alpha, modern Three.js, WebGPURenderer and TSL. This decision guides architecture, but dependency upgrades happen only in the dedicated migration epoch after API and ecosystem compatibility are verified.

## Current state

The package currently uses R3F 9 and Three.js 0.178. `src/next` already contains a WebGPU backend and the performance example can exercise CPU and GPU culling paths.

## Compatibility policy

- WebGPU is the target primary backend.
- WebGL remains an explicit fallback and differential-test backend.
- Renderer-neutral contracts must not expose WebGLRenderer.
- Existing GLSL and EffectComposer paths are migration inventory, not automatically deleted code.
- Do not rename mechanical APIs before confirming actual R3F 10 and WebGPURenderer behavior.

## Current blockers inventory

- `useThree` is used across building, camera, performance, fog, interaction, NPC and UI paths.
- Direct `state.gl` access exists in snow and sakura rendering.
- ShaderMaterial-based paths exist in water, snow, bloom, sakura, flag, grass and fire.
- EffectComposer-based postprocessing exists in LUT, color grade and outline paths.
- Renderer method calls exist in `src/next`, performance detection and WebGPU utilities.

Classify each usage as renderer-neutral, WebGL-specific, WebGPU blocker or compatibility-only during Epoch 3 and 4.
