import * as THREE from 'three';
import { AnimationAction, AnimationClip, AnimationMixer } from 'three';
import { ComponentTypeString } from '../base';

export type AnimationApiType<T extends AnimationClip> = {
  ref: React.MutableRefObject<THREE.Object3D | undefined | null>;
  clips: AnimationClip[];
  mixer: AnimationMixer;
  names: T['name'][];
  actions: {
    [key in T['name']]: AnimationAction | null;
  };
};

export type AnimationTagType = {
  idle: string;
  walk: string;
  run: string;
  jump: string;
  jumpIdle: string;
  jumpLand: string;
  fall: string;
  ride: string;
  land: string;
  sit: string;
  [key: string]: string;
};

export type ActionsType = AnimationTagType & {
  [key: string]: string;
};

export type AnimationAtomType = {
  tag: string;
  condition: () => boolean;
  action?: () => void;
  animationName?: string;
  key?: string;
};

/**
 * 애니메이션 상태 속성
 */
export type AnimationStatePropType = {
  current: string;
  default: string;
  store: Record<
    string,
    {
      condition: () => boolean;
      action?: () => void;
      animationName?: string;
      key?: string;
    }
  >;
};

/**
 * 애니메이션 상태 타입
 */
export type AnimationStateType = {
  [key in ComponentTypeString]?: AnimationStatePropType;
};
