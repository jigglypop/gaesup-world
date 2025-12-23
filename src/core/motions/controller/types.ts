import type { ReactNode } from 'react';

import type { PhysicsEntityProps } from '../entities/types';

export type EntityControllerOptions = Omit<
  PhysicsEntityProps,
  'url' | 'isActive' | 'componentType'
>;

export interface EntityControllerProps {
  props: EntityControllerOptions;
  children?: ReactNode;
}