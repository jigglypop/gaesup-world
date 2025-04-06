import { ridingType, rigidBodyRefType } from '../common/type';

// airplane 타입 정의
export type airplaneUrlType = {
  wheelUrl?: string;
};

export type airplaneInnerType = rigidBodyRefType & ridingType & airplaneUrlType;
