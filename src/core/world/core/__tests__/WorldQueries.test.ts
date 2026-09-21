import { Box3, Euler, Ray, Vector3 } from 'three';

import { BoundsIndex } from '../BoundsIndex';
import { WorldObject, WorldSystem } from '../WorldSystem';

function object(id: string, x: number, y: number, z: number, size = 1): WorldObject {
  const position = new Vector3(x, y, z);
  return { id, position, rotation: new Euler(), scale: new Vector3(1, 1, 1), type: 'static',
    boundingBox: new Box3().setFromCenterAndSize(position, new Vector3(size, size, size)) };
}

test('nearest ray surface is independent of insertion order and bounded by world distance', () => {
  const world = new WorldSystem();
  const origin = new Vector3(); const direction = new Vector3(0, 0, 7);
  world.addObject(object('far', 0, 0, 9));
  world.addObject(object('near', 0, 0, 3));
  const first = world.raycast(origin, direction, 10)!;
  expect(first.object.id).toBe('near');
  expect(first.distance).toBe(2.5);
  expect(first.point.toArray()).toEqual([0, 0, 2.5]);
  expect(direction.z).toBe(7);
  expect(world.raycast(origin, direction, 2.49)).toBeNull();
  expect(world.raycast(origin, direction, 2.5)?.object.id).toBe('near');
  expect(world.raycast(origin, direction, Infinity)?.object.id).toBe('near');
  world.removeObject('near');
  expect(world.raycast(origin, direction, 10)?.object.id).toBe('far');
  expect(first.point.toArray()).toEqual([0, 0, 2.5]);
  expect(world.raycast(origin, new Vector3(), 10)).toBeNull();
  expect(world.raycast(origin, direction, NaN)).toBeNull();
  expect(world.raycast(origin, direction, -1)).toBeNull();
  world.dispose();
});

test('large bounds collide and raycast even when their centers are outside the search radius', () => {
  const world = new WorldSystem();
  world.addObject(object('small', 0, 0, 0));
  world.addObject(object('large', 50, 0, 0, 100));
  expect(world.checkCollisions('small').map(value => value.id)).toEqual(['large']);
  expect(world.getObjectsInRadius(new Vector3(), 2).map(value => value.id)).toEqual(['small']);
  world.removeObject('small');
  expect(world.raycast(new Vector3(-2, 0, 0), new Vector3(1, 0, 0), 3)?.object.id).toBe('large');
  world.dispose();
});

test('bounds-only edits, repeated IDs, overflow transitions and removal update query membership', () => {
  const world = new WorldSystem();
  world.addObject(object('anchor', 0, 0, 0));
  world.addObject(object('moving', 100, 0, 0));
  world.updateObject('moving', { boundingBox: object('', 0, 0, 0).boundingBox });
  expect(world.checkCollisions('anchor')).toHaveLength(1);
  world.updateObject('moving', { boundingBox: object('', 0, 0, 0, 1e9).boundingBox });
  expect(world.checkCollisions('anchor')).toHaveLength(1);
  world.updateObject('moving', { boundingBox: object('', 100, 0, 0).boundingBox });
  expect(world.checkCollisions('anchor')).toHaveLength(0);
  world.addObject(object('moving', 0, 0, 0));
  expect(world.checkCollisions('anchor')).toHaveLength(1);
  world.updateObject('moving', { boundingBox: undefined });
  expect(world.checkCollisions('anchor')).toHaveLength(0);
  world.addObject(object('moving', 0, 0, 0));
  world.removeObject('moving');
  expect(world.checkCollisions('anchor')).toHaveLength(0);
  world.cleanup();
  expect(world.raycast(new Vector3(0, 0, -5), new Vector3(0, 0, 1))).toBeNull();
});

test('index owns snapshots, deduplicates multi-cell entries and bounds extreme-coordinate work', () => {
  const index = new BoundsIndex(10, 16);
  const box = object('', -5, 0, -5, 30).boundingBox!;
  index.update('box', box);
  box.translate(new Vector3(100, 0, 0));
  expect(index.query(object('', 0, 0, 0, 20).boundingBox!)).toEqual(['box']);
  index.update('giant', object('', 0, 0, 0, 1e30).boundingBox);
  index.update('remote', object('', 1e100, 0, 1e100, 1).boundingBox);
  const all = new Box3(new Vector3(-Infinity, -Infinity, -Infinity), new Vector3(Infinity, Infinity, Infinity));
  expect(index.query(all).sort()).toEqual(['box', 'giant', 'remote']);
  index.remove('giant'); index.remove('remote');
  index.update('box', new Box3());
  expect(index.query(all)).toEqual([]);
  index.clear();
});

test('seeded moving worlds agree with brute-force collision and nearest surface references', () => {
  const world = new WorldSystem();
  let seed = 173;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const position = () => (random() - 0.5) * 200;
  for (let i = 0; i < 250; i++) world.addObject(object(String(i), position(), position(), position(), i % 25 ? random() * 20 : 2000));
  const point = new Vector3();
  for (let step = 0; step < 100; step++) {
    const id = String(step % 250);
    const moved = object(id, position(), position(), position(), random() * 30);
    world.updateObject(id, { position: moved.position, boundingBox: moved.boundingBox });
    const objects = world.getAllObjects();
    const expected = objects.filter(other => other.id !== id && moved.boundingBox!.intersectsBox(other.boundingBox!));
    expect(world.checkCollisions(id).map(value => value.id).sort()).toEqual(expected.map(value => value.id).sort());
    const origin = new Vector3(position(), position(), position());
    const direction = new Vector3(position(), position(), position());
    const ray = new Ray(origin, direction.clone().normalize());
    const limit = 50 + random() * 250;
    let distance = limit; let nearest: WorldObject | undefined;
    for (const candidate of objects) {
      if (!ray.intersectBox(candidate.boundingBox!, point)) continue;
      const hitDistance = point.distanceTo(origin);
      if (hitDistance <= distance) { distance = hitDistance; nearest = candidate; }
    }
    const actual = world.raycast(origin, direction, limit);
    expect(actual?.object.id).toBe(nearest?.id);
    if (actual) expect(actual.distance).toBeCloseTo(distance, 8);
  }
  world.dispose();
});
