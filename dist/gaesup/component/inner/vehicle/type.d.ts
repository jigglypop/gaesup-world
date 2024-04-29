import { ridingType, rigidBodyRefType } from "../common/type";
export type vehicleUrlType = {
    wheelUrl?: string;
};
export type vehicleInnerType = rigidBodyRefType & ridingType & vehicleUrlType;
