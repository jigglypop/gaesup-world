import { ComponentType, RefObject } from "react";
import * as THREE from 'three';

export type PartsGroupRefProps = {
    url: string;
    isActive: boolean;
    componentType: ComponentType;
    currentAnimation?: string;
    color?: string;
    skeleton?: THREE.Skeleton | null;
}

export type ModelRendererProps = {
    nodes: Record<string, THREE.Object3D>;
    color: string | undefined;
    skeleton: THREE.Skeleton | null | undefined;
    url: string;
}

export type Part = {
    url: string;
    color?: string;
}
export type InnerGroupRefType = {
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