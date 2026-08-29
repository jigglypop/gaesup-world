# Epoch 2 Examples Shell

## Objective

Introduce a scenario-first examples shell while preserving world simulation, physics, building internals, network protocol and save format.

## Delivered

- Added a product Home and AppShell.
- Promoted World, Creator, Multiplayer, Assets and Performance to product scenarios.
- Preserved legacy and developer routes behind a Developer menu and catalog.
- Added public asset catalog consumption and kept examples on package entry points.
- Added route classification, uniqueness and bidirectional App route drift tests.
- Kept the existing World performance overlay contract and limited the new diagnostics flag to diagnostics controls.
- Fixed independent package consumption by declaring the transitive `postprocessing` runtime requirement as an optional peer and direct development dependency.

## Excluded scope

- R3F 10 dependency upgrade
- WebGPURenderer migration
- WorldDocument implementation
- movement, physics, building placement, network protocol and save format changes

## Compatibility

`/edit`, `/network`, `/next`, `/showcase`, `/building`, `/blueprints`, `/admin` and `/examples` remain routed. `/creator`, `/multiplayer`, `/assets` and `/performance` reuse existing implementations. Existing user changes in runtime and World files were preserved and classified outside this shell slice.

## Reviewer findings

- Fixed the Developer dropdown clipping risk by moving scrolling to the product group and positioning the menu inside an overflow-visible navigation shell.
- Fixed route source-of-truth drift risk with a bidirectional manifest/App contract test.
- Restored the existing performance overlay behavior after the package consumption contract caught a regression.
- Deferred mutable character defaults, character public API coverage and unrelated runtime/input changes because they predated and are outside this slice.
- Generated `dist/`, `demo-dist/` and `.tmp/` changes are command-produced verification artifacts, not manually edited source.

## Validation results

- Library TypeScript build: passed.
- Examples TypeScript check: passed.
- Changed-file ESLint: passed.
- Route manifest tests: 4 passed.
- Public API and package export tests: 17 passed.
- Package consumption contract: 14 passed.
- Full Jest: 182 suites passed, 1 skipped; 1,683 tests passed, 1 skipped.
- Demo build and package surface chunk verification: passed.
- Package consumer verification: ESM import, CJS require, runtime smoke and Vite consumer build passed.
- Private examples import contract: passed through package consumption tests.
- Full repository lint: failed on 16 pre-existing errors outside the files owned by this slice.
- Browser interaction validation: not run because the required in-app browser control tool was unavailable in this session.

## Performance check

No simulation, render loop, physics or renderer dependency was changed. Product pages remain route-split. The demo build passed and retained existing large-vendor chunk warnings; bundle reduction belongs to a measured performance epoch.

## Completion

The shell slice is complete with reported limitations. The next migration slice should be an Epoch 3 R3F 10 alpha compatibility spike that preserves the current World Model and records renderer lifecycle breakpoints before Epoch 4 WebGPU implementation.
