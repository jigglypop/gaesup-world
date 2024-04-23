import { callbackType } from "../../../controller/initialize/callback/type";
import { passiveCharacterPropsType } from "../../passive/character/type";
import { componentTypeString, innerRefType } from "../../passive/type";

// 내부 정의
export type characterInnerType = {
  componentType: componentTypeString;
  isActive?: boolean;
} & passiveCharacterPropsType &
  innerRefType &
  callbackType;
