import { RootState } from '@react-three/fiber';
import { AnimationAction } from 'three';
import { AnimationAtomType, AnimationStateType, ActionsType } from '../animation';
import { ActiveStateType, StatesType } from '../world';
import { KeyControlType } from '../base';

/**
 * 콜백 속성 타입
 */
export type CallbackPropType = {
  activeState: ActiveStateType;
  states: StatesType;
  control: KeyControlType;
  subscribe: (atom: AnimationAtomType) => void;
};

/**
 * 프레임 콜백 속성 타입
 */
export type OnFramePropType = CallbackPropType & RootState;

/**
 * 애니메이션 콜백 속성 타입
 */
export type OnAnimatePropType = OnFramePropType & {
  actions: {
    [x: string]: AnimationAction | null;
  };
  animationState: AnimationStateType;
  playAnimation: (tag: keyof ActionsType, key: string) => void;
};

/**
 * 콜백 타입
 */
export type CallbackType = {
  onReady?: (prop: CallbackPropType) => void;
  onFrame?: (prop: OnFramePropType) => void;
  onDestory?: (prop: CallbackPropType) => void;
  onAnimate?: (prop: OnAnimatePropType) => void;
};
