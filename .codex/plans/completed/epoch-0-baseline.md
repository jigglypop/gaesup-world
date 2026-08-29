# Epoch 0 Baseline

## Recorded state

- Library typecheck passed before the examples shell slice.
- Examples typecheck passed before the examples shell slice.
- Public API tests passed: 8 tests.
- Package export tests passed: 9 tests.
- Full Jest baseline passed: 181 suites passed, 1 skipped; 1679 tests passed, 1 skipped.
- Existing examples already expose world, minimal, editor, NPC editor, showcase, building, blueprints, network, next and admin routes.
- Examples have no detected private `src`, `@/` or `@core/` imports.

## UX baseline

The default `/` route opens the full world immediately. Navigation is a flat horizontally scrolling list. Product scenarios, developer diagnostics and experiments are mixed. A catalog and error boundary exist but do not provide a product Home or scenario-first shell.

## Renderer dependency baseline

- `useThree`: 11 production files
- direct `state.gl`: 2 production files
- `ShaderMaterial`: 8 production files
- `EffectComposer`: 3 production files
- `WebGLRenderer`: 1 compatibility utility
- direct renderer method patterns: 6 production/example files

## Baseline caveats

The worktree contains extensive pre-existing user changes and generated demo output changes. The migration must not reset or restore them. Browser screenshots, GPU frame time and bundle measurements are deferred until the shell slice is implemented and demo/package validation completes.
