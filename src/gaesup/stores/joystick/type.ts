import { CSSProperties } from "react";

export type joyStickBallType = {
  x: string;
  y: string;
  position: string;
  background: string;
  boxShadow: string;
};

export type joyStickOriginType = {
  x: number;
  y: number;
  angle: number;
  currentRadius: number;
  originRadius: number;
  isIn: boolean;
  isOn: boolean;
  isCenter: boolean;
  isUp: boolean;
};

export type joyStickType = {
  on?: boolean;
  joyStickBall?: joyStickBallType;
  joyStickOrigin?: joyStickOriginType;
  joyStickStyle?: CSSProperties;
  joyBallStyle?: CSSProperties;
  joyStickInnerStyle?: CSSProperties;
  joyStickBallStyle?: CSSProperties;
};
