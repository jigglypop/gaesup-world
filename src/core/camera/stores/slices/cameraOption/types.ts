import { CameraOptionType } from '../../../core/types';
 
export type CameraOptionSlice = {
  cameraOption: CameraOptionType;
  setCameraOption: (update: Partial<CameraOptionType>) => void;
  replaceCameraOption: (next: CameraOptionType) => void;
};