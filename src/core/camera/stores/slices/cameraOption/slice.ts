import { StateCreator } from 'zustand';
import { CameraOptionSlice } from './types';
import { CAMERA_DEFAULTS } from '../../../../constants';

export const createCameraOptionSlice: StateCreator<CameraOptionSlice, [], [], CameraOptionSlice> = (
  set,
) => ({
  cameraOption: {
    offset: CAMERA_DEFAULTS.OFFSET,
    maxDistance: CAMERA_DEFAULTS.MAX_DISTANCE,
    distance: CAMERA_DEFAULTS.DISTANCE,
    xDistance: CAMERA_DEFAULTS.X_DISTANCE,
    yDistance: CAMERA_DEFAULTS.Y_DISTANCE,
    zDistance: CAMERA_DEFAULTS.Z_DISTANCE,
    zoom: CAMERA_DEFAULTS.ZOOM,
    target: CAMERA_DEFAULTS.TARGET,
    position: CAMERA_DEFAULTS.POSITION,
    focus: CAMERA_DEFAULTS.FOCUS,
    enableCollision: CAMERA_DEFAULTS.ENABLE_COLLISION,
    collisionMargin: CAMERA_DEFAULTS.COLLISION_MARGIN,
    smoothing: {
      position: CAMERA_DEFAULTS.SMOOTHING.POSITION,
      rotation: CAMERA_DEFAULTS.SMOOTHING.ROTATION,
      fov: CAMERA_DEFAULTS.SMOOTHING.FOV,
    },
    fov: CAMERA_DEFAULTS.FOV,
    minFov: CAMERA_DEFAULTS.MIN_FOV,
    maxFov: CAMERA_DEFAULTS.MAX_FOV,
    bounds: {
      minY: CAMERA_DEFAULTS.BOUNDS.MIN_Y,
      maxY: CAMERA_DEFAULTS.BOUNDS.MAX_Y,
    },
    modeSettings: {},
  },
  setCameraOption: (update) =>
    set((state) => ({
      cameraOption: { ...state.cameraOption, ...update },
    })),
}); 