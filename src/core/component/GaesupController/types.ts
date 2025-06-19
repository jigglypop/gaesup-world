import { ReactNode } from 'react';
import { RigidBodyProps } from '@react-three/rapier';
import * as THREE from 'three';

export interface ControllerGroupProps {
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
  [key: string]: unknown;
}

export interface ControllerOptions {
  lerp: {
    cameraTurn: number;
    cameraPosition: number;
  };
}

export interface ControllerCallbacks {
  onReady?: () => void;
  onFrame?: () => void;
  onDestory?: () => void;
  onAnimate?: () => void;
}

export interface ControllerType {
  children?: ReactNode;
  groupProps?: ControllerGroupProps;
  rigidBodyProps?: RigidBodyProps;
  controllerOptions?: ControllerOptions;
  parts?: unknown[];
  onReady?: () => void;
  onFrame?: () => void;
  onDestory?: () => void;
  onAnimate?: () => void;
}
