import { WorldObject } from '../../core/WorldSystem';
import { ReactNode } from 'react';
import { Vector3Tuple, QuaternionTuple } from 'three';
import { RigidBody } from '@react-three/rapier';
import { Euler, Group, Vector3, Quaternion } from 'three';
import { RapierRigidBody, RigidBodyProps } from '@react-three/rapier';
import { PayloadData } from '@core/types/common';

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

export type passivePropsType = {
  children?: ReactNode;
  url?: string;
  componentType?: 'vehicle' | 'airplane' | 'character';
  position?: Vector3Tuple;
  rotation?: QuaternionTuple;
  scale?: Vector3Tuple | number;
  visible?: boolean;
  sensor?: boolean;
  userData?: Record<string, unknown>;
  onCollisionEnter?: (payload: PayloadData) => void;
  onCollisionExit?: (payload: PayloadData) => void;
  onIntersectionEnter?: (payload: PayloadData) => void;
  onIntersectionExit?: (payload: PayloadData) => void;
  ref?: React.RefObject<RigidBody>;
  outerGroupRef?: React.RefObject<Group>;
  innerGroupRef?: React.RefObject<Group>;
  colliderRef?: React.RefObject<RapierRigidBody>;
};

export type PassiveObjectInstanceProps = {
  object: PassiveObject;
  isSelected: boolean;
  onSelect?: (id: string) => void;
  showDebugInfo?: boolean;
  enableInteraction?: boolean;
}
