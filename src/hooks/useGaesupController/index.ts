// "Please use this only as a subcomponent of GaesupWorld."

import { useContext } from 'react';
import { GaesupWorldContext } from '../../world/context';
import { ActiveStateType, ModeType, UrlsType } from '../../types';

export function useGaesupController(): GaesupPassivePropsType {
  const worldContext = useContext(GaesupWorldContext);
  return {
    state: worldContext.activeState,
    mode: worldContext.mode,
    urls: worldContext.urls,
    currentAnimation: worldContext.mode.type
      ? worldContext.animationState[worldContext.mode.type].current
      : 'idle',
  };
}

/**
 * Gaesup 패시브 컴포넌트의 공통 속성 타입
 */
export type GaesupPassivePropsType = {
  state: ActiveStateType;
  mode: ModeType;
  urls: UrlsType;
  currentAnimation: string;
  children?: React.ReactNode;
};

// 기존 타입에 대한 별칭 (호환성 유지)
/** @deprecated 대문자 시작 이름인 GaesupPassivePropsType을 대신 사용하세요 */
export type gaesupPassivePropsType = GaesupPassivePropsType;
