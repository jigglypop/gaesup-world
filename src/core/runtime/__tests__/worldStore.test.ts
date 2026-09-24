import { Vector3 } from 'three';

import { requestCameraCloseUp } from '../../camera/closeUp';
import { createCameraPlugin } from '../../camera/plugin';
import { SaveSystem } from '../../save/core/SaveSystem';
import type { SaveBlob } from '../../save/types';
import { createGaesupStore, useGaesupStore } from '../../stores/gaesupStore';
import { createGaesupRuntime } from '../createGaesupRuntime';

test('world stores do not share mutable camera defaults or world maps', () => {
  const a = createGaesupStore(); const b = createGaesupStore();
  a.getState().cameraOption.target!.set(9, 8, 7);
  a.getState().addTile({ id: 'same', position: [1, 0, 0] });
  b.getState().addTile({ id: 'same', position: [2, 0, 0] });
  expect(b.getState().cameraOption.target).toEqual(new Vector3());
  expect(a.getState().tiles.get('same')?.position[0]).toBe(1);
  expect(b.getState().tiles.get('same')?.position[0]).toBe(2);
});

test('camera close-up restores the matching world even when another world focuses later', () => {
  const a = createGaesupStore(); const b = createGaesupStore();
  a.getState().setCameraOption({ fov: 40 }); b.getState().setCameraOption({ fov: 90 });
  const restoreA = requestCameraCloseUp([1, 0, 0], {}, a);
  const restoreB = requestCameraCloseUp([8, 0, 0], {}, b);
  restoreA(); expect(a.getState().cameraOption.fov).toBe(40);
  expect(b.getState().cameraOption.focusTarget?.x).toBe(8);
  expect(b.getState().cameraOption.focus).toBe(true);
  restoreB(); expect(b.getState().cameraOption.fov).toBe(90);
});

test('store commands, automation movement and disposal affect only their owning runtime', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const legacy = useGaesupStore.getState().interaction.keyboard.forward;
  try {
    await a.setup(); await b.setup();
    a.store.getState().updateKeyboard({ forward: true });
    expect(a.inputAdapter.getKeyboard().forward).toBe(true);
    expect(a.store.getState().interaction.keyboard.forward).toBe(true);
    expect(b.inputAdapter.getKeyboard().forward).toBe(false);
    expect(useGaesupStore.getState().interaction.keyboard.forward).toBe(legacy);
    a.store.getState().addAutomationAction({ type: 'move', target: new Vector3(3, 0, 0) });
    b.store.getState().addAutomationAction({ type: 'move', target: new Vector3(9, 0, 0) });
    a.store.getState().startAutomation(); b.store.getState().startAutomation();
    expect(a.inputAdapter.getMouse().target.x).toBe(3);
    expect(b.inputAdapter.getMouse().target.x).toBe(9);
    await a.dispose();
    expect(a.inputAdapter.getMouse().isActive).toBe(false);
    expect(b.inputAdapter.getMouse().isActive).toBe(true);
    expect(b.store.getState().automation.queue.isRunning).toBe(true);
    await a.setup();
    a.store.getState().updateKeyboard({ forward: false });
    expect(a.store.getState().interaction.keyboard.forward).toBe(false);
    a.store.getState().addAutomationAction({ type: 'move', target: new Vector3(5, 0, 0) });
    a.store.getState().startAutomation();
    expect(a.inputAdapter.getMouse().target.x).toBe(5);
    expect(b.inputAdapter.getMouse().target.x).toBe(9);
  } finally { await a.dispose(); await b.dispose(); }
});

test('failed owned bridge cleanup still releases other bridges, navigation and services', async () => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  const error = new Error('physics cleanup failed');
  jest.spyOn(runtime.motions.physicsBridge, 'dispose').mockImplementation(() => { throw error; });
  const animation = runtime.animationBridge;
  const cleanupMotion = jest.spyOn(runtime.motionBridge, 'dispose');
  const cleanupNavigation = jest.spyOn(runtime.navigation, 'dispose');
  await expect(runtime.dispose()).rejects.toBe(error);
  expect(cleanupMotion).toHaveBeenCalledTimes(1); expect(cleanupNavigation).toHaveBeenCalledTimes(1);
  expect(animation.getEngine('character')).toBeUndefined();
  expect(runtime.isActive()).toBe(false);
  expect(runtime.plugins.context.services.list()).toEqual([]);
});

test('camera plugin binds the runtime store and leaves the legacy store and other world untouched', async () => {
  const slots = new Map<string, SaveBlob>();
  const save = new SaveSystem({ adapter: { read: async key => slots.get(key) ?? null,
    write: async (key, blob) => { slots.set(key, blob); }, list: async () => [...slots.keys()], remove: async key => { slots.delete(key); } } });
  const a = createGaesupRuntime({ plugins: [createCameraPlugin()], saveSystem: save });
  const b = createGaesupRuntime({ plugins: [createCameraPlugin()] });
  const legacyCamera = useGaesupStore.getState().cameraOption;
  try {
    await a.setup(); await b.setup();
    a.store.getState().setCameraOption({ fov: 40 }); b.store.getState().setCameraOption({ fov: 90 });
    await a.save.save('main'); a.store.getState().setCameraOption({ fov: 70 }); await a.save.load('main');
    expect(a.store.getState().cameraOption.fov).toBe(40);
    expect(b.store.getState().cameraOption.fov).toBe(90);
    expect(useGaesupStore.getState().cameraOption).toBe(legacyCamera);
  } finally { await a.dispose(); await b.dispose(); }
});
