import { RigidBodyProps, RigidBodyTypeString, CollisionEnterPayload, CollisionExitPayload } from '@react-three/rapier';
import * as THREE from 'three';
import { RapierCollider, RapierRigidBody } from '@react-three/rapier';
import { ComponentType, ReactNode, RefObject } from 'react';
export interface Part {
    url: string;
    color?: string;
}
export interface GroundRay {
    origin: THREE.Vector3;
    direction: THREE.Vector3;
    length: number;
}
export interface SetGroundRay {
    groundRay: GroundRay;
    length: number;
    colliderRef: RefObject<RapierCollider>;
}
export interface InnerGroupRef {
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
export interface ModelRendererProps {
    nodes: Record<string, THREE.Object3D>;
    color?: string;
    skeleton?: THREE.Skeleton | null;
    url: string;
    offset?: THREE.Vector3;
}
export interface PartsGroupRefProps {
    url: string;
    isActive: boolean;
    componentType: ComponentType;
    currentAnimation?: string;
    color?: string;
    skeleton?: THREE.Skeleton | null;
}
export interface riderRefType {
    url: string;
    children?: React.ReactNode;
    offset?: THREE.Vector3;
}
export interface EntityControllerProps {
    props: unknown;
    children?: React.ReactNode;
}
