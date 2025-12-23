import { RefObject } from 'react';

import { RapierRigidBody } from '@react-three/rapier';
import { Group } from 'three';

import { ComponentRegistry } from './ComponentRegistry';
import { BlueprintDefinition, IComponent, ComponentContext } from './types';

export class BlueprintEntity {
  private id: string;
  private blueprint: BlueprintDefinition;
  private components: IComponent[] = [];
  private context: ComponentContext;

  constructor(
    blueprint: BlueprintDefinition,
    rigidBodyRef: RefObject<RapierRigidBody>,
    innerGroupRef?: RefObject<Group>,
    outerGroupRef?: RefObject<Group>
  ) {
    this.id = blueprint.id;
    this.blueprint = blueprint;
    this.context = {
      rigidBodyRef,
      deltaTime: 0,
      entityId: blueprint.id,
      ...(innerGroupRef ? { innerGroupRef } : {}),
      ...(outerGroupRef ? { outerGroupRef } : {}),
    };
    
    this.createComponents();
  }

  private createComponents(): void {
    const registry = ComponentRegistry.getInstance();
    
    for (const componentDef of this.blueprint.components) {
      const component = registry.create(componentDef);
      if (component) {
        component.initialize(this.context);
        this.components.push(component);
      }
    }
  }

  update(deltaTime: number): void {
    this.context.deltaTime = deltaTime;
    
    for (const component of this.components) {
      if (component.enabled) {
        component.update(this.context);
      }
    }
  }

  getComponent<T extends IComponent>(type: string): T | undefined {
    return this.components.find(c => c.type === type) as T;
  }

  getComponents<T extends IComponent>(type: string): T[] {
    return this.components.filter(c => c.type === type) as T[];
  }

  addComponent(component: IComponent): void {
    component.initialize(this.context);
    this.components.push(component);
  }

  removeComponent(type: string): void {
    const index = this.components.findIndex(c => c.type === type);
    if (index !== -1) {
      const component = this.components[index];
      if (component) {
        component.dispose();
      }
      this.components.splice(index, 1);
    }
  }

  dispose(): void {
    for (const component of this.components) {
      component.dispose();
    }
    this.components = [];
  }

  getId(): string {
    return this.id;
  }

  getBlueprint(): BlueprintDefinition {
    return this.blueprint;
  }
} 