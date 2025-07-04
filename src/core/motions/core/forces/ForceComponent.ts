import { RapierRigidBody } from '@react-three/rapier';
import { MotionConfig } from '../types';

export abstract class ForceComponent {
  protected abstract config: MotionConfig;

  public abstract update(
    rigidBody: RapierRigidBody,
    delta: number
  ): void;
} 