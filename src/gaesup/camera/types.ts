import * as THREE from 'three';
import { gaesupWorldContextType } from '../atoms/types';
import { CameraOptionType } from '../types';

export interface CameraPropType {
  state?: { camera?: THREE.Camera };
  worldContext: Partial<gaesupWorldContextType>;
  cameraOption: CameraOptionType;
}

export type CameraControlFunction = (prop: CameraPropType) => void;
