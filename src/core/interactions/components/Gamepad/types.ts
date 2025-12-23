import { CSSProperties } from 'react';

export type gamepadType = {
  label?: Record<string, string>;
} & {
  [key in 'gamePadButtonStyle' | 'gamePadStyle' | 'gamePadInnerStyle']?: CSSProperties;
};

export type gameBoyDirectionType = 'direction' | 'action';

export type GamePadButtonType = {
  value: string;
  name: string;
  gamePadButtonStyle?: CSSProperties | undefined;
};

export type GamepadProps = {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'small' | 'medium' | 'large';
  theme?: 'light' | 'dark' | 'glass';
  showLabels?: boolean;
  customButtons?: Array<{
    key: string;
    label: string;
    action: () => void;
  }>;
};
