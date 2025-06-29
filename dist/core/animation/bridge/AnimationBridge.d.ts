import { AnimationCommand, AnimationMetrics, AnimationSnapshot, AnimationType } from '../core/types';
import * as THREE from 'three';
export declare class AnimationBridge {
    private engines;
    private eventListeners;
    private unsubscribeFunctions;
    constructor();
    private setupEngineSubscriptions;
    registerAnimationAction(type: AnimationType, name: string, action: THREE.AnimationAction): void;
    registerAnimations(type: AnimationType, actions: Record<string, THREE.AnimationAction | null>): void;
    execute(type: AnimationType, command: AnimationCommand): void;
    snapshot(type: AnimationType): AnimationSnapshot;
    getMetrics(type: AnimationType): AnimationMetrics | null;
    subscribe(listener: (snapshot: AnimationSnapshot, type: AnimationType) => void): () => void;
    private notifyListeners;
    private getEmptySnapshot;
    update(type: AnimationType, deltaTime: number): void;
    dispose(): void;
}
