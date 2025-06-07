import { ridingType, rigidBodyRefType } from '../common/types';

export type airplaneUrlType = {
  wheelUrl?: string;
};

export type airplaneInnerType = rigidBodyRefType & ridingType & airplaneUrlType;
