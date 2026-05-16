import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { MotionConfig } from '../bridge/types';
import { MotionType } from '../core/system/types';
import { ManagedMotionEntity } from '../entities/ManagedMotionEntity';
export type UseMotionOptions = {
    motionType: MotionType;
    rigidBodyRef: React.RefObject<RapierRigidBody | null>;
    position?: THREE.Vector3;
    autoStart?: boolean;
};
export type UseMotionReturn = {
    entity: ManagedMotionEntity | null;
    move: (movement: THREE.Vector3) => void;
    jump: () => void;
    stop: () => void;
    turn: (direction: number) => void;
    reset: () => void;
    setConfig: (config: MotionConfig) => void;
    enableAutomation: (targetPosition: THREE.Vector3) => void;
    disableAutomation: () => void;
    isGrounded: boolean;
    isMoving: boolean;
    speed: number;
    position: THREE.Vector3 | null;
    velocity: THREE.Vector3 | null;
};
export declare function useMotion(id: string, options: UseMotionOptions): UseMotionReturn;
