import * as THREE from 'three';

import { createPluginRegistry } from '../../plugins';
import { createGaesupRuntime } from '../../runtime';
import { SaveSystem } from '../../save';
import type { SaveAdapter, SaveBlob } from '../../save';
import { useGaesupStore } from '../../stores/gaesupStore';
import { CameraSystem } from '../core/CameraSystem';
import {
  createCameraPlugin,
  type CameraSaveExtension,
  type CameraStoreService,
  type CameraSystemExtension,
} from '../plugin';

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

const baseConfig = {
  mode: 'thirdPerson',
  distance: { x: 0, y: 8, z: 12 },
  enableCollision: false,
};

describe('camera plugin', () => {
  beforeEach(() => {
    useGaesupStore.getState().resetMode();
    useGaesupStore.getState().setCameraOption({
      fov: 75,
      zoom: 1,
      position: new THREE.Vector3(-15, 8, -15),
      target: new THREE.Vector3(0, 0, 0),
    });
  });

  it('registers a camera system factory extension and emits readiness', async () => {
    const registry = createPluginRegistry();
    const readyEvents: unknown[] = [];
    registry.context.events.on('camera:ready', (payload) => readyEvents.push(payload));
    registry.register(createCameraPlugin());

    await registry.setup('gaesup.camera');

    const extension = registry.context.systems.require<CameraSystemExtension>('camera.system');
    const system = extension.create(baseConfig);

    expect(extension.System).toBe(CameraSystem);
    expect(system).toBeInstanceOf(CameraSystem);
    expect(system.getState().config.mode).toBe('thirdPerson');
    expect(readyEvents).toEqual([
      {
        pluginId: 'gaesup.camera',
        systemExtensionId: 'camera.system',
        saveExtensionId: 'camera',
        storeServiceId: 'camera.store',
      },
    ]);

    system.destroy();
  });

  it('supports custom extension ids and removes them on dispose', async () => {
    const registry = createPluginRegistry();
    registry.register(createCameraPlugin({
      id: 'custom.camera',
      systemExtensionId: 'custom.camera.system',
      saveExtensionId: 'custom.camera.save',
      storeServiceId: 'custom.camera.store',
    }));

    await registry.setup('custom.camera');
    expect(registry.context.systems.has('custom.camera.system')).toBe(true);
    expect(registry.context.save.has('custom.camera.save')).toBe(true);
    expect(registry.context.services.has('custom.camera.store')).toBe(true);

    await registry.dispose('custom.camera');
    expect(registry.context.systems.has('custom.camera.system')).toBe(false);
    expect(registry.context.save.has('custom.camera.save')).toBe(false);
    expect(registry.context.services.has('custom.camera.store')).toBe(false);
  });

  it('registers camera save and store service extensions', async () => {
    const registry = createPluginRegistry();
    registry.register(createCameraPlugin());
    await registry.setup('gaesup.camera');

    const service = registry.context.services.require<CameraStoreService>('camera.store');
    service.setMode({ control: 'topDown', type: 'vehicle' });
    service.setCameraOption({
      fov: 55,
      zoom: 1.25,
      position: new THREE.Vector3(1, 2, 3),
      target: new THREE.Vector3(4, 5, 6),
    });

    const binding = registry.context.save.require<CameraSaveExtension>('camera');
    const saved = binding.serialize();

    expect(saved).toEqual({
      mode: {
        type: 'vehicle',
        controller: 'keyboard',
        control: 'topDown',
      },
      cameraOption: expect.objectContaining({
        fov: 55,
        zoom: 1.25,
        position: { x: 1, y: 2, z: 3 },
        target: { x: 4, y: 5, z: 6 },
      }),
    });

    service.setMode({ control: 'firstPerson', type: 'character' });
    service.setCameraOption({
      fov: 90,
      zoom: 2,
      position: new THREE.Vector3(10, 20, 30),
      target: new THREE.Vector3(40, 50, 60),
    });

    binding.hydrate(saved);

    const state = service.getState();
    expect(state.mode).toEqual({
      type: 'vehicle',
      controller: 'keyboard',
      control: 'topDown',
    });
    expect(state.cameraOption).toEqual(expect.objectContaining({
      fov: 55,
      zoom: 1.25,
      position: expect.objectContaining({ x: 1, y: 2, z: 3 }),
      target: expect.objectContaining({ x: 4, y: 5, z: 6 }),
    }));
  });

  it('contributes camera save binding to runtime setup', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({
      saveSystem: save,
      plugins: [createCameraPlugin()],
    });

    await runtime.setup();

    expect(Array.from(save.getBindings()).map((binding) => binding.key)).toContain('camera');
  });
});
