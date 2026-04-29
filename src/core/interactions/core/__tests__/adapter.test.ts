import { createInteractionInputAdapter } from '../adapter';
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
});
