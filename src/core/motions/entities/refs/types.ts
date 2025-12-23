import type { RefObject } from "react";

import * as THREE from 'three';

import type { Part } from '../types';

export type PartsGroupRefProps = {
    url: string;
    isActive: boolean;
    componentType: string;
    currentAnimation?: string | undefined;
    color?: string | undefined;
    skeleton?: THREE.Skeleton | null | undefined;
}

export type ModelRendererProps = {
    nodes: Record<string, THREE.Object3D>;
    color?: string | undefined;
    skeleton?: THREE.Skeleton | null | undefined;
    url: string;
}

export type InnerGroupRefType = {
    children?: React.ReactNode;
    objectNode?: THREE.Object3D;
    animationRef: RefObject<THREE.Object3D | null | undefined>;
    nodes: Record<string, THREE.Object3D>;
    url?: string;
    skeleton?: THREE.Skeleton | null | undefined;
    componentType?: string;
    modelYawOffset?: number;
    isActive?: boolean;
    ridingUrl?: string;
    offset?: THREE.Vector3;
    parts?: Part[];
    isRiderOn?: boolean;
    enableRiding?: boolean;
}