import * as THREE from 'three';
import { AbstractSystem } from '@/core/boilerplate/entity/AbstractSystem';
import { SystemContext } from '@/core/boilerplate/entity/BaseSystem';
import { BaseState, BaseMetrics } from '@/core/boilerplate/types';
import { AnimationSystemState, AnimationSystemCallback } from './types';
import { AnimationMetrics } from '../bridge/types';
interface AnimationSystemMetrics extends BaseMetrics, AnimationMetrics {
}
interface AnimationSystemStateExt extends BaseState, AnimationSystemState {
}
export declare class AnimationSystem extends AbstractSystem<AnimationSystemStateExt, AnimationSystemMetrics> {
    private callbacks;
    private systemType;
    constructor(type?: string);
    getSystemType(): string;
    subscribe(callback: AnimationSystemCallback): () => void;
    private notifyCallbacks;
    initializeMixer(object: THREE.Object3D): void;
    addAnimation(name: string, clip: THREE.AnimationClip): void;
    registerAction(name: string, action: THREE.AnimationAction): void;
    playAnimation(name: string, fadeInDuration?: number): void;
    stopAnimation(): void;
    setWeight(weight: number): void;
    setTimeScale(scale: number): void;
    protected performUpdate(context: SystemContext): void;
    protected createUpdateArgs(context: SystemContext): SystemContext;
    updateAnimation(deltaTime: number): void;
    getCurrentAnimation(): string;
    getAnimationList(): string[];
    getMetrics(): AnimationSystemMetrics;
    getState(): Readonly<AnimationSystemStateExt>;
    protected updateMetrics(deltaTime: number): void;
    clearActions(): void;
    protected onDispose(): void;
}
export {};
