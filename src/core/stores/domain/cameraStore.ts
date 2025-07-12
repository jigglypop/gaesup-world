import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { CameraOptionSlice } from '@core/camera/stores/slices/cameraOption';
import { createCameraOptionSlice } from '@core/camera/stores/slices/cameraOption';

export type CameraStore = CameraOptionSlice;

export const useCameraStore = create<CameraStore>()(
  devtools(
    subscribeWithSelector(
      createCameraOptionSlice
    ),
    { name: 'camera-store' }
  )
); 