import * as THREE from 'three';
import { AnimationEngineState, AnimationMetrics, AnimationEngineCallback } from './types';
export declare class AnimationEngine {
    private state;
    private metrics;
    private callbacks;
    constructor();
    subscribe(callback: AnimationEngineCallback): () => void;
    private notifyCallbacks;
    initializeMixer(object: THREE.Object3D): void;
    addAnimation(name: string, clip: THREE.AnimationClip): void;
    registerAction(name: string, action: THREE.AnimationAction): void;
    playAnimation(name: string, fadeInDuration?: number): void;
    stopAnimation(): void;
    setWeight(weight: number): void;
    setTimeScale(scale: number): void;
    update(deltaTime: number): void;
    getCurrentAnimation(): string;
    getAnimationList(): string[];
    getMetrics(): AnimationMetrics;
    getState(): Readonly<AnimationEngineState>;
    private updateMetrics;
    dispose(): void;
}
