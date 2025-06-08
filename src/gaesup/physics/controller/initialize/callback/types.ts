import { RootState } from '@react-three/fiber';
import * as THREE from 'three';
import {
  ActiveStateType,
  AnimationAtomType,
  AnimationStateType,
  KeyboardControlState,
  GameStatesType,
} from '../../../../types';
import { AnimationActions } from '../../../../utils/animation';
import { ActionsType } from '../../../types';

export type callbackPropType = {
  activeState: ActiveStateType;
  states: GameStatesType;
  control: KeyboardControlState<string>;
  subscribe: (props: AnimationAtomType) => void;
};

export type onFramePropType = callbackPropType & RootState;
export type onAnimatePropType = onFramePropType & {
  actions: AnimationActions;
  animationState: AnimationStateType;
  playAnimation: (tag: keyof ActionsType, key: string) => void;
};

export type callbackType = {
  onReady?: (prop: callbackPropType) => void;
  onFrame?: (prop: onFramePropType) => void;
  onDestory?: (prop: callbackPropType) => void;
  onAnimate?: (prop: onAnimatePropType) => void;
};

export type initCallbackType = {
  props: any;
  actions: AnimationActions;
  componentType: string;
  onLoad?: (props: any) => void;
};
