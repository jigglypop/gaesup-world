import * as THREE from 'three';
import { createStore } from 'zustand';

import { BridgeFactory } from '../../../boilerplate';
import { WorldBridge } from '../../bridge/WorldBridge';
import { createWorldSlice } from '../slices';
import type { WorldSlice } from '../types';
import { createWorldObjectStore } from '../worldObjectStore';

const object = (id: string, x: number) => ({ id, type: 'test', position: new THREE.Vector3(x, 0, 0), rotation: new THREE.Euler(), scale: new THREE.Vector3(1, 1, 1), canInteract: true });

test('owned stores retain data across engine disposal, isolate identical IDs, and reject inactive commands', () => {
  const a = createWorldObjectStore('a', false); const b = createWorldObjectStore('b');
  const bridge = a.getState().getBridge()!;
  expect(bridge.getEngine('a')).toBeUndefined(); expect(a.getState().addObject(object('one', 1))).toBe('');
  a.getState().activateWorldBridge();
  try {
    a.getState().addObject(object('one', 1)); b.getState().addObject(object('one', 9));
    a.getState().selectObject('one'); a.getState().setInteractionMode('edit');
    a.getState().interact('one', 'test'); expect(a.getState().events).toHaveLength(1);
    a.getState().clearEvents(); a.getState().toggleDebugInfo(); expect(a.getState().events).toHaveLength(0);
    expect(a.getState().objects[0]?.position.x).toBe(1); expect(b.getState().objects[0]?.position.x).toBe(9);
    a.getState().deactivateWorldBridge(); expect(bridge.getEngine('a')).toBeUndefined();
    bridge.register('a'); expect(bridge.getEngine('a')).toBeUndefined();
    expect(a.getState().updateObject('one', { position: new THREE.Vector3(5, 0, 0) })).toBe(false);
    a.getState().activateWorldBridge();
    expect(a.getState()).toMatchObject({ selectedObjectId: 'one', interactionMode: 'edit', showDebugInfo: true });
    expect(a.getState().getObjectsByType('test')[0]?.position.x).toBe(1);
    expect(b.getState().objects).toHaveLength(1);
    a.getState().deactivateWorldBridge(); a.getState().cleanup(); a.getState().activateWorldBridge();
    expect(a.getState().objects).toHaveLength(0);
  } finally { a.getState().deactivateWorldBridge(); b.getState().deactivateWorldBridge(); }
});

test('legacy slices share the default engine without resetting it or replacing each other subscriptions', () => {
  const bridge = new WorldBridge(); const factory = jest.spyOn(BridgeFactory, 'getOrCreate').mockReturnValue(bridge);
  const a = createStore<WorldSlice>()(createWorldSlice);
  a.getState().addObject(object('one', 1)); const engine = bridge.getEngine('default');
  const b = createStore<WorldSlice>()(createWorldSlice);
  try {
    expect(bridge.getEngine('default')).toBe(engine); expect(b.getState().objects).toHaveLength(1);
    b.getState().addObject(object('two', 2)); expect(a.getState().objects).toHaveLength(2);
    bridge.register('other'); bridge.addObject('other', object('other', 3)); expect(a.getState().objects).toHaveLength(2);
    a.getState().deactivateWorldBridge(); b.getState().addObject(object('three', 3));
    expect(a.getState().objects).toHaveLength(2); expect(b.getState().objects).toHaveLength(3);
    a.getState().activateWorldBridge(); expect(a.getState().objects).toHaveLength(3);
  } finally { a.getState().deactivateWorldBridge(); b.getState().deactivateWorldBridge(); bridge.dispose(); factory.mockRestore(); }
});

test('a throwing store subscriber cannot retain an owned engine during teardown', () => {
  const store = createWorldObjectStore(); const bridge = store.getState().getBridge()!;
  const off = store.subscribe(() => { throw new Error('subscriber'); });
  expect(() => store.getState().deactivateWorldBridge()).toThrow('subscriber');
  expect(bridge.getEngine('default')).toBeUndefined(); off();
  store.getState().activateWorldBridge(); expect(bridge.getEngine('default')).toBeDefined(); store.getState().deactivateWorldBridge();
});

test('snapshots reuse unchanged revisions but invalidate immediately for commands, direct system changes, and expired events', () => {
  const store = createWorldObjectStore(); const bridge = store.getState().getBridge()!;
  const now = jest.spyOn(Date, 'now').mockReturnValue(1000);
  try {
    const first = bridge.snapshot('default'); expect(bridge.snapshot('default')).toBe(first);
    store.getState().addObject(object('one', 1)); const second = bridge.snapshot('default');
    expect(second).not.toBe(first); expect(second?.objects).toHaveLength(1);
    store.getState().selectObject('one'); expect(bridge.snapshot('default')?.objects).toBe(second?.objects);
    const oldObject = store.getState().objects[0]; const change = jest.fn(); const off = store.subscribe(change);
    store.getState().updateObject('one', { position: new THREE.Vector3(3, 0, 0) });
    expect(change).toHaveBeenCalledTimes(1); off();
    expect(store.getState().objects[0]).not.toBe(oldObject); expect(oldObject?.position.x).toBe(1);
    const commandEvent = jest.fn(); const stop = bridge.on('execute', commandEvent);
    bridge.suspend(); bridge.selectObject('default', 'ignored');
    expect(commandEvent).not.toHaveBeenCalled(); expect(store.getState().selectedObjectId).toBe('one');
    bridge.resume(); stop();
    const system = bridge.getEngine('default')!.system;
    system.addObject(object('two', 2)); expect(bridge.snapshot('default')?.objects).toHaveLength(2);
    expect(() => system.updateObject('one', { id: 'invalid' })).toThrow('identity');
    store.getState().interact('one', 'test'); const withEvent = bridge.snapshot('default'); expect(withEvent?.events).toHaveLength(1);
    now.mockReturnValue(2001); expect(bridge.snapshot('default')?.events).toHaveLength(0);
    expect(bridge.snapshot('default')).not.toBe(withEvent);
  } finally { store.getState().deactivateWorldBridge(); now.mockRestore(); }
});
