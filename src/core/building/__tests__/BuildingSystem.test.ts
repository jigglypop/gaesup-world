/**
 * Legacy test suite.
 *
 * This repository currently exposes building features as React components under
 * `src/core/building/components/*` (see `src/core/building/index.ts` exports),
 * and there is no runtime `core/BuildingSystem` class to test here.
 *
 * Component-level tests cover the current implementation.
 */
describe.skip('BuildingSystem (legacy core API)', () => {
  test('skipped', () => {
    expect(true).toBe(true);
  });
});