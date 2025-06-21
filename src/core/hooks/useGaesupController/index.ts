import { useGaesupStore } from '@stores/gaesupStore';
import { gaesupPassivePropsType } from './types';

export function useGaesupController(): gaesupPassivePropsType {
  const activeState = useGaesupStore((state) => state.activeState);
  const mode = useGaesupStore((state) => state.mode);
  const animationState = useGaesupStore((state) => state.animationState);
  const urls = useGaesupStore((state) => state.urls);

  const currentAnimation =
    mode?.type && animationState
      ? animationState[mode.type].current
      : 'idle';

  return {
    state: activeState || null,
    mode: mode || null,
    urls: urls,
    currentAnimation,
  };
}
