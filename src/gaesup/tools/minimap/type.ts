import { CSSProperties, ReactElement } from "react";
import * as THREE from "three";

export type minimapPropsType = {
  type: "normal" | "ground";
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
    | "minimapStyle"
    | "outerStyle"
    | "innerStyle"
    | "textStyle"
    | "objectStyle"
    | "avatarStyle"
    | "directionStyle"
    | "scaleStyle"
    | "imageStyle"
    | "plusMinusStyle"]?: CSSProperties;
} & {
  minScale?: number;
  maxScale?: number;
  blockScale?: boolean;
  scale?: number;
  blockRotate?: boolean;
  blockScaleControl?: boolean;
  isImage?: boolean;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
};
