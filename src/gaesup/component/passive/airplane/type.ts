import { passivePropsType } from "../type";

export type passiveAirplanePropsType = Omit<passivePropsType, "componentType">;
