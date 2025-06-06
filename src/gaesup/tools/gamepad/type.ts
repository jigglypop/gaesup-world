import { CSSProperties } from 'react';

export type gamepadType = {
  label?: Record<string, string>;
} & {
  [key in 'gamePadButtonStyle' | 'gamePadStyle' | 'gamePadInnerStyle']?: CSSProperties;
};

export type gameBoyDirectionType = {
  tag: string;
  value: string;
  name: string;
};

export type GamePadButtonType = {
  value: string;
  name: string;
  gamePadButtonStyle?: CSSProperties;
};
