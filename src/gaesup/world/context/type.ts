import { rideableType } from '../../hooks/useRideable/type';

import {
  ActionsType,
  ActiveStateType,
  AnimationAtomType,
  AnimationStatePropType,
  AnimationStateType,
  BlockType,
  CameraOptionDebugType,
  CameraOptionType,
  ClickerOptionType,
  ClickerType,
  ControlState,
  DispatchType,
  GameStatesType,
  KeyboardControlState,
  ModeType,
  PassiveStateType,
  PortalType,
  PortalsType,
  QueueActionType,
  QueueFunctionType,
  QueueItemType,
  QueueType,
  RefsType,
  ResourceUrlsType,
  SizeType,
  SizesType,
  WheelStateType,
  WheelsStateType,
  actionsType,
} from '../../types';

export type animationPropType = {
  current: string;
  animationNames: actionsType;
  keyControl: {
    [key: string]: boolean;
  };
  store: {};
  default: string;
};

// 하위 호환성을 위해 타입들을 다시 내보내기
export type {
  ActionsType,
  // 기본 타입들
  ActiveStateType,
  AnimationAtomType,
  AnimationStatePropType,
  AnimationStateType,
  BlockType,
  CameraOptionDebugType,
  CameraOptionType,
  ClickerOptionType,
  ClickerType,
  ControlState,
  GameStatesType,
  KeyboardControlState,
  ModeType,
  PassiveStateType,
  PortalType,
  PortalsType,
  QueueActionType,
  QueueFunctionType,
  QueueItemType,
  QueueType,
  RefsType,
  ResourceUrlsType,
  SizeType,
  SizesType,
  WheelStateType,
  WheelsStateType,
};

export type gaesupWorldContextType = {
  activeState: ActiveStateType;
  mode: ModeType;
  urls: ResourceUrlsType;
  states: GameStatesType;
  control: KeyboardControlState<string>;
  refs: RefsType;
  animationState: AnimationStateType;
  clickerOption: ClickerOptionType;
  clicker: ClickerType;
  rideable: { [key: string]: rideableType };
  sizes: SizesType;
  block: BlockType;
};

export type gaesupDisptachType = DispatchType<gaesupWorldContextType>;
