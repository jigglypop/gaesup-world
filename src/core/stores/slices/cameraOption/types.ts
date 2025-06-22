import { CameraOptionType } from '../../../types/camera';

export interface CameraOptionSlice {
  cameraOption: CameraOptionType;
  setCameraOption: (update: Partial<CameraOptionType>) => void;
}
 