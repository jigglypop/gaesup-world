import { V3 } from '../../utils/vector';

export const CAMERA_CONSTANTS = {
  THROTTLE_MS: 16,
  POSITION_THRESHOLD: 0.001,
  TARGET_THRESHOLD: 0.001,
  DEFAULT_LERP_SPEED: 0.1,
  DEFAULT_FOV_LERP: 0.05,
  MIN_FOV: 10,
  MAX_FOV: 120,
  FRAME_RATE_LERP_SPEED: 8.0,
} as const;

export const CAMERA_DEFAULTS = {
  OFFSET: V3(-10, -10, -10),
  MAX_DISTANCE: -7,
  DISTANCE: -1,
  X_DISTANCE: 15,
  Y_DISTANCE: 8,
  Z_DISTANCE: 15,
  ZOOM: 1,
  TARGET: V3(0, 0, 0),
  POSITION: V3(-15, 8, -15),
  FOCUS: false,
  ENABLE_COLLISION: true,
  COLLISION_MARGIN: 0.1,
  SMOOTHING: {
    POSITION: 0.08,
    ROTATION: 0.1,
    FOV: 0.1,
  },
  FOV: 75,
  MIN_FOV: 10,
  MAX_FOV: 120,
  BOUNDS: {
    MIN_Y: 2,
    MAX_Y: 50,
  },
} as const; 