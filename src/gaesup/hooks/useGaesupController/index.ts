import { useContext } from 'react';
import { useAtomValue } from 'jotai';
import { GaesupContext } from '../../context';
import { urlsAtom } from '../../atoms';
import { gaesupPassivePropsType } from './types';

export function useGaesupController(): gaesupPassivePropsType {
  const worldContext = useContext(GaesupContext);
  const urls = useAtomValue(urlsAtom);

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
