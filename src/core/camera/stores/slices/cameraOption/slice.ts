import { StateCreator } from 'zustand';

import { CameraOptionSlice } from './types';
import { CAMERA_DEFAULTS } from '../../../core/constants';

export const createCameraOptionSlice: StateCreator<CameraOptionSlice, [], [], CameraOptionSlice> = (
  set,
) => ({
  cameraOption: {
    xDistance: CAMERA_DEFAULTS.X_DISTANCE,
    yDistance: CAMERA_DEFAULTS.Y_DISTANCE,
    zDistance: CAMERA_DEFAULTS.Z_DISTANCE,
    zoom: CAMERA_DEFAULTS.ZOOM,
    enableZoom: CAMERA_DEFAULTS.ENABLE_ZOOM,
    zoomSpeed: CAMERA_DEFAULTS.ZOOM_SPEED,
    minZoom: CAMERA_DEFAULTS.MIN_ZOOM,
    maxZoom: CAMERA_DEFAULTS.MAX_ZOOM,
    focus: CAMERA_DEFAULTS.FOCUS,
    enableCollision: CAMERA_DEFAULTS.ENABLE_COLLISION,
    collisionMargin: CAMERA_DEFAULTS.COLLISION_MARGIN,
    smoothing: {
      position: CAMERA_DEFAULTS.SMOOTHING.POSITION,
      rotation: CAMERA_DEFAULTS.SMOOTHING.ROTATION,
      fov: CAMERA_DEFAULTS.SMOOTHING.FOV,
    },
    fov: CAMERA_DEFAULTS.FOV,
  },
  setCameraOption: (update) =>
    set((state) => ({
      cameraOption: { ...state.cameraOption, ...update },
    })),
  replaceCameraOption: (next) =>
    set(() => ({
      cameraOption: next,
    })),
});
