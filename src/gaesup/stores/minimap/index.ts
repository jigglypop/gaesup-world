import { CSSProperties } from "react";
import * as THREE from "three";

export type minimapPropsType = {
  text: string;
  center: THREE.Vector3;
  size: THREE.Vector3;
};

export type minimapType = {
  on: boolean;
  ratio?: number;
  props: {
    [key: string]: minimapPropsType;
  };
  minimapStyle?: CSSProperties;
  outerStyle?: CSSProperties;
  innerStyle?: CSSProperties;
  textStyle?: CSSProperties;
  objectStyle?: Omit<CSSProperties, "width" | "height" | "transform">;
  avatarStyle?: CSSProperties;
};

export const minimapDefault = {
  on: true,
  ratio: 0.1,
  props: {},
};
