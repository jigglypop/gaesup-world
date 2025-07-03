import * as THREE from 'three';
import { ComponentType, ReactNode, RefObject } from 'react';
import { CollisionEnterPayload, CollisionExitPayload, RapierCollider, RapierRigidBody, RigidBodyProps, RigidBodyTypeString } from '@react-three/rapier';
export interface InnerGroupRefType {
    children?: React.ReactNode;
    objectNode: THREE.Object3D;
    animationRef: RefObject<THREE.Object3D>;
    nodes: Record<string, THREE.Object3D>;
    url?: string;
    skeleton?: THREE.Skeleton | null;
    isActive?: boolean;
    ridingUrl?: string;
    offset?: THREE.Vector3;
    parts?: Part;
    isRiderOn?: boolean;
    enableRiding?: boolean;
}

export interface Part {
    url: string;
    color?: string;
}


export interface PhysicsEntityProps {
    onReady?: () => void;
    onFrame?: () => void;
    onDestory?: () => void;
    onAnimate?: () => void;
    url: string;
    name?: string;
    position?: THREE.Vector3 | [number, number, number];
    rotation?: THREE.Euler | [number, number, number];
    isActive: boolean;
    componentType: ComponentType;
    rigidbodyType?: RigidBodyTypeString;
    groundRay?: THREE.Ray;
    rigidBodyProps?: RigidBodyProps;
    parts?: Part[];
    rigidBodyRef?: RefObject<RapierRigidBody>;
    colliderRef?: RefObject<RapierCollider>;
    outerGroupRef?: RefObject<THREE.Group>;
    innerGroupRef?: RefObject<THREE.Group>;
    children?: ReactNode;
    userData?: Record<string, unknown>;
    sensor?: boolean;
    onIntersectionEnter?: (payload: CollisionEnterPayload) => void;
    onIntersectionExit?: (payload: CollisionExitPayload) => void;
    onCollisionEnter?: (payload: CollisionEnterPayload) => void;
    isNotColliding?: boolean;
    isRiderOn?: boolean;
    enableRiding?: boolean;
    ridingUrl?: string;
    offset?: THREE.Vector3;
    currentAnimation?: string;
    controllerOptions?: {
        lerp: {
            cameraTurn: number;
            cameraPosition: number;
        };
    };
}
