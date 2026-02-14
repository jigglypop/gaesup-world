import type { PhysicsEntityProps } from '@motions/entities/types';

import { WorldObject } from '../../core/WorldSystem';

export type PassiveObject = WorldObject & {
  type: 'building' | 'tree' | 'rock' | 'item' | 'decoration' | 'terrain';
  durability?: number;
  maxDurability?: number;
  resource?: {
    type: string;
    amount: number;
    maxAmount: number;
    regenerationRate?: number;
  };
  interactable?: boolean;
  destructible?: boolean;
  collectable?: boolean;
  modelUrl: string;
}

export type PassiveObjectProps = {
  objects: PassiveObject[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  showDebugInfo?: boolean;
  enableInteraction?: boolean;
  showBoundingBoxes?: boolean;
  showLabels?: boolean;
  onInteract?: (object: PassiveObject, action: string) => void;
}

export type ObjectInteraction = {
  type: 'collect' | 'harvest' | 'examine' | 'use' | 'destroy';
  requirements?: {
    tool?: string;
    level?: number;
    energy?: number;
  };
  result?: {
    items?: Array<{ type: string; amount: number }>;
    experience?: number;
    durabilityDamage?: number;
  };
}

export type passivePropsType = Omit<
  PhysicsEntityProps,
  | 'isActive'
  | 'componentType'
  | 'url'
  | 'rigidBodyRef'
  | 'colliderRef'
  | 'outerGroupRef'
  | 'innerGroupRef'
> & {
  url?: string;
  componentType?: 'vehicle' | 'airplane' | 'character';
  visible?: boolean;
};

export type PassiveObjectInstanceProps = {
  object: PassiveObject;
  isSelected: boolean;
  onSelect?: (id: string) => void;
  showDebugInfo?: boolean;
  enableInteraction?: boolean;
}
