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