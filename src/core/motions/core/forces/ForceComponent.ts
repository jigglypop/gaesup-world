import { RapierRigidBody } from '@react-three/rapier';

import type { PhysicsConfigType } from '../config';

export abstract class ForceComponent {
  protected abstract config: PhysicsConfigType;

  public abstract update(
    rigidBody: RapierRigidBody,
    delta: number
  ): void;
}
