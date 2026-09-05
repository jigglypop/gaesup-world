import { RefObject } from 'react';

import { RapierRigidBody } from '@react-three/rapier';
import { Group } from 'three';

import { ComponentRegistry } from './ComponentRegistry';
import { BlueprintDefinition, IComponent, ComponentContext, BlueprintMovementInput, BlueprintAnimationClips } from './types';

export class BlueprintEntity {
  private id: string;
  private blueprint: BlueprintDefinition;
  private components: IComponent[] = [];
  private context: ComponentContext;

  constructor(
    blueprint: BlueprintDefinition,
    rigidBodyRef: RefObject<RapierRigidBody>,
    innerGroupRef?: RefObject<Group>,
    outerGroupRef?: RefObject<Group>,
    animationClips?: BlueprintAnimationClips,
  ) {
    this.id = blueprint.id;
    this.blueprint = blueprint;
    this.context = {
      rigidBodyRef,
      deltaTime: 0,
      entityId: blueprint.id,
      ...(innerGroupRef ? { innerGroupRef } : {}),
      ...(outerGroupRef ? { outerGroupRef } : {}),
      ...(animationClips ? { animationClips } : {}),
    };

    try {
      this.createComponents();
    } catch (error) {
      try {
        this.dispose();
      } catch {
        /* Preserve the initialization failure. */
      }
      throw error;
    }
  }

  private createComponents(): void {
    const registry = ComponentRegistry.getInstance();

    for (const componentDef of this.blueprint.components) {
      const component = registry.create(componentDef);
      if (component) {
        this.addComponent(component);
      }
    }
  }

  update(deltaTime: number, movementInput?: BlueprintMovementInput): void {
    this.context.deltaTime = deltaTime;
    this.context.movementInput = movementInput;

    for (const component of this.components) {
      if (component.enabled) {
        component.update(this.context);
      }
    }
  }

  getComponent<T extends IComponent>(type: string): T | undefined {
    return this.components.find((c) => c.type === type) as T;
  }

  getComponents<T extends IComponent>(type: string): T[] {
    return this.components.filter((c) => c.type === type) as T[];
  }

  addComponent(component: IComponent): void {
    try {
      component.initialize(this.context);
    } catch (error) {
      try {
        component.dispose();
      } catch {
        /* Preserve the initialization failure. */
      }
      throw error;
    }
    this.components.push(component);
  }

  removeComponent(type: string): void {
    const index = this.components.findIndex((c) => c.type === type);
    if (index !== -1) {
      const component = this.components[index];
      this.components.splice(index, 1);
      if (component) {
        component.dispose();
      }
    }
  }

  dispose(): void {
    const components = this.components;
    this.components = [];
    const errors: unknown[] = [];
    for (const component of components) {
      try {
        component.dispose();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length) throw new AggregateError(errors, 'Blueprint component disposal failed');
  }

  getId(): string {
    return this.id;
  }

  getBlueprint(): BlueprintDefinition {
    return this.blueprint;
  }
}
