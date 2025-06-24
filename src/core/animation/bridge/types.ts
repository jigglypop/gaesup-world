import { AnimationType, AnimationCommand, AnimationSnapshot } from '../core/types';

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
