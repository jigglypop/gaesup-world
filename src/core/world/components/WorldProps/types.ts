import { ReactNode } from 'react';

import { ClickEvent } from '@core/types/common';

export type WorldPropsType = {
  type?: 'normal' | 'ground' | 'target' | 'special';
  text?: string;
  position?: [number, number, number];
  children: ReactNode;
  interactive?: boolean;
  showMinimap?: boolean;
  onClick?: (event: ClickEvent) => void;
  onHover?: (event: ClickEvent) => void;
  onInteract?: (action: string) => void;
}
