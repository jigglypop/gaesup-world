import { BuildingBridge } from '../BuildingBridge';

test('legacy meshes keep explicit zero roughness, metalness and opacity', () => {
  const result = BuildingBridge.convertLegacyMesh({ roughness: 0, metalness: 0, opacity: 0, transparent: false });

  expect(result.roughness).toBe(0);
  expect(result.metalness).toBe(0);
  expect(result.opacity).toBe(0);
  expect(result.transparent).toBe(false);
});

test('missing legacy material values still fall back to defaults', () => {
  const result = BuildingBridge.convertLegacyMesh({});

  expect(result).toMatchObject({ roughness: 0.5, metalness: 0, opacity: 1, transparent: false });
});
