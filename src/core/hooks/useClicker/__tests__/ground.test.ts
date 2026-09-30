import * as THREE from 'three';

import { groundAlongRay, nearestWalkable } from '../ground';

/** A camera 10 m up looking down at 45° along +x. */
const ray = () => new THREE.Ray(new THREE.Vector3(0, 10, 0), new THREE.Vector3(1, -1, 0).normalize());

describe('groundAlongRay', () => {
  it('meets flat ground where the plane would', () => {
    const hit = groundAlongRay(ray(), () => 0)!;
    expect(hit.x).toBeCloseTo(10, 1);
    expect(hit.y).toBeCloseTo(0, 1);
  });

  it('lands on a raised floor in front of the ground behind it', () => {
    // A 2 m platform from x = 6 to 9: the ray reaches y = 2 at x = 8, on the platform.
    const hit = groundAlongRay(ray(), (x) => (x >= 6 && x <= 9 ? 2 : 0))!;
    expect(hit.x).toBeCloseTo(8, 1);
    expect(hit.y).toBeCloseTo(2, 1);
  });

  it('finds nothing looking up or level', () => {
    expect(groundAlongRay(new THREE.Ray(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0.2, 0).normalize()), () => 0)).toBeNull();
  });
});

describe('nearestWalkable', () => {
  // A 2 m wide wall along x = 4..6.
  const open = (x: number) => x < 4 || x > 6;

  it('keeps a click on open ground', () => {
    expect(nearestWalkable(open, 1, 0, 0.5, 2, { x: 0, z: 0 })).toEqual([1, 0]);
  });

  it('moves a click on the wall to the nearest open spot on the side the agent comes from', () => {
    const [x] = nearestWalkable(open, 4.2, 0, 0.5, 2, { x: 0, z: 0 })!;
    expect(x).toBeLessThan(4);
    const [far] = nearestWalkable(open, 5.8, 0, 0.5, 2, { x: 10, z: 0 })!;
    expect(far).toBeGreaterThan(6);
  });

  it('gives up past its reach', () => {
    expect(nearestWalkable(() => false, 0, 0, 0.5, 2, { x: 0, z: 0 })).toBeNull();
  });
});
