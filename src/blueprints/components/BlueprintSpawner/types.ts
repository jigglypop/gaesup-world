import { ReactNode } from 'react';
import { AnyBlueprint } from '../../types';
import { BlueprintEntity } from '../../../core/motions/core/blueprint/BlueprintEntity';

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