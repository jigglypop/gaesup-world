import { createStore } from 'jotai';
import {
  inputAtom,
  movementStateAtom,
  keyboardInputAtom,
  pointerInputAtom,
  blockStateAtom,
  clickerOptionAtom,
} from '@/gaesup/atoms/inputAtom';
import { V3 } from '@/gaesup/utils/vector';

describe('input atoms', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  it('should have correct initial states', () => {
    const input = store.get(inputAtom);
    expect(input.keyboard.forward).toBe(false);
    expect(input.pointer.isActive).toBe(false);
    expect(input.blocks.control).toBe(false);
  });

  describe('keyboardInputAtom', () => {
    it('should update keyboard state', () => {
      store.set(keyboardInputAtom, { forward: true });
      const input = store.get(inputAtom);
      expect(input.keyboard.forward).toBe(true);
    });
  });

  describe('pointerInputAtom', () => {
    it('should update pointer state', () => {
      store.set(pointerInputAtom, { isActive: true, target: V3(1, 1, 1) });
      const input = store.get(inputAtom);
      expect(input.pointer.isActive).toBe(true);
      expect(input.pointer.target).toEqual(V3(1, 1, 1));
    });
  });

  describe('blockStateAtom', () => {
    it('should update block state', () => {
      store.set(blockStateAtom, { control: true });
      const input = store.get(inputAtom);
      expect(input.blocks.control).toBe(true);
    });
  });

  describe('clickerOptionAtom', () => {
    it('should update clicker option state', () => {
      store.set(clickerOptionAtom, { isRun: false });
      const input = store.get(inputAtom);
      expect(input.clickerOption.isRun).toBe(false);
    });
  });

  describe('movementStateAtom', () => {
    it('should detect keyboard movement', () => {
      store.set(keyboardInputAtom, { forward: true });
      const movement = store.get(movementStateAtom);
      expect(movement.isMoving).toBe(true);
      expect(movement.isKeyboardMoving).toBe(true);
      expect(movement.inputSource).toBe('keyboard');
    });

    it('should detect pointer movement', () => {
      store.set(pointerInputAtom, { isActive: true });
      const movement = store.get(movementStateAtom);
      expect(movement.isMoving).toBe(true);
      expect(movement.isPointerMoving).toBe(true);
      expect(movement.inputSource).toBe('pointer');
    });

    it('should detect running state from keyboard', () => {
      store.set(keyboardInputAtom, { forward: true, shift: true });
      const movement = store.get(movementStateAtom);
      expect(movement.isRunning).toBe(true);
    });

    it('should detect running state from pointer', () => {
      store.set(pointerInputAtom, { isActive: true, shouldRun: true });
      store.set(clickerOptionAtom, { isRun: true });
      const movement = store.get(movementStateAtom);
      expect(movement.isRunning).toBe(true);
    });
  });
});
