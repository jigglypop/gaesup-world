import type { RapierContext, RapierRigidBody } from '@react-three/rapier';

import type { PhysicsQueryAdapter } from '../core/physics/types';

export function createRapierQueryAdapter(
  { rapier, world }: Pick<RapierContext, 'rapier' | 'world'>,
  body: { readonly current: RapierRigidBody | null },
): PhysicsQueryAdapter {
  const ray = new rapier.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
  return {
    castGroundRay: (origin, maxDistance, out) => {
      ray.origin.x = origin.x;
      ray.origin.y = origin.y;
      ray.origin.z = origin.z;
      const hit = world.castRayAndGetNormal(
        ray,
        maxDistance,
        true,
        rapier.QueryFilterFlags.EXCLUDE_SENSORS,
        undefined,
        undefined,
        body.current ?? undefined,
      );
      if (!hit) return false;
      out.normalY = hit.normal.y;
      return true;
    },
  };
}
