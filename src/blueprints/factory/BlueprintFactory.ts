import { RefObject } from 'react';

import { RapierRigidBody } from '@react-three/rapier';
import { Group } from 'three';

import { logger } from '@/core/utils/logger';

import { BlueprintConverter } from './BlueprintConverter';
import { BlueprintEntity } from '../core/BlueprintEntity';
import { ComponentRegistry } from '../core/ComponentRegistry';
import { registerDefaultComponents } from '../core/registerComponents';
import { BlueprintDefinition, ComponentFactory, BlueprintAnimationClips } from '../core/types';
import { blueprintRegistry } from '../registry';
import { AnyBlueprint } from '../types';

export type BlueprintEntityConfig = {
  rigidBodyRef: RefObject<RapierRigidBody>;
  innerGroupRef?: RefObject<Group>;
  outerGroupRef?: RefObject<Group>;
  animationClips?: BlueprintAnimationClips;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
};

export class BlueprintFactory {
  private static instance: BlueprintFactory;
  private converter: BlueprintConverter;
  private componentRegistry: ComponentRegistry;

  private constructor() {
    this.converter = new BlueprintConverter();
    this.componentRegistry = ComponentRegistry.getInstance();
    registerDefaultComponents();
  }

  static getInstance(): BlueprintFactory {
    if (!BlueprintFactory.instance) {
      BlueprintFactory.instance = new BlueprintFactory();
    }
    return BlueprintFactory.instance;
  }

  createEntity(blueprint: AnyBlueprint, config: BlueprintEntityConfig): BlueprintEntity {
    const definition = this.converter.convert(blueprint);

    const entity = new BlueprintEntity(
      definition,
      config.rigidBodyRef,
      config.innerGroupRef,
      config.outerGroupRef,
      config.animationClips,
    );

    return entity;
  }

  async createFromId(
    blueprintId: string,
    config: BlueprintEntityConfig,
  ): Promise<BlueprintEntity | null> {
    const blueprint = blueprintRegistry.get(blueprintId);

    if (!blueprint) {
      logger.error(`Blueprint not found: ${blueprintId}`);
      return null;
    }

    return this.createEntity(blueprint, config);
  }

  createFromDefinition(
    definition: BlueprintDefinition,
    config: BlueprintEntityConfig,
  ): BlueprintEntity {
    return new BlueprintEntity(
      definition,
      config.rigidBodyRef,
      config.innerGroupRef,
      config.outerGroupRef,
      config.animationClips,
    );
  }

  registerComponentFactory(type: string, factory: ComponentFactory): void {
    this.componentRegistry.register(type, factory);
  }

  getAvailableComponentTypes(): string[] {
    return this.componentRegistry.getAllTypes();
  }
}
