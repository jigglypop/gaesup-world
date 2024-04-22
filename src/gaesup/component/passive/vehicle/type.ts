import { passivePropsType } from "../type";

export type passiveVehiclePropsType = Omit<passivePropsType, "componentType">;
