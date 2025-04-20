import { CSSProperties, ReactElement } from 'react';
import * as THREE from 'three';

export type minimapPropsType = {
  type: 'normal' | 'ground';
  text?: string;
  center: THREE.Vector3;
  size: THREE.Vector3;
  children?: ReactElement;
  position?: THREE.Vector3;
};

export type minimapInnerType = {
  props: {
    [key: string]: minimapPropsType;
  };
};

export type minimapType = {
  [key in
    | 'minimapStyle'
    | 'minimapOuterStyle'
    | 'minimapInnerStyle'
    | 'minimapObjectStyle'
    | 'textStyle'
    | 'objectStyle'
    | 'avatarStyle'
    | 'directionStyle'
    | 'scaleStyle'
    | 'imageStyle'
    | 'plusMinusStyle']?: CSSProperties;
} & {
  minScale?: number;
  maxScale?: number;
  blockScale?: boolean;
  scale?: number;
  angle?: number;
  blockRotate?: boolean;
  blockScaleControl?: boolean;
  isImage?: boolean;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  onRotationChange?: (angle: number) => void;
};
export interface MinimapProps {
  scale?: number;
  minScale?: number;
  maxScale?: number;
  blockScale?: boolean;
  blockScaleControl?: boolean;
  blockRotate?: boolean;
  angle?: number;
  minimapStyle?: React.CSSProperties;
  minimapInnerStyle?: React.CSSProperties;
  textStyle?: React.CSSProperties;
  minimapObjectStyle?: React.CSSProperties;
  avatarStyle?: React.CSSProperties;
  scaleStyle?: React.CSSProperties;
  directionStyle?: React.CSSProperties;
  plusMinusStyle?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
  onRotationChange?: (angle: number) => void;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Euler {
  x: number;
  y: number;
  z: number;
}

export interface Size {
  x: number;
  z: number;
}

export interface MinimapObject {
  center: Position;
  size: Size;
  text?: string;
}

export interface MinimapState {
  props: Record<string, MinimapObject>;
}

export interface ActiveState {
  position: Position;
  euler: Euler;
}

export interface Mode {
  control: 'normal' | string;
}
