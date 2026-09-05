import type { ReactNode } from 'react';

import type { PhysicsEntityProps } from '../entities/types';

export type EntityControllerOptions = Omit<
  PhysicsEntityProps,
  'url' | 'isActive' | 'componentType'
> & { enableKeyboard?: boolean };

export interface EntityControllerProps {
  props: EntityControllerOptions;
  children?: ReactNode;
}
