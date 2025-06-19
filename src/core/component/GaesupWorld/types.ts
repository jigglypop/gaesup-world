import { ReactNode } from 'react';
import * as THREE from 'three';

export interface CameraOptionType {
  type?: 'orthographic' | 'perspective';
  fov?: number;
  near?: number;
  far?: number;
  zoom?: number;
  position?: THREE.Vector3;
  lookAt?: THREE.Vector3;
  offset?: THREE.Vector3;
  distance?: number;
  enableCollision?: boolean;
}

export interface ResourceUrlsType {
  characterUrl: string;
  vehicleUrl: string;
  airplaneUrl: string;
  wheelUrl: string;
  ridingUrl: string;
}

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
