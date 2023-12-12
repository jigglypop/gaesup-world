import { CSSProperties } from "react";

export type joyStickBallType = {
  left: string;
  top: string;
};

export type joyStickOriginType = {
  x: number;
  y: number;
  angle: number;
  currentRadius: number;
  originRadius: number;
  isIn: boolean;
  isOn: boolean;
  isUp: boolean;
  isCenter: boolean;
};

export type joyStickInnerType = {
  on?: boolean;
  joyStickBall?: joyStickBallType;
  joyStickOrigin?: joyStickOriginType;
};

export type joyStickType = {
  on?: boolean;
  joyStickStyle?: CSSProperties;
  joyBallStyle?: CSSProperties;
  joyStickInnerStyle?: CSSProperties;
  joyStickBallStyle?: CSSProperties;
};
