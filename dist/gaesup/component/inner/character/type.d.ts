import { callbackType } from "../../../controller/initialize/callback/type";
import { groundRayType, partsType } from "../../../controller/type";
import { passiveCharacterPropsType } from "../../passive/character/type";
import { componentTypeString, innerRefType } from "../../passive/type";
export type characterInnerType = {
    componentType: componentTypeString;
    isActive?: boolean;
    groundRay: groundRayType;
    parts?: partsType;
} & passiveCharacterPropsType & innerRefType & callbackType;
