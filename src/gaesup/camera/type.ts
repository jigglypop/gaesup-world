import * as THREE from 'three';
import { CameraOptionType, gaesupWorldContextType } from '../world/context/type';

export interface CameraPropType {
  state?: { camera?: THREE.Camera };
  worldContext: Partial<gaesupWorldContextType>;
  cameraOption: CameraOptionType;
}


export type CameraControlFunction = (prop: CameraPropType) => void;
