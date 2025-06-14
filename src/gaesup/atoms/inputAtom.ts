import { atom } from 'jotai';
import type {
  BlockState,
  ClickerOptionState,
  KeyboardInputState,
  MouseInputState,
  inputState,
} from '../../types';
import { V3 } from '../utils/vector';

export const inputAtom = atom<inputState>({
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
  const input = get(inputAtom);
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
  (get) => get(inputAtom).keyboard,
  (get, set, update: Partial<KeyboardInputState>) => {
    const current = get(inputAtom);
    set(inputAtom, {
      ...current,
      keyboard: { ...current.keyboard, ...update },
    });
  },
);

export const pointerInputAtom = atom(
  (get) => get(inputAtom).pointer,
  (get, set, update: Partial<MouseInputState>) => {
    const current = get(inputAtom);
    set(inputAtom, {
      ...current,
      pointer: { ...current.pointer, ...update },
    });
  },
);

export const blockStateAtom = atom(
  (get) => get(inputAtom).blocks,
  (get, set, update: Partial<BlockState>) => {
    const current = get(inputAtom);
    set(inputAtom, {
      ...current,
      blocks: { ...current.blocks, ...update },
    });
  },
);

export const clickerOptionAtom = atom(
  (get) => get(inputAtom).clickerOption,
  (get, set, update: Partial<ClickerOptionState>) => {
    const current = get(inputAtom);
    set(inputAtom, {
      ...current,
      clickerOption: { ...current.clickerOption, ...update },
    });
  },
);

export const controlAtom = atom(
  (get) => get(inputAtom).keyboard,
  (_, set, update: Partial<KeyboardInputState>) => {
    set(keyboardInputAtom, update);
  },
);

export const blockAtom = atom(
  (get) => get(inputAtom).blocks,
  (_, set, update: Partial<BlockState>) => {
    set(blockStateAtom, update);
  },
);

export const clickerAtom = atom(
  (get) => get(inputAtom).pointer,
  (_, set, update: Partial<MouseInputState>) => {
    set(pointerInputAtom, update);
  },
);
