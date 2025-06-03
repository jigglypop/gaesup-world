import { atom } from 'jotai';
import * as THREE from 'three';
import { V3 } from '../utils/vector';

// 개별 타입 정의 (export)
export interface KeyboardInputState {
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

export interface MouseInputState {
  target: THREE.Vector3;
  angle: number;
  isActive: boolean;
  shouldRun: boolean;
}

export interface ClickerOptionState {
  isRun: boolean;
  throttle: number;
  autoStart: boolean;
  track: boolean;
  loop: boolean;
  queue: THREE.Vector3[];
  line: boolean;
}

export interface GamepadInputState {
  connected: boolean;
  leftStick: { x: number; y: number };
  rightStick: { x: number; y: number };
  buttons: Record<string, boolean>;
}

export interface BlockState {
  camera: boolean;
  control: boolean;
  animation: boolean;
  scroll: boolean;
}

// 통합 입력 상태 인터페이스
export interface UnifiedInputState {
  // 키보드 입력
  keyboard: KeyboardInputState;

  // 마우스/터치 입력
  pointer: MouseInputState;

  // 게임패드 입력 (미래 확장성)
  gamepad: GamepadInputState;

  // 컨트롤 블록 상태
  blocks: BlockState;

  // 클리커 옵션
  clickerOption: ClickerOptionState;
}

// 메인 통합 입력 atom
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

// 파생 상태 atoms (성능 최적화)
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

// 개별 섹션 접근자 (하위 호환성)
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
