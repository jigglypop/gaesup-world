import { CSSProperties } from 'react';
import * as THREE from 'three';

export type teleportType = {
  text?: string;
  position: THREE.Vector3;
  teleportStyle?: CSSProperties;
};
