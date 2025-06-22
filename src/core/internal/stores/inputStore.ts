import { createStore } from 'zustand/vanilla';

interface KeyboardState {
  forward: boolean;
  backward: boolean;
  leftward: boolean;
  rightward: boolean;
  shift: boolean;
  space: boolean;
  keyZ: boolean;
  keyR: boolean;
  keyF: boolean;
  keyE: boolean;
  escape: boolean;
}

interface MouseState {
  x: number;
  y: number;
  angle: number;
  isActive: boolean;
  shouldRun: boolean;
  target: { x: number; y: number; z: number };
}

interface GamepadState {
  connected: boolean;
  leftStick: { x: number; y: number };
  rightStick: { x: number; y: number };
  buttons: Record<string, boolean>;
}

interface InputState {
  keyboard: KeyboardState;
  mouse: MouseState;
  gamepad: GamepadState;
}

interface InputActions {
  setKeyboard: (updates: Partial<KeyboardState>) => void;
  setMouse: (updates: Partial<MouseState>) => void;
  setGamepad: (updates: Partial<GamepadState>) => void;
  resetKeyboard: () => void;
  resetMouse: () => void;
  resetAll: () => void;
}

type InputStore = InputState & InputActions;

const initialKeyboardState: KeyboardState = {
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

const initialMouseState: MouseState = {
  x: 0,
  y: 0,
  angle: 0,
  isActive: false,
  shouldRun: false,
  target: { x: 0, y: 0, z: 0 },
};

const initialGamepadState: GamepadState = {
  connected: false,
  leftStick: { x: 0, y: 0 },
  rightStick: { x: 0, y: 0 },
  buttons: {},
};

export const inputStore = createStore<InputStore>((set) => ({
  keyboard: { ...initialKeyboardState },
  mouse: { ...initialMouseState },
  gamepad: { ...initialGamepadState },
  
  setKeyboard: (updates) =>
    set((state) => ({
      keyboard: { ...state.keyboard, ...updates },
    })),
    
  setMouse: (updates) =>
    set((state) => ({
      mouse: { ...state.mouse, ...updates },
    })),
    
  setGamepad: (updates) =>
    set((state) => ({
      gamepad: { ...state.gamepad, ...updates },
    })),
    
  resetKeyboard: () =>
    set(() => ({
      keyboard: { ...initialKeyboardState },
    })),
    
  resetMouse: () =>
    set(() => ({
      mouse: { ...initialMouseState },
    })),
    
  resetAll: () =>
    set(() => ({
      keyboard: { ...initialKeyboardState },
      mouse: { ...initialMouseState },
      gamepad: { ...initialGamepadState },
    })),
}));

export const getInput = () => inputStore.getState();
export const getKeyboard = () => inputStore.getState().keyboard;
export const getMouse = () => inputStore.getState().mouse;
export const getGamepad = () => inputStore.getState().gamepad;

export const handleKeyDown = (code: string) => {
  const { setKeyboard } = inputStore.getState();
  const keyMap: Record<string, keyof KeyboardState> = {
    'KeyW': 'forward',
    'ArrowUp': 'forward',
    'KeyS': 'backward',
    'ArrowDown': 'backward',
    'KeyA': 'leftward',
    'ArrowLeft': 'leftward',
    'KeyD': 'rightward',
    'ArrowRight': 'rightward',
    'ShiftLeft': 'shift',
    'ShiftRight': 'shift',
    'Space': 'space',
    'KeyZ': 'keyZ',
    'KeyR': 'keyR',
    'KeyF': 'keyF',
    'KeyE': 'keyE',
    'Escape': 'escape',
  };
  
  const key = keyMap[code];
  if (key) {
    setKeyboard({ [key]: true });
  }
};

export const handleKeyUp = (code: string) => {
  const { setKeyboard } = inputStore.getState();
  const keyMap: Record<string, keyof KeyboardState> = {
    'KeyW': 'forward',
    'ArrowUp': 'forward',
    'KeyS': 'backward',
    'ArrowDown': 'backward',
    'KeyA': 'leftward',
    'ArrowLeft': 'leftward',
    'KeyD': 'rightward',
    'ArrowRight': 'rightward',
    'ShiftLeft': 'shift',
    'ShiftRight': 'shift',
    'Space': 'space',
    'KeyZ': 'keyZ',
    'KeyR': 'keyR',
    'KeyF': 'keyF',
    'KeyE': 'keyE',
    'Escape': 'escape',
  };
  const key = keyMap[code];
  if (key) {
    setKeyboard({ [key]: false });
  }
};

if (process.env.NODE_ENV === 'development') {
  (window as any).__GAESUP_INPUT__ = {
    getState: () => inputStore.getState(),
    keyboard: getKeyboard,
    mouse: getMouse,
    gamepad: getGamepad,
    reset: () => inputStore.getState().resetAll(),
  };
}
