import * as THREE from 'three';

export interface AnimationPreset {
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

export interface AnimationCommand {
  type: 'play' | 'stop' | 'pause' | 'setWeight' | 'setSpeed' | 'blend';
  animation?: string;
  weight?: number;
  speed?: number;
  duration?: number;
}

export interface AnimationSnapshot {
  currentAnimation: string;
  isPlaying: boolean;
  weight: number;
  speed: number;
  availableAnimations: string[];
  metrics: {
    activeAnimations: number;
    totalActions: number;
    mixerTime: number;
    lastUpdate: number;
  };
}

export type AnimationType = 'character' | 'vehicle' | 'airplane' | 'robot';

export interface AnimationConfig {
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

export interface AnimationEngineState {
  currentAnimation: string;
  animationMixer: THREE.AnimationMixer | null;
  actions: Map<string, THREE.AnimationAction>;
  isPlaying: boolean;
  currentWeight: number;
  blendDuration: number;
}

export interface AnimationMetrics {
  activeAnimations: number;
  totalActions: number;
  currentWeight: number;
  mixerTime: number;
  lastUpdate: number;
  blendProgress: number;
}

export type AnimationEngineCallback = (metrics: AnimationMetrics) => void;
