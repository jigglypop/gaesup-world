import type { RapierContext, RapierRigidBody } from '@react-three/rapier';

import { createRapierQueryAdapter } from '../rapierQueries';

type Vector = { x: number; y: number; z: number };

class FakeRay {
  constructor(public origin: Vector, public dir: Vector) {}
}

const EXCLUDE_SENSORS = 8;

test('레이 하나를 재사용해 센서와 자기 강체를 제외하고 아래로 쏜다', () => {
  const castRayAndGetNormal = jest
    .fn()
    .mockReturnValueOnce({ timeOfImpact: 0.1, normal: { x: 0, y: 0.8, z: 0.6 } })
    .mockReturnValueOnce(null);
  const context = {
    rapier: { Ray: FakeRay, QueryFilterFlags: { EXCLUDE_SENSORS } },
    world: { castRayAndGetNormal },
  } as unknown as Pick<RapierContext, 'rapier' | 'world'>;
  const body = { current: {} as RapierRigidBody };
  const adapter = createRapierQueryAdapter(context, body);
  const out = { normalY: 0 };

  expect(adapter.castGroundRay({ x: 1, y: 2, z: 3 }, 0.3, out)).toBe(true);
  expect(out.normalY).toBe(0.8);
  const [ray, maxDistance, solid, flags, groups, collider, excluded] = castRayAndGetNormal.mock.calls[0]!;
  expect(ray.origin).toEqual({ x: 1, y: 2, z: 3 });
  expect(ray.dir).toEqual({ x: 0, y: -1, z: 0 });
  expect([maxDistance, solid, flags, groups, collider]).toEqual([0.3, true, EXCLUDE_SENSORS, undefined, undefined]);
  expect(excluded).toBe(body.current);

  expect(adapter.castGroundRay({ x: 4, y: 5, z: 6 }, 0.3, out)).toBe(false);
  expect(castRayAndGetNormal.mock.calls[1]![0]).toBe(ray);
  expect(ray.origin).toEqual({ x: 4, y: 5, z: 6 });
});
