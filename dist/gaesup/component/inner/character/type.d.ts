import { passiveCharacterPropsType } from "../../passive/character/type";
import { componentTypeString, innerRefType } from "../../passive/type";
export type characterInnerType = {
    componentType: componentTypeString;
    isActive?: boolean;
} & passiveCharacterPropsType & innerRefType;
