import { ReactNode } from 'react';

import { RigidBodyProps } from '@react-three/rapier';
import * as THREE from 'three';

export interface ControllerWrapperProps {
  children?: ReactNode;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
  physics?: RigidBodyProps;
  controllerId?: string;
  inputMode?: 'keyboard' | 'gamepad' | 'touch';
  enableDebug?: boolean;
  [key: string]: unknown;
}

export interface ControllerGroupProps {
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
  [key: string]: unknown;
}
