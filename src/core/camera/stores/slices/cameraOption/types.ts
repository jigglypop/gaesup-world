import { CameraOptionType } from '../../../core/types';

export interface CameraOptionSlice {
  cameraOption: CameraOptionType;
  setCameraOption: (update: Partial<CameraOptionType>) => void;
} 