import * as THREE from 'three';

import type { BrowserGamepad, GamepadSnapshotListener, GamepadSource } from '../BrowserGamepadHub';
import { WorldGamepadInput, applyGamepadDeadzone, type WorldGamepadOptions } from '../WorldGamepadInput';
import { createWorldInputScope } from '../WorldInputScope';
import { createKeyboardOwnership } from '../../hooks/useKeyboard/ownership';
import { createMemoryInputBackend } from '../../interactions/core/adapter';
import { logger } from '../../utils/logger';

function pad(index = 0, mapping: GamepadMappingType = 'standard') {
  return { id: `pad-${index}`, index, connected: true, mapping, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })), timestamp: 0 };
}
function sourceFixture() {
  let pads: ReadonlyArray<BrowserGamepad | null> = []; const listeners = new Set<GamepadSnapshotListener>();
  const source: GamepadSource = { subscribe: listener => { listeners.add(listener); listener(pads); return () => { listeners.delete(listener); }; } };
  return { source, listeners, emit: (next: typeof pads) => { pads = next; for (const listener of [...listeners]) listener(pads); } };
}
function fixture(options: WorldGamepadOptions = {}) {
  const backend = createMemoryInputBackend(); const scope = createWorldInputScope(); const source = sourceFixture(); let eligible = true;
  const surface = document.createElement('div'); document.body.append(surface); const off = scope.registerSurface(surface, { focusable: true }); surface.focus();
  const manual = jest.fn(); const input = new WorldGamepadInput(backend, scope, () => eligible, options, source.source, manual); input.resume();
  return { backend, scope, source, surface, input, manual, setEligible: (value: boolean) => { eligible = value; input.refresh(); }, dispose: () => { input.suspend(); off(); surface.remove(); } };
}

test('radial deadzone preserves analog magnitude and clamps non-finite and diagonal inputs', () => {
  const out = new THREE.Vector2(); expect(applyGamepadDeadzone(0.05, -0.05, 0.15, out).length()).toBe(0);
  expect(applyGamepadDeadzone(0, -0.575, 0.15, out).y).toBeCloseTo(-0.5);
  expect(applyGamepadDeadzone(1, 1, 0.15, out).length()).toBeCloseTo(1);
  expect(applyGamepadDeadzone(NaN, Infinity, 0.15, out).length()).toBe(0);
});

test('neutral samples do not publish repeatedly; standard axes, buttons and triggers reach one backend', () => {
  const f = fixture(); const p = pad(3); const listener = jest.fn(); const off = f.backend.subscribe!(listener);
  try {
    f.source.emit([null, p]); const connectedCalls = listener.mock.calls.length;
    for (let i = 0; i < 60; i++) f.source.emit([null, p]); expect(listener).toHaveBeenCalledTimes(connectedCalls);
    p.axes[1] = -0.575; p.axes[2] = 1; p.buttons[3]!.pressed = true; p.buttons[6]!.value = 0.4; f.source.emit([null, p]);
    expect(f.backend.getGamepad!().leftStick.y).toBeCloseTo(-0.5); expect(f.backend.getGamepad!().rightStick.x).toBe(1); expect(f.backend.getGamepad!().triggers.left).toBe(0.4); expect(f.backend.getKeyboard().keyE).toBe(true);
    expect(f.input.getStats()).toMatchObject({ selectedIndex: 3, connected: true, mappingSupported: true }); expect(f.manual).toHaveBeenCalledTimes(1);
    f.source.emit([]); expect(f.backend.getKeyboard().keyE).toBe(false); expect(f.backend.getGamepad!().connected).toBe(false); expect(f.backend.getGamepad!().leftStick.length()).toBe(0);
  } finally { off(); f.dispose(); }
});

test('new devices, focus transfer and editable fields require neutral input before arming', () => {
  const a = fixture(); const b = fixture(); const p = pad(); p.axes[0] = 1; p.buttons[3]!.pressed = true;
  try {
    a.surface.focus(); a.source.emit([p]); expect(a.backend.getGamepad!().leftStick.length()).toBe(0); expect(a.backend.getKeyboard().keyE).toBe(false);
    p.axes[0] = 0; p.buttons[3]!.pressed = false; a.source.emit([p]); p.axes[0] = 1; p.buttons[3]!.pressed = true; a.source.emit([p]); expect(a.backend.getKeyboard().keyE).toBe(true);
    b.surface.focus(); b.source.emit([p]); expect(a.backend.getKeyboard().keyE).toBe(false); expect(b.backend.getKeyboard().keyE).toBe(false); expect(b.backend.getGamepad!().leftStick.length()).toBe(0);
    p.axes[0] = 0; p.buttons[3]!.pressed = false; b.source.emit([p]); p.buttons[3]!.pressed = true; b.source.emit([p]); expect(b.backend.getKeyboard().keyE).toBe(true);
    const edit = document.createElement('input'); b.surface.append(edit); edit.focus(); b.source.emit([p]); expect(b.backend.getGamepad!().connected).toBe(false); expect(b.backend.getKeyboard().keyE).toBe(false);
    b.surface.focus(); b.source.emit([p]); expect(b.backend.getKeyboard().keyE).toBe(false);
    b.source.emit([]); b.source.emit([p]); expect(b.backend.getKeyboard().keyE).toBe(false);
  } finally { a.dispose(); b.dispose(); }
});

test('keyboard and gamepad releases retain other owners, including two buttons mapped to one key', () => {
  const f = fixture(); const p = pad(); const keyboard = createKeyboardOwnership(f.backend);
  try {
    f.source.emit([p]); keyboard.set('physical-space', 'space', true); p.buttons[0]!.pressed = true; p.buttons[8]!.pressed = true; p.buttons[9]!.pressed = true; f.source.emit([p]);
    p.buttons[0]!.pressed = false; p.buttons[8]!.pressed = false; f.source.emit([p]); expect(f.backend.getKeyboard().space).toBe(true); expect(f.backend.getKeyboard().escape).toBe(true);
    f.input.suspend(); expect(f.backend.getKeyboard().space).toBe(true); expect(f.backend.getKeyboard().escape).toBe(false); keyboard.release(); expect(f.backend.getKeyboard().space).toBe(false);
  } finally { keyboard.release(); f.dispose(); }
});

test('custom mapping selects a nonstandard index and copies options; invalid reconfiguration leaves it active', () => {
  const options: WorldGamepadOptions = { index: 2, mapping: { axes: { leftX: 2 }, buttons: { Y: 1 } }, bindings: { Y: 'keyF', B: null } };
  const f = fixture(options); const p = pad(2, ''); options.mapping!.axes!.leftX = 0; options.bindings!.Y = 'space';
  try {
    f.source.emit([pad(), null, p]); p.axes[2] = 1; p.buttons[1]!.pressed = true; f.source.emit([pad(), null, p]);
    expect(f.backend.getGamepad!().leftStick.x).toBe(1); expect(f.backend.getKeyboard().keyF).toBe(true); expect(f.backend.getKeyboard().space).toBe(false); expect(f.backend.getKeyboard().escape).toBe(false);
    expect(() => f.input.configure({ deadzone: 1 })).toThrow(RangeError); expect(() => f.input.configure({ mapping: { buttons: { Y: -1 } } })).toThrow(RangeError); expect(f.backend.getKeyboard().keyF).toBe(true);
    f.input.configure({ enabled: false }); expect(f.source.listeners.size).toBe(0); expect(f.backend.getKeyboard().keyF).toBe(false);
    f.input.configure({ enabled: true }); expect(f.source.listeners.size).toBe(1); expect(f.backend.getKeyboard().keyF).toBe(false);
  } finally { f.dispose(); }
});

test('unsupported layouts remain neutral; eligibility removes the source and stale callbacks cannot revive it', () => {
  const f = fixture(); const p = pad(0, '');
  try {
    f.source.emit([p]); expect(f.input.getStats()).toMatchObject({ mappingSupported: false, connected: false });
    p.mapping = 'standard'; f.source.emit([p]); const stale = [...f.source.listeners][0]!; f.setEligible(false); p.axes[0] = 1; stale([p]);
    expect(f.backend.getGamepad!().connected).toBe(false); expect(f.source.listeners.size).toBe(0);
    for (let cycle = 0; cycle < 50; cycle++) { f.setEligible(true); expect(f.source.listeners.size).toBe(1); f.setEligible(false); expect(f.source.listeners.size).toBe(0); }
  } finally { f.dispose(); }
});

test('synchronous publication may suspend the subscription; returned cleanup still runs exactly once', () => {
  const f = fixture(); f.input.suspend(); const p = pad(); const offSource = jest.fn(); let input: WorldGamepadInput;
  const source: GamepadSource = { subscribe: listener => { listener([p]); return offSource; } };
  input = new WorldGamepadInput(f.backend, f.scope, () => true, {}, source);
  const off = f.backend.subscribe!(() => { if (f.backend.getGamepad!().connected) input.suspend(); });
  try { input.resume(); expect(offSource).toHaveBeenCalledTimes(1); expect(input.getStats().active).toBe(false); expect(f.backend.getGamepad!().connected).toBe(false); }
  finally { off(); input.suspend(); f.dispose(); }
});

test('device replacement cannot reactivate state after its release observer suspends the driver', () => {
  const f = fixture(); const first = pad(); const next = pad(1); f.source.emit([first]);
  const off = f.backend.subscribe!(() => { if (!f.backend.getGamepad!().connected) f.input.suspend(); });
  try { f.source.emit([next]); expect(f.input.getStats().active).toBe(false); expect(f.backend.getGamepad!().connected).toBe(false); expect(f.source.listeners.size).toBe(0); }
  finally { off(); f.dispose(); }
});

test('throwing source cleanup still releases buttons and axes', () => {
  const f = fixture(); f.input.suspend(); const p = pad(); let emit: GamepadSnapshotListener = () => {};
  const log = jest.spyOn(logger, 'error').mockImplementation(() => {}); const input = new WorldGamepadInput(f.backend, f.scope, () => true, {}, { subscribe: listener => { emit = listener; return () => { throw new Error('cleanup'); }; } });
  try { input.resume(); emit([p]); p.buttons[0]!.pressed = true; emit([p]); expect(f.backend.getKeyboard().space).toBe(true); expect(() => input.suspend()).not.toThrow(); expect(f.backend.getKeyboard().space).toBe(false); expect(f.backend.getGamepad!().connected).toBe(false); expect(log).toHaveBeenCalled(); }
  finally { input.suspend(); f.dispose(); log.mockRestore(); }
});
