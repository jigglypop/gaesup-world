import { StateCreator } from 'zustand';
import { CameraOptionType } from '../../types';
import { V3 } from '../../utils/vector';

export interface CameraOptionSlice {
  cameraOption: CameraOptionType;
  setCameraOption: (update: Partial<CameraOptionType>) => void;
}
export const createCameraOptionSlice: StateCreator<CameraOptionSlice, [], [], CameraOptionSlice> = (
  set,
) => ({
  cameraOption: {
    offset: V3(-10, -10, -10),
    maxDistance: -7,
    distance: -1,
    xDistance: 15,
    yDistance: 8,
    zDistance: 15,
    zoom: 1,
    target: V3(0, 0, 0),
    position: V3(-15, 8, -15),
    focus: false,
    enableCollision: true,
    collisionMargin: 0.1,
    smoothing: {
      position: 0.08,
      rotation: 0.1,
      fov: 0.1,
    },
    fov: 75,
    minFov: 10,
    maxFov: 120,
    bounds: {
      minY: 2,
      maxY: 50,
    },
    modeSettings: {},
  },
  setCameraOption: (update) =>
    set((state) => ({
      cameraOption: { ...state.cameraOption, ...update },
    })),
});
