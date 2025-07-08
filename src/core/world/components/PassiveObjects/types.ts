import { WorldObject } from '../../core/WorldEngine';
import { ReactNode } from 'react';
import { Vector3Tuple, QuaternionTuple } from 'three';
import { RigidBody } from '@react-three/rapier';
import { Euler, Group, Vector3, Quaternion } from 'three';
import { RapierRigidBody, RigidBodyProps } from '@react-three/rapier';

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
  modelUrl: string;
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

export type passivePropsType = {
  children?: ReactNode;
  url?: string;
  componentType?: 'vehicle' | 'airplane' | 'character';
  position?: Vector3Tuple;
  rotation?: QuaternionTuple;
  scale?: Vector3Tuple | number;
  visible?: boolean;
  sensor?: boolean;
  userData?: any;
  onCollisionEnter?: (payload: any) => void;
  onCollisionExit?: (payload: any) => void;
  onIntersectionEnter?: (payload: any) => void;
  onIntersectionExit?: (payload: any) => void;
  ref?: React.RefObject<RigidBody>;
  outerGroupRef?: React.RefObject<any>;
  innerGroupRef?: React.RefObject<any>;
  colliderRef?: React.RefObject<any>;
};

export type PassiveObjectInstanceProps = {
  object: PassiveObject;
  isSelected: boolean;
  onSelect?: (id: string) => void;
  showDebugInfo?: boolean;
  enableInteraction?: boolean;
}
