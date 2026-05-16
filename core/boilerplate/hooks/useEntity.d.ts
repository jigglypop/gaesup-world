import { RefObject } from 'react';
import type { RapierCollider, RapierRigidBody } from '@react-three/rapier';
import type { Group } from 'three';
import type { GroundRay } from '@core/motions/entities/types';
import type { PhysicsEntityProps } from '@core/motions/entities/types';
import { CollisionHandlerOptions } from './useCollisionHandler';
import { EntityLifecycleOptions } from './useEntityLifecycle';
export interface UseEntityOptions extends CollisionHandlerOptions, EntityLifecycleOptions {
    id?: string;
    rigidBodyRef: RefObject<RapierRigidBody>;
    isActive?: boolean;
    outerGroupRef?: RefObject<Group>;
    innerGroupRef?: RefObject<Group>;
    colliderRef?: RefObject<RapierCollider>;
    groundRay?: GroundRay;
    colliderSize?: PhysicsEntityProps['colliderSize'];
}
export declare function useEntity(options: UseEntityOptions): {
    handleIntersectionEnter: (payload: import("@react-three/rapier").CollisionPayload) => void;
    handleIntersectionExit: (payload: import("@react-three/rapier").CollisionPayload) => void;
    handleCollisionEnter: (payload: import("@react-three/rapier").CollisionEnterPayload) => void;
    executeMotionCommand: (command: import("../..").MotionCommand) => void;
    getMotionSnapshot: () => Readonly<import("../..").MotionSnapshot> | null;
    mode: import("../../stores/slices").ModeState;
};
