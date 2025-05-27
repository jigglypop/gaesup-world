/**
 * @deprecated 이 파일의 대부분 타입들은 '../../../types/index.ts'로 이동되었습니다.
 * 하위 호환성을 위해 유지되지만, 새로운 코드에서는 중앙 집중식 타입을 사용하세요.
 */

import { rideableType } from '../../hooks/useRideable/type';
import { minimapInnerType } from '../../tools/minimap/type';

// 중앙 집중식 타입에서 가져오기
import {
  // 기본 타입들
  DispatchType,
  ActiveStateType,
  ModeType,
  ResourceUrlsType,
  GameStatesType,
  CameraOptionType,
  CameraOptionDebugType,
  ControlState,
  KeyboardControlState,
  PortalType,
  PortalsType,
  AnimationAtomType,
  AnimationStatePropType,
  AnimationStateType,
  ClickerType,
  QueueActionType,
  QueueFunctionType,
  QueueItemType,
  QueueType,
  ClickerOptionType,
  WheelStateType,
  WheelsStateType,
  PassiveStateType,
  BlockType,
  SizeType,
  SizesType,
  RefsType,
  ActionsType,
  // 하위 호환성 별칭들
  dispatchType,
  activeStateType,
  modeType,
  urlsType,
  statesType,
  cameraOptionType,
  gaesupCameraOptionDebugType,
  controlType,
  keyControlType,
  portalType,
  portalsType,
  animationAtomType,
  animationStatePropType,
  animationStateType,
  clickerType,
  queueActionType,
  queueFunctionType,
  queueItemtype,
  queueType,
  clickerOptionType,
  wheelStateType,
  wheelsStateType,
  passiveStateType,
  blockType,
  sizeType,
  sizesType,
  refsType,
  actionsType
} from '../../types';

// 하위 호환성을 위한 추가 타입 정의 (중앙 집중식 타입에 없는 것들만)
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
  // 기본 타입들
  ActiveStateType,
  ModeType,
  ResourceUrlsType,
  GameStatesType,
  CameraOptionType,
  CameraOptionDebugType,
  ControlState,
  KeyboardControlState,
  PortalType,
  PortalsType,
  AnimationAtomType,
  AnimationStatePropType,
  AnimationStateType,
  ClickerType,
  QueueActionType,
  QueueFunctionType,
  QueueItemType,
  QueueType,
  ClickerOptionType,
  WheelStateType,
  WheelsStateType,
  PassiveStateType,
  BlockType,
  SizeType,
  SizesType,
  RefsType,
  ActionsType
};

export type gaesupWorldContextType = {
  activeState: ActiveStateType;
  mode: ModeType;
  urls: ResourceUrlsType;
  states: GameStatesType;
  minimap: minimapInnerType;
  control: KeyboardControlState<string>;
  refs: RefsType;
  animationState: AnimationStateType;
  cameraOption: CameraOptionType;
  clickerOption: ClickerOptionType;
  clicker: ClickerType;
  rideable: { [key: string]: rideableType };
  sizes: SizesType;
  block: BlockType;
};

export type gaesupDisptachType = DispatchType<gaesupWorldContextType>;
