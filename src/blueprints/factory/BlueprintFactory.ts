import { RefObject } from 'react';

import { RapierRigidBody } from '@react-three/rapier';
import { Group } from 'three';

import { BlueprintConverter } from './BlueprintConverter';
import { BlueprintEntity } from '../core/BlueprintEntity';
import { ComponentRegistry } from '../core/ComponentRegistry';
import { BlueprintDefinition } from '../core/types';
import { AnyBlueprint } from '../types';

export type BlueprintEntityConfig = {
  rigidBodyRef: RefObject<RapierRigidBody>;
  innerGroupRef?: RefObject<Group>;
  outerGroupRef?: RefObject<Group>;
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
    this.initializeDefaultFactories();
  }

  static getInstance(): BlueprintFactory {
    if (!BlueprintFactory.instance) {
      BlueprintFactory.instance = new BlueprintFactory();
    }
    return BlueprintFactory.instance;
  }

  private initializeDefaultFactories(): void {
    this.registerCharacterFactories();
    this.registerVehicleFactories();
    this.registerAirplaneFactories();
  }

  private registerCharacterFactories(): void {
    this.componentRegistry.register('CharacterMovement', (props) => ({
      type: 'CharacterMovement',
      enabled: true,
      initialize: () => {},
      update: () => {},
      dispose: () => {},
      ...props
    }));

    this.componentRegistry.register('CharacterAnimation', (props) => ({
      type: 'CharacterAnimation',
      enabled: true,
      initialize: () => {},
      update: () => {},
      dispose: () => {},
      ...props
    }));

    this.componentRegistry.register('CharacterPhysics', (props) => ({
      type: 'CharacterPhysics',
      enabled: true,
      initialize: () => {},
      update: () => {},
      dispose: () => {},
      ...props
    }));
  }

  private registerVehicleFactories(): void {
    this.componentRegistry.register('VehicleMovement', (props) => ({
      type: 'VehicleMovement',
      enabled: true,
      initialize: () => {},
      update: () => {},
      dispose: () => {},
      ...props
    }));

    this.componentRegistry.register('VehiclePhysics', (props) => ({
      type: 'VehiclePhysics',
      enabled: true,
      initialize: () => {},
      update: () => {},
      dispose: () => {},
      ...props
    }));
  }

  private registerAirplaneFactories(): void {
    this.componentRegistry.register('AirplaneMovement', (props) => ({
      type: 'AirplaneMovement',
      enabled: true,
      initialize: () => {},
      update: () => {},
      dispose: () => {},
      ...props
    }));

    this.componentRegistry.register('AirplanePhysics', (props) => ({
      type: 'AirplanePhysics',
      enabled: true,
      initialize: () => {},
      update: () => {},
      dispose: () => {},
      ...props
    }));
  }

  createEntity(blueprint: AnyBlueprint, config: BlueprintEntityConfig): BlueprintEntity {
    const definition = this.converter.convert(blueprint);
    
    const entity = new BlueprintEntity(
      definition,
      config.rigidBodyRef,
      config.innerGroupRef,
      config.outerGroupRef
    );

    return entity;
  }

  async createFromId(blueprintId: string, config: BlueprintEntityConfig): Promise<BlueprintEntity | null> {
    const { blueprintRegistry } = await import('../registry');
    const blueprint = blueprintRegistry.get(blueprintId);
    
    if (!blueprint) {
      console.error(`Blueprint not found: ${blueprintId}`);
      return null;
    }

    return this.createEntity(blueprint, config);
  }

  createFromDefinition(definition: BlueprintDefinition, config: BlueprintEntityConfig): BlueprintEntity {
    return new BlueprintEntity(
      definition,
      config.rigidBodyRef,
      config.innerGroupRef,
      config.outerGroupRef
    );
  }

  registerComponentFactory(type: string, factory: (props: any) => any): void {
    this.componentRegistry.register(type, factory);
  }

  getAvailableComponentTypes(): string[] {
    return this.componentRegistry.getAllTypes();
  }
} 