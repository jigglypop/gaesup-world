import { RootState } from '@react-three/fiber';
import * as THREE from 'three';
import {
  activeStateType,
  animationAtomType,
  animationStateType,
  keyControlType,
  statesType,
} from '../../../world/context/type';
import { actionsType } from '../../type';

export type callbackPropType = {
  activeState: activeStateType;
  states: statesType;
  control: keyControlType;
  subscribe: (props: animationAtomType) => void;
};

export type onFramePropType = callbackPropType & RootState;
export type onAnimatePropType = onFramePropType & {
  actions: {
    [x: string]: THREE.AnimationAction | null;
  };
  animationState: animationStateType;
  playAnimation: (tag: keyof actionsType, key: string) => void;
};

export type callbackType = {
  onReady?: (prop: callbackPropType) => void;
  onFrame?: (prop: onFramePropType) => void;
  onDestroy?: (prop: callbackPropType) => void;
  onAnimate?: (prop: onAnimatePropType) => void;
};
