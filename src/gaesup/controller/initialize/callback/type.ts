import { RootState } from '@react-three/fiber';
import * as THREE from 'three';
import {
  ActiveStateType,
  AnimationAtomType,
  AnimationStateType,
  KeyboardControlState,
  GameStatesType,
} from '../../../context';
import { ActionsType } from '../../type';

export type callbackPropType = {
  activeState: ActiveStateType;
  states: GameStatesType;
  control: KeyboardControlState<string>;
  subscribe: (props: AnimationAtomType) => void;
};

export type onFramePropType = callbackPropType & RootState;
export type onAnimatePropType = onFramePropType & {
  actions: {
    [x: string]: THREE.AnimationAction | null;
  };
  animationState: AnimationStateType;
  playAnimation: (tag: keyof ActionsType, key: string) => void;
};

export type callbackType = {
  onReady?: (prop: callbackPropType) => void;
  onFrame?: (prop: onFramePropType) => void;
  onDestory?: (prop: callbackPropType) => void;
  onAnimate?: (prop: onAnimatePropType) => void;
};
