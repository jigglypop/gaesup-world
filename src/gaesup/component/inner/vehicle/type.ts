import { ridingType, rigidBodyRefType } from '../common/type';

// vehicle 타입 정의
export type vehicleUrlType = {
  wheelUrl?: string;
};

export type vehicleInnerType = rigidBodyRefType & ridingType & vehicleUrlType;
