import { activeStateType, modeType } from "../../world/context/type";
export type passiveCharacterType = {
    mode: modeType;
    state: activeStateType;
    current: string;
    url: string;
};
export type passiveCharacterInnerType = {
    current: string;
    url: string;
};
