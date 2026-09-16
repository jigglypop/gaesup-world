import { ConeGeometry, CylinderGeometry } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

import { NextWorld, entityIndexOf } from 'gaesup-world/next';

export function createForest(count: number) {
  const world = new NextWorld({ capacity: count });
  let seed = 271828;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < count; i += 1) {
    const id = world.createEntity();
    const angle = random() * Math.PI * 2;
    const distance = 22 + Math.sqrt(random()) * 330;
    world.transforms.setPosition(
      entityIndexOf(id),
      Math.cos(angle) * distance,
      Math.sin(angle * 3 + distance * 0.03) * 1.5,
      Math.sin(angle) * distance,
    );
  }
  const trunk = new CylinderGeometry(0.25, 0.4, 2, 5).toNonIndexed();
  trunk.translate(0, 1, 0);
  const crown = new ConeGeometry(2.1, 5, 5).toNonIndexed();
  crown.translate(0, 4.3, 0);
  const top = new ConeGeometry(1.5, 3.8, 5).toNonIndexed();
  top.translate(0, 6.3, 0);
  const geometry = mergeGeometries([trunk, crown, top]);
  trunk.dispose();
  crown.dispose();
  top.dispose();
  if (!geometry) throw new Error('Could not build the forest geometry.');
  return { world, geometry, radius: 8.5 };
}
