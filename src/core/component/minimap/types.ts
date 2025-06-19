import { CSSProperties, ReactElement } from 'react';
import * as THREE from 'three';

export interface MinimapProps {
  scale?: number;
  minScale?: number;
  maxScale?: number;
  blockScale?: boolean;
  blockScaleControl?: boolean;
  blockRotate?: boolean;
  angle?: number;
  minimapStyle?: CSSProperties;
  scaleStyle?: CSSProperties;
  plusMinusStyle?: CSSProperties;
  size?: number;
  zoom?: number;
  updateInterval?: number;
}

export interface MinimapMarkerProps {
  type: 'normal' | 'ground';
  text?: string;
  center: THREE.Vector3;
  size: THREE.Vector3;
  children?: ReactElement;
  position?: THREE.Vector3;
}

export interface InternalMinimapMarkerProps {
  id: string;
  position: THREE.Vector3 | [number, number, number];
  size?: THREE.Vector3 | [number, number, number];
  text?: string;
  type?: 'normal' | 'ground';
  children?: React.ReactNode;
}

export interface MinimapObjectProps {
  center: { x: number; z: number };
  size: { x: number; z: number };
  text?: string;
}

export interface MinimapPlatformProps {
  children: ReactElement;
  position?: THREE.Vector3;
}
