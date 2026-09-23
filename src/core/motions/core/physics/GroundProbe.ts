import * as THREE from 'three';

import type { GroundRayHit, PhysicsQueryAdapter, PhysicsVector } from './types';

const GROUND_PROBE_ORIGIN_OFFSET = 0.1;
const DEFAULT_GROUND_PROBE_LENGTH = 0.2;
const MAX_GROUND_SLOPE_DEGREES = 50;
const MIN_GROUND_NORMAL_Y = Math.cos(THREE.MathUtils.degToRad(MAX_GROUND_SLOPE_DEGREES));

export class GroundProbe {
  private readonly origin: PhysicsVector = { x: 0, y: 0, z: 0 };
  private readonly hit: GroundRayHit = { normalY: 0 };

  isGrounded(
    queries: PhysicsQueryAdapter,
    feet: Readonly<PhysicsVector>,
    length = DEFAULT_GROUND_PROBE_LENGTH,
  ): boolean {
    this.origin.x = feet.x;
    this.origin.y = feet.y + GROUND_PROBE_ORIGIN_OFFSET;
    this.origin.z = feet.z;
    if (!queries.castGroundRay(this.origin, GROUND_PROBE_ORIGIN_OFFSET + length, this.hit)) return false;
    return this.hit.normalY >= MIN_GROUND_NORMAL_Y;
  }
}
