import { CameraOptionType, CameraType } from '../core/types';

export interface CameraPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: {
    mode: CameraType;
    distance: { x: number; y: number; z: number };
    fov: number;
    smoothing?: {
      position: number;
      rotation: number;
      fov: number;
    };
  };
}

export interface CameraPresetsProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}
