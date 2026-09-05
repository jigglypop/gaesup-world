import { AnimationType } from '../core/types';

export type AnimationCommand = {
  type: 'play' | 'stop' | 'pause' | 'setWeight' | 'setSpeed' | 'blend';
  animation?: string;
  weight?: number;
  speed?: number;
  duration?: number;
};

export type AnimationSnapshot = {
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
};

export type AnimationMetrics = {
  activeAnimations: number;
  totalActions: number;
  currentWeight: number;
  mixerTime: number;
  lastUpdate: number;
  blendProgress: number;
};

export interface AnimationBridgeInterface {
  execute(type: AnimationType, command: AnimationCommand): void;
  snapshot(type: AnimationType): AnimationSnapshot;
  subscribe(listener: (snapshot: AnimationSnapshot, type: AnimationType) => void): () => void;
  update(type: AnimationType, deltaTime: number): void;
  dispose(): void;
}

export interface AnimationEvents {
  onAnimationChange: (type: AnimationType, animation: string) => void;
  onAnimationStart: (type: AnimationType, animation: string) => void;
  onAnimationEnd: (type: AnimationType, animation: string) => void;
}
