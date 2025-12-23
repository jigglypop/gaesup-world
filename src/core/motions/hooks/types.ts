import { RefObject } from 'react';

import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { PhysicsEntityProps } from '../entities/types';

export type ResourceUrlsType = Record<string, string | undefined>;

export interface UsePhysicsEntityProps
    extends Pick<
        PhysicsEntityProps,
        | 'onIntersectionEnter'
        | 'onIntersectionExit'
        | 'onCollisionEnter'
        | 'userData'
        | 'outerGroupRef'
        | 'innerGroupRef'
        | 'colliderRef'
        | 'groundRay'
        | 'onFrame'
        | 'onAnimate'
        | 'onReady'
    > {
    rigidBodyRef?: RefObject<RapierRigidBody | null>;
    actions: Record<string, THREE.AnimationAction | null>;
    name?: string;
    isActive?: boolean;
}