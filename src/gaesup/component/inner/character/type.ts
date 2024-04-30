import { callbackType } from "../../../controller/initialize/callback/type";
import { groundRayType } from "../../../controller/type";
import { passiveCharacterPropsType } from "../../passive/character/type";
import { componentTypeString, innerRefType } from "../../passive/type";

// 내부 정의
export type characterInnerType = {
  componentType: componentTypeString;
  isActive?: boolean;
  groundRay: groundRayType;
} & passiveCharacterPropsType &
  innerRefType &
  callbackType;
