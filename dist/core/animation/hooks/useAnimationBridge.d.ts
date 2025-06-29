import { AnimationBridge } from '../bridge/AnimationBridge';
import { AnimationType, AnimationCommand } from '../core/types';
import * as THREE from 'three';
export declare function getGlobalAnimationBridge(): AnimationBridge;
export declare function useAnimationBridge(): {
    bridge: AnimationBridge | null;
    playAnimation: (type: AnimationType, animation: string) => void;
    stopAnimation: (type: AnimationType) => void;
    executeCommand: (type: AnimationType, command: AnimationCommand) => void;
    registerAnimations: (type: AnimationType, actions: Record<string, THREE.AnimationAction | null>) => void;
    currentType: AnimationType;
    currentAnimation: any;
};
