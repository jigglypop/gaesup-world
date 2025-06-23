import { ReactNode } from 'react';

export interface WorldPropsType {
  type?: 'normal' | 'ground' | 'target' | 'special';
  text?: string;
  position?: [number, number, number];
  children: ReactNode;
  interactive?: boolean;
  showMinimap?: boolean;
  onClick?: (event: any) => void;
  onHover?: (event: any) => void;
  onInteract?: (action: string) => void;
}
