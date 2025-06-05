import { ridingType, rigidBodyRefType } from '../common/type';

export type airplaneUrlType = {
  wheelUrl?: string;
};

export type airplaneInnerType = rigidBodyRefType & ridingType & airplaneUrlType;
