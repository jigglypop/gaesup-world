import { CSSProperties } from "react";
import * as THREE from "three";

export type minimapPropsType = {
  text: string;
  center: THREE.Vector3;
  size: THREE.Vector3;
};

export type minimapInnerType = {
  on: boolean;
  ratio?: number;
  props: {
    [key: string]: minimapPropsType;
  };
};

export type minimapType = {
  on: boolean;
  ratio?: number;
  minimapStyle?: CSSProperties;
  outerStyle?: CSSProperties;
  innerStyle?: CSSProperties;
  textStyle?: CSSProperties;
  objectStyle?: Omit<CSSProperties, "width" | "height" | "transform">;
  avatarStyle?: CSSProperties;
};
