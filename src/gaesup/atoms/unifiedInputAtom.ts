import { atom } from 'jotai';
import { V3 } from '../utils/vector';
import type {
  KeyboardInputState,
  MouseInputState,
  ClickerOptionState,
  BlockState,
  UnifiedInputState
} from '../../types';

export const unifiedInputAtom = atom<UnifiedInputState>({
  keyboard: {
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
  },

  pointer: {
    target: V3(0, 0, 0),
    angle: Math.PI / 2,
    isActive: false,
    shouldRun: false,
  },

  gamepad: {
    connected: false,
    leftStick: { x: 0, y: 0 },
    rightStick: { x: 0, y: 0 },
    buttons: {},
  },

  blocks: {
    camera: false,
    control: false,
    animation: false,
    scroll: true,
  },

  clickerOption: {
    isRun: true,
    throttle: 100,
    autoStart: false,
    track: false,
    loop: false,
    queue: [],
    line: false,
  },
});


export const movementStateAtom = atom((get) => {
  const input = get(unifiedInputAtom);
  const isKeyboardMoving =
    input.keyboard.forward ||
    input.keyboard.backward ||
    input.keyboard.leftward ||
    input.keyboard.rightward;

  const isPointerMoving = input.pointer.isActive;

  return {
    isMoving: isKeyboardMoving || isPointerMoving,
    isRunning:
      (input.keyboard.shift && isKeyboardMoving) ||
      (input.pointer.shouldRun && isPointerMoving && input.clickerOption.isRun),
    isJumping: input.keyboard.space,
    inputSource: isKeyboardMoving ? 'keyboard' : isPointerMoving ? 'pointer' : 'none',
    isKeyboardMoving,
    isPointerMoving,
  };
});

export const keyboardInputAtom = atom(
  (get) => get(unifiedInputAtom).keyboard,
  (get, set, update: Partial<KeyboardInputState>) => {
    const current = get(unifiedInputAtom);
    set(unifiedInputAtom, {
      ...current,
      keyboard: { ...current.keyboard, ...update },
    });
  },
);

export const pointerInputAtom = atom(
  (get) => get(unifiedInputAtom).pointer,
  (get, set, update: Partial<MouseInputState>) => {
    const current = get(unifiedInputAtom);
    set(unifiedInputAtom, {
      ...current,
      pointer: { ...current.pointer, ...update },
    });
  },
);

export const blockStateAtom = atom(
  (get) => get(unifiedInputAtom).blocks,
  (get, set, update: Partial<BlockState>) => {
    const current = get(unifiedInputAtom);
    set(unifiedInputAtom, {
      ...current,
      blocks: { ...current.blocks, ...update },
    });
  },
);

export const clickerOptionAtom = atom(
  (get) => get(unifiedInputAtom).clickerOption,
  (get, set, update: Partial<ClickerOptionState>) => {
    const current = get(unifiedInputAtom);
    set(unifiedInputAtom, {
      ...current,
      clickerOption: { ...current.clickerOption, ...update },
    });
  },
);

export const controlAtom = atom(
  (get) => get(unifiedInputAtom).keyboard,
  (get, set, update: Partial<KeyboardInputState>) => {
    set(keyboardInputAtom, update);
  },
);

export const blockAtom = atom(
  (get) => get(unifiedInputAtom).blocks,
  (get, set, update: Partial<BlockState>) => {
    set(blockStateAtom, update);
  },
);

export const clickerAtom = atom(
  (get) => get(unifiedInputAtom).pointer,
  (get, set, update: Partial<MouseInputState>) => {
    set(pointerInputAtom, update);
  },
);
