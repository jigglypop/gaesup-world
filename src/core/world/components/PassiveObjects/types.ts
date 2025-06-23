import { WorldObject } from '../../core/WorldEngine';

export interface PassiveObject extends WorldObject {
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
}

export interface PassiveObjectProps {
  objects: PassiveObject[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  showDebugInfo?: boolean;
  enableInteraction?: boolean;
  showBoundingBoxes?: boolean;
  showLabels?: boolean;
  onInteract?: (object: PassiveObject, action: string) => void;
}

export interface ObjectInteraction {
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
