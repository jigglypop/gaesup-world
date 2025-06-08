import { CSSProperties } from 'react';
import * as THREE from 'three';

export type TeleportProps = {
  text?: string;
  position: THREE.Vector3;
  teleportStyle?: CSSProperties;
};
