import { ReactNode } from 'react';
import { CameraOptionType } from '../../camera/core/types';
import { ResourceUrlsType } from '../../types/core';

export interface gaesupWorldPropsType {
  children?: ReactNode;
  urls?: Partial<ResourceUrlsType>;
  cameraOption?: CameraOptionType;
  mode?: {
    type: 'character' | 'vehicle' | 'airplane';
    controller?: 'clicker' | 'keyboard' | 'gamepad';
    control?: 'fixed' | 'chase' | 'firstPerson' | 'thirdPerson' | 'topDown';
  };
  debug?: boolean;
}
