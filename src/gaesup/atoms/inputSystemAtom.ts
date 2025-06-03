import { atom } from 'jotai';
import * as THREE from 'three';
import { V3 } from '../utils/vector';

// 통합 입력 시스템 타입 정의
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
  [key: string]: boolean;
}

export interface MouseInputState {
  target: THREE.Vector3; // clicker.point
  angle: number; // clicker.angle
  isActive: boolean; // clicker.isOn
  shouldRun: boolean; // clicker.isRun
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

export interface UnifiedInputSystemState {
  keyboard: KeyboardInputState;
  mouse: MouseInputState;
  clickerOption: ClickerOptionState;
}

// 메인 통합 입력 시스템 atom
export const inputSystemAtom = atom<UnifiedInputSystemState>({
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

  mouse: {
    target: V3(0, 0, 0),
    angle: Math.PI / 2,
    isActive: false,
    shouldRun: false,
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

// 하위 호환성을 위한 개별 atom들
export const keyboardInputAtom = atom(
  (get) => get(inputSystemAtom).keyboard,
  (get, set, update: Partial<KeyboardInputState>) => {
    const current = get(inputSystemAtom);
    set(inputSystemAtom, {
      ...current,
      keyboard: { ...current.keyboard, ...update },
    });
  },
);

export const mouseInputAtom = atom(
  (get) => get(inputSystemAtom).mouse,
  (get, set, update: Partial<MouseInputState>) => {
    const current = get(inputSystemAtom);
    set(inputSystemAtom, {
      ...current,
      mouse: { ...current.mouse, ...update },
    });
  },
);

export const clickerOptionInputAtom = atom(
  (get) => get(inputSystemAtom).clickerOption,
  (get, set, update: Partial<ClickerOptionState>) => {
    const current = get(inputSystemAtom);
    set(inputSystemAtom, {
      ...current,
      clickerOption: { ...current.clickerOption, ...update },
    });
  },
);

// 통합 파생 상태 atom들
export const movementStateAtom = atom((get) => {
  const input = get(inputSystemAtom);

  const isKeyboardMoving =
    input.keyboard.forward ||
    input.keyboard.backward ||
    input.keyboard.leftward ||
    input.keyboard.rightward;
  const isMouseMoving = input.mouse.isActive;

  return {
    isMoving: isKeyboardMoving || isMouseMoving,
    isRunning:
      (input.keyboard.shift && isKeyboardMoving) ||
      (input.mouse.shouldRun && isMouseMoving && input.clickerOption.isRun),
    isJumping: input.keyboard.space, // 기본값, 나중에 physics에서 복잡한 로직 적용
    inputSource: isKeyboardMoving ? 'keyboard' : isMouseMoving ? 'mouse' : 'none',
    isKeyboardMoving,
    isMouseMoving,
  };
});

// 입력 상태를 쉽게 확인할 수 있는 디버그 atom
export const inputDebugAtom = atom((get) => {
  const input = get(inputSystemAtom);
  const movement = get(movementStateAtom);

  return {
    ...input,
    computed: movement,
    timestamp: Date.now(),
  };
});
