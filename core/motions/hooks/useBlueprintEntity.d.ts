import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { Group } from 'three';
import { BlueprintEntity, BlueprintDefinition, IComponent } from '../../../blueprints/core';
export interface UseBlueprintEntityProps {
    blueprint: BlueprintDefinition | string;
    rigidBodyRef: RefObject<RapierRigidBody>;
    innerGroupRef?: RefObject<Group>;
    outerGroupRef?: RefObject<Group>;
    enabled?: boolean;
}
export declare function useBlueprintEntity({ blueprint, rigidBodyRef, innerGroupRef, outerGroupRef, enabled }: UseBlueprintEntityProps): {
    entity: BlueprintEntity | null;
    getComponent: <T extends IComponent>(type: string) => T | undefined;
    addComponent: (component: IComponent) => void | undefined;
    removeComponent: (type: string) => void | undefined;
};
