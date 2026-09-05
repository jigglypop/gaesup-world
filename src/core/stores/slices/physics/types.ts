import type { PhysicsConfigType } from '../../../motions/core/config';

export type { PhysicsConfigType } from '../../../motions/core/config';

export type PhysicsSlice = {
  physics: PhysicsConfigType;
  setPhysics: (update: Partial<PhysicsConfigType>) => void;
  resetPhysics: () => void;
};
