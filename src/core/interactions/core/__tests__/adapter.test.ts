import * as THREE from 'three';

import { logger } from '@/core/utils/logger';

import {
  createInteractionInputAdapter,
  createMemoryInputBackend,
  getDefaultInteractionInputBackend,
  setDefaultInteractionSystemResolver,
} from '../adapter';
import { InteractionSystem } from '../InteractionSystem';

describe('interaction input adapter', () => {
  afterEach(() => {
    InteractionSystem.getInstance().dispose();
  });

  it('adapts keyboard and mouse access without exposing callers to the singleton directly', () => {
    const system = new InteractionSystem();
    const adapter = createInteractionInputAdapter(system);

    adapter.updateKeyboard({ forward: true, shift: true });
    adapter.updateMouse({ isActive: true, shouldRun: true });

    expect(adapter.getKeyboard()).toEqual(expect.objectContaining({
      forward: true,
      shift: true,
    }));
    expect(adapter.getMouse()).toEqual(expect.objectContaining({
      isActive: true,
      shouldRun: true,
    }));
  });

  it('uses the shared interaction system when no system is provided', () => {
    const adapter = createInteractionInputAdapter();

    adapter.updateKeyboard({ backward: true });

    expect(InteractionSystem.getInstance().getKeyboardRef().backward).toBe(true);
    expect(adapter.getKeyboard().backward).toBe(true);
  });

  it('keeps the singleton lookup behind the default backend resolver', () => {
    const system = new InteractionSystem();
    const restoreResolver = setDefaultInteractionSystemResolver(() => system);
    const backend = getDefaultInteractionInputBackend();

    backend.updateKeyboard({ keyF: true });
    backend.updateMouse({ isLookAround: true });

    expect(system.getKeyboardRef().keyF).toBe(true);
    expect(system.getMouseRef().isLookAround).toBe(true);

    restoreResolver();
    system.dispose();
  });

  it('notifies subscribers when the default backend changes', () => {
    const system = new InteractionSystem();
    const adapter = createInteractionInputAdapter(system);
    const events: Array<{ keyE: boolean; isActive: boolean }> = [];

    const unsubscribe = adapter.subscribe?.(({ keyboard, mouse }) => {
      events.push({ keyE: keyboard.keyE, isActive: mouse.isActive });
    });
    adapter.updateKeyboard({ keyE: true });
    adapter.updateMouse({ isActive: true });
    unsubscribe?.();
    adapter.updateKeyboard({ keyE: false });

    expect(events).toEqual([
      { keyE: false, isActive: false },
      { keyE: true, isActive: false },
      { keyE: true, isActive: true },
    ]);
  });

  it('system-backed adapter가 reset 완료 snapshot을 정확히 한 번 알리고 identity를 유지해야 합니다', () => {
    const system = new InteractionSystem();
    const adapter = createInteractionInputAdapter(system);
    const listener = jest.fn();
    const unsubscribe = adapter.subscribe?.(listener);
    const keyboard = adapter.getKeyboard();
    const mouse = adapter.getMouse();
    const gamepad = adapter.getGamepad?.();
    const touch = adapter.getTouch?.();

    expect(listener).toHaveBeenCalledTimes(1);
    adapter.updateKeyboard({ forward: true });
    adapter.updateMouse({ isActive: true });
    adapter.updateGamepad?.({ connected: true });
    adapter.updateTouch?.({
      touches: [{ id: 1, position: new THREE.Vector2(2, 3), force: 0.5 }],
    });
    listener.mockClear();

    system.reset();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith({
      keyboard,
      mouse,
      gamepad,
      touch,
    });
    expect(keyboard.forward).toBe(false);
    expect(mouse.isActive).toBe(false);
    expect(gamepad?.connected).toBe(false);
    expect(touch?.touches).toEqual([]);

    listener.mockClear();
    adapter.updateKeyboard({ backward: true });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe?.();
    listener.mockClear();
    system.reset();
    expect(listener).not.toHaveBeenCalled();
    system.dispose();
  });

  it('system-backed adapter가 throwing subscriber를 격리하고 cleanup을 반환해야 합니다', () => {
    const system = new InteractionSystem();
    const adapter = createInteractionInputAdapter(system);
    const throwingListener = jest.fn(() => {
      throw new Error('expected adapter listener failure');
    });
    const laterListener = jest.fn();
    const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
    let unsubscribeThrowing: (() => void) | undefined;
    let unsubscribeLater: (() => void) | undefined;

    try {
      expect(() => {
        unsubscribeThrowing = adapter.subscribe?.(throwingListener);
      }).not.toThrow();
      expect(unsubscribeThrowing).toEqual(expect.any(Function));
      unsubscribeLater = adapter.subscribe?.(laterListener);
      expect(laterListener).toHaveBeenCalledTimes(1);

      adapter.updateKeyboard({ keyE: true });
      system.reset();

      expect(throwingListener).toHaveBeenCalledTimes(3);
      expect(laterListener).toHaveBeenCalledTimes(3);
      expect(loggerSpy).toHaveBeenCalledTimes(3);

      unsubscribeThrowing?.();
      adapter.updateMouse({ isActive: true });
      expect(throwingListener).toHaveBeenCalledTimes(3);
      expect(laterListener).toHaveBeenCalledTimes(4);

      unsubscribeLater?.();
      system.reset();
      expect(throwingListener).toHaveBeenCalledTimes(3);
      expect(laterListener).toHaveBeenCalledTimes(4);
    } finally {
      unsubscribeThrowing?.();
      unsubscribeLater?.();
      loggerSpy.mockRestore();
      system.dispose();
    }
  });

  it('default backend가 resolver system reset을 정확히 한 번 projection해야 합니다', () => {
    const system = new InteractionSystem();
    const restoreResolver = setDefaultInteractionSystemResolver(() => system);
    const backend = getDefaultInteractionInputBackend();
    const listener = jest.fn();
    const unsubscribe = backend.subscribe?.(listener);
    const keyboard = backend.getKeyboard();
    const mouse = backend.getMouse();

    try {
      expect(listener).toHaveBeenCalledTimes(1);
      backend.updateKeyboard({ keyF: true });
      backend.updateMouse({ shouldRun: true });
      listener.mockClear();

      system.reset();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({
        keyboard,
        mouse,
      }));
      expect(keyboard.keyF).toBe(false);
      expect(mouse.shouldRun).toBe(false);
    } finally {
      unsubscribe?.();
      restoreResolver();
      system.dispose();
    }
  });

  it('default backend가 initial/reset throwing subscriber를 격리하고 binding cleanup을 유지해야 합니다', () => {
    const system = new InteractionSystem();
    const restoreResolver = setDefaultInteractionSystemResolver(() => system);
    const backend = getDefaultInteractionInputBackend();
    const throwingListener = jest.fn(() => {
      throw new Error('expected default backend listener failure');
    });
    const laterListener = jest.fn();
    const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
    let unsubscribeThrowing: (() => void) | undefined;
    let unsubscribeLater: (() => void) | undefined;

    try {
      expect(() => {
        unsubscribeThrowing = backend.subscribe?.(throwingListener);
      }).not.toThrow();
      expect(unsubscribeThrowing).toEqual(expect.any(Function));
      unsubscribeLater = backend.subscribe?.(laterListener);
      expect(laterListener).toHaveBeenCalledTimes(1);

      backend.updateKeyboard({ keyF: true });
      system.reset();

      expect(throwingListener).toHaveBeenCalledTimes(3);
      expect(laterListener).toHaveBeenCalledTimes(3);
      expect(loggerSpy).toHaveBeenCalledTimes(3);

      unsubscribeThrowing?.();
      system.reset();
      expect(throwingListener).toHaveBeenCalledTimes(3);
      expect(laterListener).toHaveBeenCalledTimes(4);

      unsubscribeLater?.();
      system.reset();
      expect(throwingListener).toHaveBeenCalledTimes(3);
      expect(laterListener).toHaveBeenCalledTimes(4);
    } finally {
      unsubscribeThrowing?.();
      unsubscribeLater?.();
      loggerSpy.mockRestore();
      restoreResolver();
      system.dispose();
    }
  });

  it('default backend fanout이 시작 generation을 고정하고 duplicate subscription을 idempotent하게 처리해야 합니다', () => {
    const system = new InteractionSystem();
    const restoreResolver = setDefaultInteractionSystemResolver(() => system);
    const backend = getDefaultInteractionInputBackend();
    const lateListener = jest.fn();
    const removedAndReaddedListener = jest.fn();
    const removedListener = jest.fn();
    let mutateOnNextReset = false;
    let unsubscribeLate: (() => void) | undefined;
    let unsubscribeReadded: (() => void) | undefined;
    let unsubscribeDuplicate: (() => void) | undefined;
    const firstListener = jest.fn(() => {
      if (!mutateOnNextReset) return;
      mutateOnNextReset = false;
      unsubscribeLate = backend.subscribe?.(lateListener);
      unsubscribeDuplicate = backend.subscribe?.(firstListener);
      unsubscribeRemovedAndReadded?.();
      unsubscribeReadded = backend.subscribe?.(removedAndReaddedListener);
      unsubscribeRemoved?.();
    });
    const unsubscribeFirst = backend.subscribe?.(firstListener);
    const unsubscribeRemovedAndReadded = backend.subscribe?.(removedAndReaddedListener);
    const unsubscribeRemoved = backend.subscribe?.(removedListener);

    try {
      firstListener.mockClear();
      lateListener.mockClear();
      removedAndReaddedListener.mockClear();
      removedListener.mockClear();
      mutateOnNextReset = true;

      system.reset();

      expect(firstListener).toHaveBeenCalledTimes(1);
      expect(lateListener).toHaveBeenCalledTimes(1);
      expect(removedAndReaddedListener).toHaveBeenCalledTimes(1);
      expect(removedListener).not.toHaveBeenCalled();
      expect(unsubscribeDuplicate).toEqual(expect.any(Function));

      system.reset();

      expect(firstListener).toHaveBeenCalledTimes(2);
      expect(lateListener).toHaveBeenCalledTimes(2);
      expect(removedAndReaddedListener).toHaveBeenCalledTimes(2);
      expect(removedListener).not.toHaveBeenCalled();

      unsubscribeDuplicate?.();
      unsubscribeLate?.();
      unsubscribeReadded?.();
      system.reset();
      expect(firstListener).toHaveBeenCalledTimes(2);
      expect(lateListener).toHaveBeenCalledTimes(2);
      expect(removedAndReaddedListener).toHaveBeenCalledTimes(2);
    } finally {
      unsubscribeFirst?.();
      unsubscribeDuplicate?.();
      unsubscribeLate?.();
      unsubscribeRemovedAndReadded?.();
      unsubscribeReadded?.();
      unsubscribeRemoved?.();
      restoreResolver();
      system.dispose();
    }
  });

  it('creates a memory backend for fake, replay, or network input sources', () => {
    const backend = createMemoryInputBackend({
      keyboard: { forward: true },
      mouse: {
        target: new THREE.Vector3(1, 0, 2),
        buttons: { left: true },
      },
    });
    const listener = jest.fn();

    backend.subscribe?.(listener);
    backend.updateGamepad?.({ connected: true, buttons: { jump: true } });
    backend.updateTouch?.({
      touches: [{ id: 1, position: new THREE.Vector2(4, 5), force: 0.5 }],
    });

    expect(backend.getKeyboard().forward).toBe(true);
    expect(backend.getMouse().target).toEqual(new THREE.Vector3(1, 0, 2));
    expect(backend.getMouse().buttons.left).toBe(true);
    expect(backend.getGamepad?.().connected).toBe(true);
    expect(backend.getGamepad?.().buttons.jump).toBe(true);
    expect(backend.getTouch?.().touches[0]?.position).toEqual(new THREE.Vector2(4, 5));
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
