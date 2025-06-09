import { callbackType } from '../../../physics/world/types';
import { GroundRayType, PartsType } from '../../../physics/world/types';
import { passiveCharacterPropsType } from '../../passive/character/types';
import { componentTypeString, innerRefType } from '../../passive/types';

// 내부 정의
export type characterInnerType = {
  componentType: componentTypeString;
  isActive?: boolean;
  groundRay: GroundRayType;
  parts?: PartsType;
} & passiveCharacterPropsType &
  innerRefType &
  callbackType;
