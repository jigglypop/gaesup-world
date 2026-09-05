export const PHYSICS_CONSTANTS = Object.freeze({
  GRAVITY: -9.81,
  MAX_FALL_SPEED: 50,
  DEFAULT_MASS: 70,
  DEFAULT_FRICTION: 0.5,
  DEFAULT_RESTITUTION: 0.2,
} as const);

export const CAMERA_CONSTANTS = Object.freeze({
  DEFAULT_FOV: 60,
  MIN_FOV: 30,
  MAX_FOV: 90,
  DEFAULT_DISTANCE: 10,
  MIN_DISTANCE: 2,
  MAX_DISTANCE: 50,
  TRANSITION_SPEED: 0.1,
} as const);

export const UI_CONSTANTS = Object.freeze({
  PANEL_MIN_WIDTH: 200,
  PANEL_MIN_HEIGHT: 100,
  PANEL_DEFAULT_WIDTH: 300,
  PANEL_DEFAULT_HEIGHT: 400,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
} as const);

export const GAME_CONSTANTS = Object.freeze({
  MAX_PLAYERS: 100,
  MAX_OBJECTS: 10000,
  UPDATE_INTERVAL: 1000 / 60,
  SAVE_INTERVAL: 60000,
  INTERACTION_DISTANCE: 5,
} as const);

export const STORAGE_KEYS = Object.freeze({
  USER_PREFERENCES: 'user_preferences',
  GAME_STATE: 'game_state',
  CAMERA_SETTINGS: 'camera_settings',
  EDITOR_LAYOUT: 'editor_layout',
} as const); 