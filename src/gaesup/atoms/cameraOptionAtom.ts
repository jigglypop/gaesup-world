import { atom } from 'jotai';
import * as THREE from 'three';
import { CameraOptionType } from '../types';
import { V3 } from '../utils/vector';

export const cameraOptionAtom = atom<CameraOptionType>({
  offset: V3(-10, -10, -10),
  maxDistance: -7,
  distance: -1,
  xDistance: 20,
  yDistance: 10,
  zDistance: 20,
  zoom: 1,
  target: V3(0, 0, 0),
  position: V3(-10, 10, -10),
  focus: false,
  enableCollision: false,
  collisionMargin: 0.1,
  smoothing: {
    position: 0.1,
    rotation: 0.1,
    fov: 0.1,
  },
  fov: 75,
  minFov: 10,
  maxFov: 120,
  bounds: {},
  modeSettings: {},
});
