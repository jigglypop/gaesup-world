import * as THREE from 'three';

import type { PlacedObject } from '../../../../types';
import { bakeModel, layoutStaticModels, mergeStaticModels, sameStaticCell, STATIC_VERTEX_BUDGET, type BakedModel } from '../merge';

const placed = (id: string, x: number, z: number, rotation = 0, modelScale?: number): PlacedObject => ({
  id,
  type: 'model',
  position: { x, y: 0, z },
  rotation,
  ...(modelScale ? { config: { modelScale } } : {}),
});

/** A trunk (front side) and a glowing crown (double side) lifted 1 m inside the model. */
function tree(): THREE.Group {
  const scene = new THREE.Group();
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 0.2), new THREE.MeshStandardMaterial({ color: '#7a4f2a', roughness: 0.9 })));
  const crown = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshStandardMaterial({ color: '#66aa44', emissive: '#224411', emissiveIntensity: 0.5, roughness: 0.8, side: THREE.DoubleSide }),
  );
  crown.position.y = 1;
  scene.add(crown);
  return scene;
}

test('a flat model bakes into parts by material side, once per scene', () => {
  const scene = tree();
  const model = bakeModel(scene)!;
  expect([...model.sides.keys()].sort()).toEqual([THREE.FrontSide, THREE.DoubleSide]);
  expect(model.vertices).toBe(24 + 4);
  expect(model.sides.get(THREE.DoubleSide)![0]!.emissive.r).toBeCloseTo(new THREE.Color('#224411').r * 0.5);
  expect(bakeModel(scene)).toBe(model);

  const textured = new THREE.Group().add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ map: new THREE.Texture() })));
  const glass = new THREE.Group().add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ transparent: true })));
  expect(bakeModel(textured)).toBeNull();
  expect(bakeModel(glass)).toBeNull();
});

test('placed copies merge into one geometry with each part surface per vertex', () => {
  const crown = bakeModel(tree())!.sides.get(THREE.DoubleSide)!;
  const geometry = mergeStaticModels([
    { object: placed('a', 10, 0), parts: crown },
    { object: placed('b', 0, 5, Math.PI / 2, 2), parts: crown },
  ])!;
  expect(geometry.getAttribute('position').count).toBe(8);
  expect(geometry.index!.count).toBe(12);
  // The second copy's indices start past the first copy's vertices.
  expect(Math.min(...Array.from(geometry.index!.array).slice(6))).toBe(4);
  const box = new THREE.Box3().setFromBufferAttribute(geometry.getAttribute('position') as THREE.BufferAttribute);
  expect(box.max.y).toBeCloseTo(3);
  expect(box.min.x).toBeCloseTo(0);
  expect(box.max.z).toBeCloseTo(6);
  const color = new THREE.Color('#66aa44');
  expect(geometry.getAttribute('color').getY(7)).toBeCloseTo(color.g);
  expect(geometry.getAttribute('emissive').getX(0)).toBeGreaterThan(0);
  expect(geometry.getAttribute('roughness').getX(5)).toBeCloseTo(0.8);
  expect(geometry.boundingSphere).not.toBeNull();
});

test('a mirroring transform keeps triangles facing out', () => {
  const plane = new THREE.PlaneGeometry(1, 1);
  const mirrored = new THREE.Mesh(plane, new THREE.MeshStandardMaterial());
  mirrored.scale.x = -1;
  const scene = new THREE.Group().add(mirrored);
  const geometry = mergeStaticModels([{ object: placed('m', 0, 0), parts: bakeModel(scene)!.sides.get(THREE.FrontSide)! }])!;
  const [a, b, c] = Array.from(geometry.index!.array);
  const corner = (index: number) => new THREE.Vector3().fromBufferAttribute(geometry.getAttribute('position') as THREE.BufferAttribute, index);
  const facing = new THREE.Triangle(corner(a!), corner(b!), corner(c!)).getNormal(new THREE.Vector3());
  expect(facing.z).toBeCloseTo(1);
});

test('models merge by square, shadow and side; heavy or unbakeable models stay instanced', () => {
  const model = bakeModel(tree())!;
  const heavy: BakedModel = { vertices: STATIC_VERTEX_BUDGET, sides: model.sides };
  const trees = { url: 'tree.glb', objects: [placed('a', 1, 1), placed('b', 40, 1)], shadow: 'all' as const };
  const rock = { url: 'rock.glb', objects: [placed('c', 2, 2)], shadow: 'near' as const };
  const forest = { url: 'forest.glb', objects: [placed('d', 3, 3), placed('e', 4, 4)], shadow: 'all' as const };
  const lamp = { url: 'lamp.glb', objects: [placed('f', 5, 5)], shadow: 'near' as const };
  const loading = { url: 'loading.glb', objects: [placed('g', 6, 6)], shadow: 'near' as const };
  const models = new Map<string, BakedModel | null>([['tree.glb', model], ['rock.glb', model], ['forest.glb', heavy], ['lamp.glb', null]]);

  const layout = layoutStaticModels([trees, rock, forest, lamp, loading], models);
  const sides = [THREE.FrontSide, THREE.DoubleSide];
  expect(layout.cells.map((cell) => cell.key).sort()).toEqual(['0:0:all', '0:0:near', '1:0:all'].flatMap((square) => sides.map((side) => `${square}:${side}`)).sort());
  expect(layout.instanced).toEqual([forest, lamp]);

  const again = layoutStaticModels([trees, rock, forest, lamp, loading], models);
  expect(again.cells.every((cell, index) => sameStaticCell(cell, layout.cells[index]!))).toBe(true);
  const moved = layoutStaticModels([{ ...trees, objects: [placed('a', 1, 1), trees.objects[1]!] }, rock], models);
  expect(sameStaticCell(moved.cells[0]!, layout.cells[0]!)).toBe(false);
});
