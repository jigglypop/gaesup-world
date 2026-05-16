import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { Group } from 'three';
import { BlueprintEntity } from '../core/BlueprintEntity';
import { BlueprintDefinition, ComponentFactory } from '../core/types';
import { AnyBlueprint } from '../types';
export type BlueprintEntityConfig = {
    rigidBodyRef: RefObject<RapierRigidBody>;
    innerGroupRef?: RefObject<Group>;
    outerGroupRef?: RefObject<Group>;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
};
export declare class BlueprintFactory {
    private static instance;
    private converter;
    private componentRegistry;
    private constructor();
    static getInstance(): BlueprintFactory;
    private initializeDefaultFactories;
    private registerCharacterFactories;
    private registerVehicleFactories;
    private registerAirplaneFactories;
    createEntity(blueprint: AnyBlueprint, config: BlueprintEntityConfig): BlueprintEntity;
    createFromId(blueprintId: string, config: BlueprintEntityConfig): Promise<BlueprintEntity | null>;
    createFromDefinition(definition: BlueprintDefinition, config: BlueprintEntityConfig): BlueprintEntity;
    registerComponentFactory(type: string, factory: ComponentFactory): void;
    getAvailableComponentTypes(): string[];
}
