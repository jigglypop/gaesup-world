/**
 * @deprecated 이 파일의 대부분 타입들은 '../types/index.ts'로 이동되었습니다.
 * 하위 호환성을 위해 유지되지만, 새로운 코드에서는 중앙 집중식 타입을 사용하세요.
 */

import { airplaneType, characterType, vehicleType } from "./context/type";
import { callbackType } from "./initialize/callback/type";

// 중앙 집중식 타입에서 가져오기
import {
  // 기본 타입들
  CameraRayType,
  ResourceUrlsType,
  GroundRayType,
  SlopeRayType,
  RayType,
  ControllerOptionsType,
  OptionsType,
  PartialOptionsType,
  JumpInnerType,
  JumpConstType,
  JumpPropType,
  AnimationTagType,
  ActionsType,
  RefsType,
  PartType,
  PartsType,
  ControllerOtherPropType,
  // 하위 호환성 별칭들
  cameraRayType,
  urlsType,
  groundRayType,
  slopeRayType,
  rayType,
  controllerOptionsType,
  optionsType,
  partialOptionsType,
  jumpInnerType,
  jumpConstType,
  jumpPropType,
  animationTagType,
  actionsType,
  refsType,
  partType,
  partsType,
  controllerOtherPropType
} from '../types';

// 하위 호환성을 위한 추가 타입 정의 (중앙 집중식 타입에 없는 것들만)

// 하위 호환성을 위해 타입들을 다시 내보내기
export type {
  // 기본 타입들
  CameraRayType,
  ResourceUrlsType,
  GroundRayType,
  SlopeRayType,
  RayType,
  ControllerOptionsType,
  OptionsType,
  PartialOptionsType,
  JumpInnerType,
  JumpConstType,
  JumpPropType,
  AnimationTagType,
  ActionsType,
  RefsType,
  PartType,
  PartsType,
  ControllerOtherPropType
};

export type controllerInnerType = {
  name?: string;
  groundRay: GroundRayType;
  cameraRay: CameraRayType;
  controllerOptions: ControllerOptionsType;
  parts?: PartsType;
} & ControllerOtherPropType &
  RefsType &
  callbackType;

// context로 넘어가는 타입
export type gaesupControllerContextPropType = {
  airplane: airplaneType;
  vehicle: vehicleType;
  character: characterType;
  controllerOptions: ControllerOptionsType;
};

export type controllerType = ControllerOtherPropType &
  ResourceUrlsType &
  Partial<gaesupControllerContextPropType> &
  callbackType & {
    controllerOptions?: ControllerOptionsType;
    parts?: PartsType;
  };
