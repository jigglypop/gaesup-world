import * as THREE from 'three';

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
