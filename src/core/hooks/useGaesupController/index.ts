import { useGaesupContext, useGaesupStore } from '@stores/gaesupStore';
import { gaesupPassivePropsType } from './types';

export function useGaesupController(): gaesupPassivePropsType {
  const worldContext = useGaesupContext();
  const urls = useGaesupStore((state) => state.urls);

  const currentAnimation =
    worldContext.mode?.type && worldContext.animationState
      ? worldContext.animationState[worldContext.mode.type].current
      : 'idle';

  return {
    state: worldContext.activeState || null,
    mode: worldContext.mode || null,
    urls: urls,
    currentAnimation,
  };
}
