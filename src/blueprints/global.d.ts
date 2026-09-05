import type { AnimationClip, Camera, Scene } from 'three';

type BlueprintKeyboardState = {
  forward?: boolean;
  backward?: boolean;
  leftward?: boolean;
  rightward?: boolean;
  space?: boolean;
  shift?: boolean;
};

type BlueprintMouseState = {
  angle?: number;
};

declare global {
  interface Window {
    __camera?: Camera;
    __scene?: Scene;
    __keyboardState?: BlueprintKeyboardState;
    __mouseState?: BlueprintMouseState;
    __loadedAnimations?: Record<string, AnimationClip>;
  }
}

export {};
