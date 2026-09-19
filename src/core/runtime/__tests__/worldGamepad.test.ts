import { createGaesupRuntime } from '../createGaesupRuntime';
import { getBrowserGamepadHub, type BrowserGamepad, type GamepadSnapshotListener } from '../../input/BrowserGamepadHub';
import { createMemoryInputBackend, type InputBackend } from '../../interactions/core/adapter';
import { createMotionsPlugin } from '../../motions/plugin';

test('runtime owns gamepad subscriptions across modes, editor gating and fifty setup/dispose cycles', async () => {
  const listeners = new Set<GamepadSnapshotListener>(); const hub = getBrowserGamepadHub();
  const subscribe = jest.spyOn(hub, 'subscribe').mockImplementation(listener => { listeners.add(listener); listener([]); return () => { listeners.delete(listener); }; });
  const runtime = createGaesupRuntime();
  try {
    await runtime.setup(); expect(listeners.size).toBe(0); expect(runtime.requireService('gaesup.runtime.gamepad')).toBe(runtime.gamepad);
    runtime.store.getState().setMode({ controller: 'gamepad' }); expect(listeners.size).toBe(1);
    runtime.buildingStore.getState().setEditMode('block'); expect(listeners.size).toBe(0); runtime.buildingStore.getState().setEditMode('none'); expect(listeners.size).toBe(1);
    runtime.store.getState().setMode({ controller: 'keyboard' }); expect(listeners.size).toBe(0);
    runtime.store.getState().setMode({ controller: 'gamepad' });
    for (let cycle = 0; cycle < 50; cycle++) { await runtime.dispose(); expect(listeners.size).toBe(0); expect(runtime.getService('gaesup.runtime.gamepad')).toBeUndefined(); await runtime.setup(); expect(listeners.size).toBe(1); }
  } finally { await runtime.dispose(); subscribe.mockRestore(); }
  expect(listeners.size).toBe(0);
});

test('hardware input reaches keyboard-only plugins; hot replacement releases held state and re-arms after neutral', async () => {
  const p = { id: 'pad', index: 0, connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })), timestamp: 0 } satisfies BrowserGamepad;
  const listeners = new Set<GamepadSnapshotListener>(); const emit = () => { for (const listener of [...listeners]) listener([p]); };
  const subscribe = jest.spyOn(getBrowserGamepadHub(), 'subscribe').mockImplementation(listener => { listeners.add(listener); listener([p]); return () => { listeners.delete(listener); }; });
  const runtime = createGaesupRuntime(); const surface = document.createElement('div'); document.body.append(surface); const off = runtime.inputScope.registerSurface(surface, { focusable: true });
  const memory = createMemoryInputBackend(); const source: InputBackend = { getKeyboard: memory.getKeyboard, getMouse: memory.getMouse, updateKeyboard: memory.updateKeyboard, updateMouse: memory.updateMouse };
  try {
    await runtime.setup(); surface.focus(); runtime.store.getState().setMode({ controller: 'gamepad' }); p.axes[0] = 1; p.buttons[3]!.pressed = true; emit();
    expect(runtime.inputAdapter.getGamepad!().leftStick.x).toBe(1); expect(runtime.inputAdapter.getKeyboard().keyE).toBe(true);
    runtime.plugins.register(createMotionsPlugin({ createInputAdapter: () => source })); await runtime.plugins.setup('gaesup.motions');
    emit(); expect(runtime.inputAdapter.getGamepad!().leftStick.x).toBe(0); expect(source.getKeyboard().keyE).toBe(false);
    p.axes[0] = 0; p.buttons[3]!.pressed = false; emit(); p.axes[0] = 1; p.buttons[3]!.pressed = true; emit();
    expect(runtime.inputAdapter.getGamepad!().leftStick.x).toBe(1); expect(source.getKeyboard().keyE).toBe(true);
    await runtime.plugins.dispose('gaesup.motions'); emit(); expect(runtime.inputAdapter.getKeyboard().keyE).toBe(false);
  } finally { await runtime.dispose(); off(); surface.remove(); subscribe.mockRestore(); }
});
