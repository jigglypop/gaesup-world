import { useEffect } from 'react';
import * as THREE from 'three';

export interface EntityLifecycleOptions {
  onReady?: () => void;
  onFrame?: () => void;
  onAnimate?: () => void;
  actions?: Record<string, THREE.AnimationAction | null>;
}

export function useEntityLifecycle(options: EntityLifecycleOptions) {
  const { onReady, onFrame, onAnimate, actions } = options;

  // onReady 콜백
  useEffect(() => {
    if (onReady) onReady();
  }, [onReady]);

  // 프레임 핸들러
  useEffect(() => {
    let animationId: number;
    const frameHandler = () => {
      if (onFrame) onFrame();
      if (onAnimate && actions) onAnimate();
      animationId = requestAnimationFrame(frameHandler);
    };

    if (onFrame || (onAnimate && actions)) {
      animationId = requestAnimationFrame(frameHandler);
      return () => {
        cancelAnimationFrame(animationId);
      };
    }
  }, [onFrame, onAnimate, actions]);
} 