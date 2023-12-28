import * as THREE from "three";
import { VECssType } from "../type";

export type minimapPropsType = {
  text?: string;
  center: THREE.Vector3;
  size: THREE.Vector3;
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
    | "plusMinusStyle"]?: Partial<VECssType>;
} & {
  minScale?: number;
  maxScale?: number;
  blockScale?: boolean;
  scale?: number;
  blockRotate?: boolean;
  blockScaleControl?: boolean;
};
