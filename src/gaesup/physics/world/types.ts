import { ReactNode } from 'react';
import * as THREE from 'three';
import {
  DispatchType,
  ResourceUrlsType,
  ModeType,
  CameraOptionType,
  ClickerOptionState,
} from '../../types';
import { gaesupWorldContextType } from '../../atoms/types';

export type gaesupWorldInitType = {
  value: gaesupWorldContextType;
  dispatch: DispatchType<gaesupWorldContextType>;
};

export type PerformanceMonitorConfig = {
  enabled?: boolean;
  mode?: 0 | 1 | 2;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  zIndex?: number;
  opacity?: number;
};

export type gaesupWorldPropsType = {
  children: ReactNode;
  startPosition?: THREE.Vector3;
  urls?: ResourceUrlsType;
  mode?: ModeType;
  debug?: boolean;
  cameraOption?: CameraOptionType;
  block?: any;
  clickerOption?: ClickerOptionState;
  performance?: PerformanceMonitorConfig;
};
