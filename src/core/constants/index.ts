import * as THREE from 'three';
import { V3 } from '../utils/vector';

export const PRETENDARD_FONT =
  "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif";

export const MINIMAP_SIZE_PX = 200;
export const DEFAULT_SCALE = 0.5;
export const MIN_SCALE = 0.1;
export const MAX_SCALE = 2;
export const UPDATE_THRESHOLD = 0.15;
export const ROTATION_THRESHOLD = 0.03;
export const UPDATE_INTERVAL = 50;

export const KEY_MAPPING = {
  KeyW: 'forward',
  KeyA: 'leftward',
  KeyS: 'backward',
  KeyD: 'rightward',
  ArrowUp: 'forward',
  ArrowDown: 'backward',
  ArrowLeft: 'leftward',
  ArrowRight: 'rightward',
  Space: 'space',
  ShiftLeft: 'shift',
  ShiftRight: 'shift',
  KeyZ: 'keyZ',
  KeyR: 'keyR',
  KeyF: 'keyF',
  KeyE: 'keyE',
  Escape: 'escape',
} as const;

export const UNIVERSAL_KEYS = Object.keys(KEY_MAPPING);

export const DEFAULT_KEYBOARD_STATE = {
  forward: false,
  backward: false,
  leftward: false,
  rightward: false,
  shift: false,
  space: false,
  keyZ: false,
  keyR: false,
  keyF: false,
  keyE: false,
  escape: false,
};


