import { callbackType } from '../../../controller/initialize/callback/type';
import { groundRayType, partsType } from '../../../controller/type';
import { passiveCharacterPropsType } from '../../passive/character/types';
import { componentTypeString, innerRefType } from '../../passive/types';

// 내부 정의
export type characterInnerType = {
  componentType: componentTypeString;
  isActive?: boolean;
  groundRay: groundRayType;
  parts?: partsType;
} & passiveCharacterPropsType &
  innerRefType &
  callbackType;
