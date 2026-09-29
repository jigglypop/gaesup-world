import * as THREE from 'three';

import { buildCoverGeometry, buildCoverSpecks, paintCover, type CoverEntry } from '../geometry';
import { SAND, SNOW } from '../looks';

const tile = (x: number, z = 0): CoverEntry => ({ position: [x, 0, z], size: 4 });

/** Height and normal of every surface vertex on the line x = `x`, keyed by z. */
function along(geometry: THREE.BufferGeometry, x: number): Map<string, { y: number; normal: THREE.Vector3 }[]> {
  const position = geometry.getAttribute('position'), normal = geometry.getAttribute('normal');
  const found = new Map<string, { y: number; normal: THREE.Vector3 }[]>();
  for (let i = 0; i < position.count; i++) {
    if (Math.abs(position.getX(i) - x) > 1e-5) continue;
    const key = position.getZ(i).toFixed(3);
    found.set(key, [...(found.get(key) ?? []), { y: position.getY(i), normal: new THREE.Vector3().fromBufferAttribute(normal, i) }]);
  }
  return found;
}

describe('cover geometry', () => {
  it('meets a neighboring tile without a step or a crease in its shading', () => {
    const { surface } = buildCoverGeometry([tile(0), tile(4)], SAND);
    const seam = along(surface, 2);
    expect(seam.size).toBeGreaterThan(10);
    for (const [a, b] of seam.values()) {
      expect(b).toBeDefined();
      expect(a!.y).toBeCloseTo(b!.y, 5);
      expect(a!.normal.angleTo(b!.normal)).toBeLessThan(1e-3);
    }
  });

  it('settles to the tile top at an open edge, has unit normals and takes its look\'s paint', () => {
    const { surface, skirt } = buildCoverGeometry([tile(0)], SNOW);
    const position = surface.getAttribute('position'), normal = surface.getAttribute('normal'), color = surface.getAttribute('color');
    expect(skirt).not.toBeNull();
    for (let i = 0; i < position.count; i++) {
      expect(new THREE.Vector3().fromBufferAttribute(normal, i).length()).toBeCloseTo(1, 5);
      if (Math.abs(Math.abs(position.getX(i)) - 2) < 1e-6) expect(position.getY(i)).toBeCloseTo(0.01, 5);
    }
    const painted = paintCover(SNOW, position.getX(7), position.getZ(7), new THREE.Color(SNOW.color), new THREE.Color(SNOW.accent), new THREE.Color());
    expect(color.getX(7)).toBeCloseTo(painted.r, 5);
  });

  it('scatters the classic renderer specks over every tile, the same on every build', () => {
    const a = buildCoverSpecks([tile(0), tile(8)], SAND), b = buildCoverSpecks([tile(0), tile(8)], SAND);
    expect(a.geometry.getAttribute('position').count).toBe(2 * 160);
    expect(Array.from(a.geometry.getAttribute('position').array)).toEqual(Array.from(b.geometry.getAttribute('position').array));
    expect(a.size).toBeCloseTo(0.032);
  });
});
