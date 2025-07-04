import * as THREE from 'three';
import { RapierCollider } from '@react-three/rapier';
import { ComponentType, RefObject } from 'react';
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
export interface ModelRendererProps {
    nodes: Record<string, THREE.Object3D>;
    color?: string;
    skeleton: THREE.Skeleton;
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
