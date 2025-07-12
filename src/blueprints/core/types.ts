import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { Group } from 'three';

export interface ComponentDefinition {
  type: string;
  enabled: boolean;
  properties: Record<string, unknown>;
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
  metadata?: Record<string, unknown>;
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
  getForce(): THREE.Vector3;
  applyForce(rigidBody: RapierRigidBody, deltaTime: number): void;
}

export interface IMovementComponent extends IComponent {
  calculateMovement(input: any, context: ComponentContext): THREE.Vector3;
}

export interface ComponentRegistry {
  register(type: string, factory: ComponentFactory): void;
  create(definition: ComponentDefinition): IComponent | null;
  getFactory(type: string): ComponentFactory | undefined;
}

export type ComponentFactory = (properties: Record<string, unknown>) => IComponent; 