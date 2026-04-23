import { RefObject } from 'react';

import { RapierRigidBody } from '@react-three/rapier';
import type { Group, Vector3 } from 'three';

import type { BlueprintRecord, BlueprintValue } from '../types';

export interface ComponentDefinition {
  type: string;
  enabled: boolean;
  properties: BlueprintRecord;
}

export interface BlueprintDefinition {
  id: string;
  name: string;
  type: 'character' | 'vehicle' | 'airplane' | 'object';
  components: ComponentDefinition[];
  physics?: {
    mass?: number;
    friction?: number;
    restitution?: number;
    linearDamping?: number;
    angularDamping?: number;
  };
  metadata?: BlueprintRecord;
}

export interface ComponentContext {
  rigidBodyRef: RefObject<RapierRigidBody>;
  innerGroupRef?: RefObject<Group>;
  outerGroupRef?: RefObject<Group>;
  deltaTime: number;
  entityId: string;
}

export interface IComponent {
  type: string;
  enabled: boolean;
  initialize(context: ComponentContext): void;
  update(context: ComponentContext): void;
  dispose(): void;
}

export interface IForceComponent extends IComponent {
  getForce(): Vector3;
  applyForce(rigidBody: RapierRigidBody, deltaTime: number): void;
}

export interface IMovementComponent extends IComponent {
  calculateMovement(input: BlueprintValue, context: ComponentContext): Vector3;
}

export interface ComponentRegistry {
  register(type: string, factory: ComponentFactory): void;
  create(definition: ComponentDefinition): IComponent | null;
  getFactory(type: string): ComponentFactory | undefined;
}

export type ComponentFactory = (properties: BlueprintRecord) => IComponent; 
