import { innerRefType } from "../../passive/type";
import { passiveVehiclePropsType } from "../../passive/vehicle/type";
export type activeVehicleInnerType = passiveVehiclePropsType & innerRefType;
