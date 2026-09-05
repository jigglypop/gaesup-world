# Animation action ownership

## 목표와 범위

- AnimationSystem remains the canonical action registry. Optional expected-action maps scope unregisterAnimations to matching action identities; omitted maps retain whole-type clearing. useAnimationSetup releases only its registered actions.
- Replacing an action stops the displaced action. Registry name-cache invalidation follows membership changes, including equal-count replacement sequences.
- Excludes simultaneous independent playback controllers per entity; the existing type-level command target remains.
- Risk: removing an active action must refresh snapshots without clearing unrelated registrations.

## 검증

- Real Three.js replacement/cleanup and name-cache regressions, animation/motion tests, TypeScript, scoped lint and public export guards.
- Packaged consumer contract for optional scoped cleanup.

## 완료 조건

- [x] Old cleanup cannot remove a newer same-name action or unrelated actions.
- [x] Legacy whole-type cleanup remains functional and idle snapshots reuse the name array.
- [x] Validation and HARNESS record completed.

## 검증 결과와 자체 검토 (2026-09-05)

- Real action replacement/scoped cleanup/name-cache regression plus StrictMode and disappearing lazy getters pass. Animation/motion/public guards:31 suites/195 tests. Build/root TypeScript, scoped lint and diff checks pass.
- Fresh test:package passes with both optional scoped and legacy whole-type unregister calls in the packed TypeScript consumer; ESM/CJS and declaration checks remain green. Existing large consumer bundle warning remains and is unrelated to action cleanup.
- Self-review: expected action identity is checked before removal; hook captures values at registration time; replacement stops only the displaced registration; engine remains canonical registry; no frame allocations added by the name cache. No persistent schema changes.
- Limit: command targeting is still per animation type. This slice does not provide simultaneous independent per-entity controllers, reference counting for shared identical action objects, or restoration of overwritten registrations. Browser and full/demo suites were not rerun for this slice.
