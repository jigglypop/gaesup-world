import { CameraType } from '../core/types';

export interface CameraControllerProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showLabels?: boolean;
  compact?: boolean;
}

export interface CameraModeConfig {
  value: CameraType;
  label: string;
  icon: string;
}
