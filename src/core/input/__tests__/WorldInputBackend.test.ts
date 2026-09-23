import * as THREE from 'three';

import { createMemoryInputBackend, type InputBackend, type InputStateListener } from '../../interactions/core/adapter';
import { logger } from '../../utils/logger';
import { WorldInputBackend } from '../WorldInputBackend';

test('one source subscription supplies multiple consumers and all four input channels', () => {
  const source = createMemoryInputBackend(); const subscribe = jest.spyOn(source, 'subscribe');
  const port = new WorldInputBackend(); const first = jest.fn(); const second = jest.fn();
  const off = port.subscribe(first); const off2 = port.subscribe(second);
  expect(port.getStats().active).toBe(false); port.activate(source);
  expect(subscribe).toHaveBeenCalledTimes(1);
  source.updateKeyboard({ forward: true }); source.updateMouse({ isActive: true });
  source.updateGamepad!({ connected: true, leftStick: new THREE.Vector2(1, 0), buttons: { A: true } });
  source.updateTouch!({ touches: [{ id: 1, position: new THREE.Vector2(3, 4), force: 1 }] });
  expect(first).toHaveBeenCalledTimes(6); expect(second).toHaveBeenCalledTimes(6);
  off(); port.updateKeyboard({ keyF: true }); expect(first).toHaveBeenCalledTimes(6); expect(second).toHaveBeenCalledTimes(7);
  port.suspend();
  expect(port.getKeyboard().forward).toBe(false); expect(port.getMouse().isActive).toBe(false);
  expect(port.getGamepad().leftStick.length()).toBe(0); expect(source.getGamepad!().buttons['A']).toBe(false); expect(port.getTouch().touches).toHaveLength(0);
  port.updateKeyboard({ keyZ: true }); expect(port.getKeyboard().keyZ).toBe(false);
  port.activate(source); expect(port.getKeyboard().forward).toBe(false); expect(subscribe).toHaveBeenCalledTimes(2);
  off2(); port.suspend(); expect(port.getStats()).toMatchObject({ subscribers: 0, sourceSubscriptions: 0 });
});

test('unsubscribed source callbacks and reentrant replacement cannot publish a past generation', () => {
  const source = createMemoryInputBackend(); let emit: InputStateListener = () => {};
  source.subscribe = listener => { emit = listener; return () => {}; };
  const port = new WorldInputBackend(); const next = createMemoryInputBackend({ keyboard: { backward: true } });
  const listener = jest.fn(); port.subscribe(listener); port.activate(source);
  port.activate(next); listener.mockClear(); emit({ keyboard: source.getKeyboard(), mouse: source.getMouse() });
  expect(listener).not.toHaveBeenCalled(); expect(port.getKeyboard().backward).toBe(true);
  port.suspend();
});

test('same callback registrations have separate leases and subscriber failures do not skip later consumers', () => {
  const log = jest.spyOn(logger, 'error').mockImplementation(() => {}); const port = new WorldInputBackend();
  const listener = jest.fn(); const old = port.subscribe(listener); const newer = port.subscribe(listener);
  port.subscribe(() => { throw new Error('observer'); }); const last = jest.fn(); port.subscribe(last);
  try { old(); listener.mockClear(); last.mockClear(); port.activate(); expect(listener).toHaveBeenCalledTimes(1); expect(last).toHaveBeenCalledTimes(1); newer(); expect(log).toHaveBeenCalled(); }
  finally { port.suspend(); log.mockRestore(); }
});

test('optional subscribe and channel methods are supported without a global fallback', () => {
  const memory = createMemoryInputBackend();
  const source: InputBackend = { getKeyboard: memory.getKeyboard, getMouse: memory.getMouse, updateKeyboard: memory.updateKeyboard, updateMouse: memory.updateMouse };
  const port = new WorldInputBackend(); port.activate(source); const listener = jest.fn(); port.subscribe(listener);
  try { port.updateKeyboard({ rightward: true }); expect(listener).toHaveBeenCalledTimes(2); expect(port.getKeyboard().rightward).toBe(true); expect(port.getGamepad().connected).toBe(false); }
  finally { port.suspend(); }
});

test('keyboard-only custom sources retain gamepad state through the world port and clear it on replacement', () => {
  const memory = createMemoryInputBackend();
  const source: InputBackend = { getKeyboard: memory.getKeyboard, getMouse: memory.getMouse, updateKeyboard: memory.updateKeyboard, updateMouse: memory.updateMouse };
  const port = new WorldInputBackend(); port.activate(source); const listener = jest.fn(); const off = port.subscribe(listener);
  try {
    port.updateGamepad({ connected: true, leftStick: new THREE.Vector2(0.5, -0.25), buttons: { A: true } });
    expect(port.getGamepad().leftStick.toArray()).toEqual([0.5, -0.25]); expect(listener).toHaveBeenCalledTimes(2);
    port.activate(createMemoryInputBackend()); expect(port.getGamepad().connected).toBe(false); expect(port.getGamepad().buttons['A']).toBeFalsy();
    port.activate(source); expect(port.getGamepad().leftStick.length()).toBe(0); expect(port.getGamepad().buttons['A']).toBeFalsy();
  } finally { off(); port.suspend(); }
});

test('read-only gamepad channels become a writable per-world supplemental channel', () => {
  const memory = createMemoryInputBackend({ gamepad: { connected: true, leftStick: new THREE.Vector2(1, 0) } });
  const source: InputBackend = { getKeyboard: memory.getKeyboard, getMouse: memory.getMouse, updateKeyboard: memory.updateKeyboard, updateMouse: memory.updateMouse, getGamepad: memory.getGamepad! };
  const port = new WorldInputBackend(); port.activate(source);
  try { expect(port.getGamepad().leftStick.x).toBe(1); port.updateGamepad({ connected: true, leftStick: new THREE.Vector2(0.5, 0) }); expect(port.getGamepad().leftStick.x).toBe(0.5); expect(memory.getGamepad!().leftStick.x).toBe(1); }
  finally { port.suspend(); }
});

test('a source cannot leak across active worlds and can be transferred after shutdown', () => {
  const source = createMemoryInputBackend(); const a = new WorldInputBackend(); const b = new WorldInputBackend();
  a.activate(source); a.updateKeyboard({ forward: true });
  expect(() => b.activate(source)).toThrow('two active worlds'); expect(a.getKeyboard().forward).toBe(true);
  a.suspend(); b.activate(source); expect(b.getKeyboard().forward).toBe(false); b.suspend();
});

test('throwing teardown ports do not prevent neutral state, release or rebinding', () => {
  const log = jest.spyOn(logger, 'error').mockImplementation(() => {}); const source = createMemoryInputBackend(); const port = new WorldInputBackend();
  source.subscribe = () => () => { throw new Error('unsubscribe'); };
  try {
    port.activate(source); source.updateKeyboard = () => { throw new Error('write'); };
    source.getGamepad = () => { throw new Error('read'); };
    expect(() => port.suspend()).not.toThrow(); expect(port.getKeyboard().forward).toBe(false);
    port.activate(); expect(port.getStats().active).toBe(true);
  } finally { port.suspend(); log.mockRestore(); }
});
