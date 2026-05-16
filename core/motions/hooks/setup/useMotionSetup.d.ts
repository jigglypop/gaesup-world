import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { ModeType } from '@stores/slices';
import { MotionCommand } from '../../bridge/types';
export declare function useMotionSetup(entityId: string, rigidBodyRef: RefObject<RapierRigidBody>, modeType: ModeType, isActive: boolean): {
    executeMotionCommand: (command: MotionCommand) => void;
    getMotionSnapshot: () => Readonly<import("../..").MotionSnapshot> | null;
};
