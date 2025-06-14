import { useContext } from 'react';
import * as THREE from 'three';
import { useGaesupContext } from '../../atoms';
import { useAtomValue } from 'jotai';
import { urlsAtom } from '../../atoms';
import { gaesupPassivePropsType } from './types';

export function useGaesupController(): gaesupPassivePropsType {
  const worldContext = useGaesupContext();
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
