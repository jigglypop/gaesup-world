import * as THREE from 'three';

import { createGaesupRuntime } from '../createGaesupRuntime';
import { createCameraPlugin } from '../../camera';
import { createMotionsPlugin, type MotionsRuntimeService } from '../../motions';
import { PhysicsBridge } from '../../motions/bridge/PhysicsBridge';
import { SaveSystem } from '../../save';
import type { SaveAdapter, SaveBlob } from '../../save';
import { useGaesupStore } from '../../stores/gaesupStore';
import type { GaesupPlugin } from '../../plugins';

class MemoryAdapter implements SaveAdapter {
  private readonly map = new Map<string, SaveBlob>();

  async read(slot: string) {
    return this.map.get(slot) ?? null;
  }

  async write(slot: string, blob: SaveBlob) {
    this.map.set(slot, JSON.parse(JSON.stringify(blob)) as SaveBlob);
  }

  async list() {
    return Array.from(this.map.keys());
  }

  async remove(slot: string) {
    this.map.delete(slot);
  }
}

const createSavePlugin = (serialize: () => object, hydrate: (data: unknown) => void): GaesupPlugin => ({
  id: 'test.save-plugin',
  name: 'Test Save Plugin',
  version: '1.0.0',
  setup(ctx) {
    ctx.save.register('plugin-domain', {
      key: 'plugin-domain',
      serialize,
      hydrate,
    }, 'test.save-plugin');
  },
});

describe('createGaesupRuntime', () => {
  beforeEach(() => {
    useGaesupStore.getState().resetMode();
    useGaesupStore.getState().setCameraOption({
      fov: 75,
      zoom: 1,
      position: new THREE.Vector3(-15, 8, -15),
      target: new THREE.Vector3(0, 0, 0),
    });
  });

  it('registers save bindings contributed by plugins during setup', async () => {
    const adapter = new MemoryAdapter();
    const save = new SaveSystem({ adapter });
    let value = 7;
    const runtime = createGaesupRuntime({
      saveSystem: save,
      plugins: [
        createSavePlugin(
          () => ({ value }),
          (data) => {
            if (data && typeof data === 'object' && 'value' in data) {
              value = Number((data as { value: unknown }).value);
            }
          },
        ),
      ],
    });

    await runtime.setup();
    await runtime.save.save('slot');

    value = 0;
    await runtime.save.load('slot');

    expect(value).toBe(7);
    expect(Array.from(runtime.save.getBindings()).map((binding) => binding.key)).toEqual(['plugin-domain']);
  });

  it('unregisters option and plugin save bindings on dispose', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({
      saveSystem: save,
      saveBindings: [
        {
          key: 'option-domain',
          serialize: () => ({ ok: true }),
          hydrate: () => undefined,
        },
      ],
      plugins: [
        createSavePlugin(
          () => ({ ok: true }),
          () => undefined,
        ),
      ],
    });

    await runtime.setup();
    expect(Array.from(save.getBindings()).map((binding) => binding.key).sort()).toEqual([
      'option-domain',
      'plugin-domain',
    ]);

    await runtime.dispose();

    expect(Array.from(save.getBindings())).toEqual([]);
    expect(runtime.plugins.context.save.has('plugin-domain')).toBe(false);
  });

  it('round-trips camera state contributed by the camera plugin', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({
      saveSystem: save,
      plugins: [createCameraPlugin()],
    });

    await runtime.setup();

    useGaesupStore.getState().setMode({ type: 'vehicle', control: 'isometric' });
    useGaesupStore.getState().setCameraOption({
      fov: 48,
      zoom: 1.4,
      position: new THREE.Vector3(2, 4, 6),
      target: new THREE.Vector3(8, 10, 12),
    });

    await runtime.save.save('camera-slot');

    useGaesupStore.getState().setMode({ type: 'character', control: 'firstPerson' });
    useGaesupStore.getState().setCameraOption({
      fov: 90,
      zoom: 2,
      position: new THREE.Vector3(20, 40, 60),
      target: new THREE.Vector3(80, 100, 120),
    });

    await runtime.save.load('camera-slot');

    const state = useGaesupStore.getState();
    expect(state.mode).toEqual({
      type: 'vehicle',
      controller: 'keyboard',
      control: 'isometric',
    });
    expect(state.cameraOption).toEqual(expect.objectContaining({
      fov: 48,
      zoom: 1.4,
      position: expect.objectContaining({ x: 2, y: 4, z: 6 }),
      target: expect.objectContaining({ x: 8, y: 10, z: 12 }),
    }));

    await runtime.dispose();
  });

  it('exposes plugin services through runtime helpers', async () => {
    const runtime = createGaesupRuntime({
      saveSystem: new SaveSystem({ adapter: new MemoryAdapter() }),
      plugins: [createMotionsPlugin()],
    });

    await runtime.setup();

    const optionalService = runtime.getService<MotionsRuntimeService>('motions.runtime');
    const requiredService = runtime.requireService<MotionsRuntimeService>('motions.runtime');

    expect(optionalService).toBe(requiredService);
    expect(requiredService.create().physicsBridge).toBeInstanceOf(PhysicsBridge);
    expect(runtime.getService('missing.service')).toBeUndefined();
    expect(() => runtime.requireService('missing.service')).toThrow('Extension "missing.service" is not registered.');

    await runtime.dispose();
  });
});
