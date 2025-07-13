import * as THREE from 'three';
import { AnimationMetrics } from '../bridge/types';

export type AnimationPreset = {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: {
    animation: string;
    speed: number;
    weight: number;
    loop: boolean;
    fadeInDuration: number;
    fadeOutDuration: number;
  };
}

export type AnimationType = 'character' | 'vehicle' | 'airplane' | 'robot';

export type AnimationConfig = {
  type: AnimationType;
  defaultAnimation: string;
  blendDuration: number;
  autoPlay: boolean;
}

export interface EntityAnimationStates {
  character: AnimationState;
  vehicle: AnimationState;
  airplane: AnimationState;
}

export interface AnimationState {
  current: string;
  default: string;
  store: Record<string, THREE.AnimationAction>;
}

export interface AnimationSystemState {
  currentAnimation: string;
  animationMixer: THREE.AnimationMixer | null;
  actions: Map<string, THREE.AnimationAction>;
  isPlaying: boolean;
  currentWeight: number;
  blendDuration: number;
}

export type AnimationSystemCallback = (metrics: AnimationMetrics) => void;
