import * as THREE from 'three';
import { AnimationBridge } from '../bridge/AnimationBridge';
import { AnimationCommand } from '../bridge/types';
import { AnimationType } from '../core/types';
export declare function getGlobalAnimationBridge(): AnimationBridge;
export declare function useAnimationBridge(): {
    bridge: AnimationBridge;
    playAnimation: (type: AnimationType, animation: string) => void;
    stopAnimation: (type: AnimationType) => void;
    executeCommand: (type: AnimationType, command: AnimationCommand) => void;
    registerAnimations: (type: AnimationType, actions: Record<string, THREE.AnimationAction | null>) => void;
    currentType: AnimationType;
    currentAnimation: string;
};
