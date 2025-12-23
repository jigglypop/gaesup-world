import { ReactNode } from 'react';

import { BlueprintEntity } from '../../core/BlueprintEntity';
import { AnyBlueprint } from '../../types';

export type BlueprintSpawnerProps = {
  blueprint?: AnyBlueprint;
  blueprintId?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  onSpawn?: (entity: BlueprintEntity) => void;
  onDestroy?: () => void;
  children?: ReactNode;
}; 