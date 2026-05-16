import * as THREE from 'three';
import { CoreBridge } from '@/core/boilerplate';
import { AnimationCommand, AnimationSnapshot, AnimationMetrics } from './types';
import { AnimationSystem } from '../core/AnimationSystem';
import { AnimationType } from '../core/types';
export declare class AnimationBridge extends CoreBridge<AnimationSystem, AnimationSnapshot, AnimationCommand> {
    constructor();
    private setupEngineSubscriptions;
    protected buildEngine(id: string): AnimationSystem | null;
    registerAnimationAction(type: AnimationType, name: string, action: THREE.AnimationAction): void;
    registerAnimations(type: AnimationType, actions: Record<string, THREE.AnimationAction | null>): void;
    unregisterAnimations(type: AnimationType): void;
    protected executeCommand(engine: AnimationSystem, command: AnimationCommand): void;
    protected createSnapshot(engine: AnimationSystem): AnimationSnapshot;
    getMetrics(type: AnimationType): AnimationMetrics | null;
    update(type: AnimationType, deltaTime: number): void;
    execute(type: AnimationType, command: AnimationCommand): void;
    snapshot(type: AnimationType): AnimationSnapshot | null;
}
