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
