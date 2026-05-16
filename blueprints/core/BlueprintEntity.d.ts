import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { Group } from 'three';
import { BlueprintDefinition, IComponent } from './types';
export declare class BlueprintEntity {
    private id;
    private blueprint;
    private components;
    private context;
    constructor(blueprint: BlueprintDefinition, rigidBodyRef: RefObject<RapierRigidBody>, innerGroupRef?: RefObject<Group>, outerGroupRef?: RefObject<Group>);
    private createComponents;
    update(deltaTime: number): void;
    getComponent<T extends IComponent>(type: string): T | undefined;
    getComponents<T extends IComponent>(type: string): T[];
    addComponent(component: IComponent): void;
    removeComponent(type: string): void;
    dispose(): void;
    getId(): string;
    getBlueprint(): BlueprintDefinition;
}
