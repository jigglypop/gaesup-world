import { ReactNode } from 'react';
import * as THREE from 'three';
import { dispatchType } from '../utils/type';
import { gaesupWorldContextType } from './context/type';

export type gaesupWorldInitType = {
  value: gaesupWorldContextType;
  dispatch: dispatchType<gaesupWorldContextType>;
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
  urls?: urlsType;
  mode?: modeType;
  debug?: boolean;
  cameraOption?: cameraOptionType;
  block?: blockType;
  clickerOption?: clickerOptionType;
  performance?: PerformanceMonitorConfig;
};
