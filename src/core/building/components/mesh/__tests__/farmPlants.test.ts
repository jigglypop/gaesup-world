import * as THREE from 'three';

import { CROPS } from '../../../terrain/farm/config';
import { cropLayout, farmSquares } from '../../../terrain/farm/layout';
import type { FarmStage } from '../../../types';
import { plantTemplate, type PlantKind } from '../farm/crops';
import { createPlantMesh } from '../farm/instances';

const KINDS: PlantKind[] = [...(Object.keys(CROPS) as PlantKind[]), 'weed'];
const STAGES: FarmStage[] = ['sprout', 'young', 'ripe'];

const triangles = (kind: PlantKind, stage: FarmStage, tier: 0 | 1) => plantTemplate(kind, stage, tier).index!.count / 3;

describe('farm plant templates', () => {
  it.each(KINDS)('builds %s at every stage and tier with finite, colored, swaying vertices', (kind) => {
    for (const stage of STAGES) {
      for (const tier of [0, 1] as const) {
        const geometry = plantTemplate(kind, stage, tier);
        const position = geometry.getAttribute('position'), plant = geometry.getAttribute('farmPlant');
        expect(position.count).toBeGreaterThan(8);
        expect(geometry.getAttribute('color').count).toBe(position.count);
        expect(Array.from(position.array as Float32Array).every(Number.isFinite)).toBe(true);
        expect(Array.from(geometry.getAttribute('normal').array as Float32Array).every(Number.isFinite)).toBe(true);
        // The lowest part stays put and the tops sway.
        let lowest = 0, swaying = 0;
        for (let i = 0; i < plant.count; i++) {
          if (position.getY(i) < position.getY(lowest)) lowest = i;
          swaying = Math.max(swaying, plant.getX(i));
        }
        expect(plant.getX(lowest)).toBeLessThan(swaying * 0.4);
        expect(swaying).toBeGreaterThan(0.02);
      }
    }
  });

  it('draws fewer triangles in the far tier and caches each template', () => {
    for (const kind of KINDS) expect(triangles(kind, 'ripe', 1)).toBeLessThanOrEqual(triangles(kind, 'ripe', 0));
    expect(plantTemplate('corn', 'ripe', 0)).toBe(plantTemplate('corn', 'ripe', 0));
    expect(triangles('sunflower', 'ripe', 0)).toBeGreaterThan(triangles('sunflower', 'young', 0));
  });

  it('marks only tulip petals for the row bloom colors', () => {
    const blooms = (kind: PlantKind) => {
      const plant = plantTemplate(kind, 'ripe', 0).getAttribute('farmPlant');
      return Array.from({ length: plant.count }, (_, i) => plant.getY(i)).filter((mask) => mask > 0).length;
    };
    expect(blooms('tulip')).toBeGreaterThan(0);
    expect(blooms('sunflower')).toBe(0);
    expect(blooms('wheat')).toBe(0);
  });
});

describe('farm plant meshes', () => {
  it('instances a layout at its roots with both tiers sharing its instance data', () => {
    const squares = farmSquares([{ id: 'a', tileGroupId: 'g', size: 1, position: { x: 8, y: 1, z: 0 }, objectType: 'farm', objectConfig: { farm: { crop: 'cabbage' } } }]);
    const layout = cropLayout(squares);
    const plants = createPlantMesh(layout, 'cabbage', 'ripe', new THREE.MeshBasicMaterial());
    expect(plants.mesh.count).toBe(layout.count);
    expect(plants.tiers[0].getAttribute('farmRoot')).toBe(plants.tiers[1].getAttribute('farmRoot'));
    expect(plants.box.min.x).toBeGreaterThan(5);
    expect(plants.box.max.y).toBeGreaterThan(1 + CROPS.cabbage.height);
    plants.dispose();
  });
});
