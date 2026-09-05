import { createPluginRegistry } from '../../plugins';
import {
  buildingGridAdapter,
  buildingPlacementAdapter,
} from '../model';
import { createBuildingPlugin } from '../plugin';
import type { BuildingPlacementExtension } from '../plugin';
import { useBuildingStore } from '../stores/buildingStore';
import { createWebSocketVisitChannel } from '../../networks/visit/channel';
import { applyVisitSnapshot } from '../../networks/visit/serializer';
import type { DomainBinding } from '../../save/types';
import { SaveSystem } from '../../save';

describe('building plugin', () => {
  it('rejects malformed building geometry before applying earlier save domains', async () => {
    const registry = createPluginRegistry();
    registry.register(createBuildingPlugin());
    await registry.setup('gaesup.building');
    const previous = useBuildingStore.getState();
    const hydrate = jest.fn();
    const save = new SaveSystem({ adapter: {
      read: async () => null, write: async () => undefined,
      list: async () => [], remove: async () => undefined,
    } });
    save.register({ key: 'earlier', serialize: () => null, hydrate });
    save.register(registry.context.save.require<DomainBinding>('building'));
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        building: { tileGroups: [{ id: 'bad', tiles: [{ id: 'tile', position: { x: 1e20, y: 0, z: 0 }, size: 1 }] }] },
      } })).toThrow('Save hydration failed');
      expect(hydrate).not.toHaveBeenCalled();
      expect(useBuildingStore.getState()).toBe(previous);
    } finally {
      await registry.dispose('gaesup.building');
    }
  });

  it('rejects an empty remote building payload without deleting the local world', async () => {
    const registry = createPluginRegistry();
    registry.register(createBuildingPlugin());
    await registry.setup('gaesup.building');
    const previous = useBuildingStore.getState().serialize();
    let receive = (_raw: string): void => {};
    const channel = createWebSocketVisitChannel({
      send: jest.fn(),
      onMessage: (listener) => { receive = listener; return () => {}; },
    });
    const results: ReturnType<typeof applyVisitSnapshot>[] = [];
    channel.subscribe((event) => {
      if (event.type === 'snapshot') results.push(applyVisitSnapshot(
        () => [registry.context.save.require<DomainBinding>('building')], event.snapshot,
      ));
    });
    try {
      useBuildingStore.getState().hydrate({ meshes: [{ id: 'local-mesh', color: '#fff', material: 'STANDARD' }] });
      const local = useBuildingStore.getState().serialize();
      const snapshot = { kind: 'world', worldId: 'remote', hostId: 'remote', version: 1, savedAt: 0, capturedAt: 0 };
      receive(JSON.stringify({ type: 'VisitSnapshot', v: 1, snapshot: { ...snapshot, domains: { building: {} } } }));
      expect(results).toEqual([{ applied: [], skipped: ['building'] }]);
      expect(useBuildingStore.getState().serialize()).toEqual(local);
      receive(JSON.stringify({ type: 'VisitSnapshot', v: 1, snapshot: { ...snapshot, domains: { building: { meshes: [] } } } }));
      expect(results[1]).toEqual({ applied: ['building'], skipped: [] });
      expect(useBuildingStore.getState().meshes.size).toBe(0);
    } finally {
      channel.close();
      useBuildingStore.getState().hydrate(previous);
      await registry.dispose('gaesup.building');
    }
  });

  it('registers building grid and placement extensions', async () => {
    const registry = createPluginRegistry();
    const readyEvents: unknown[] = [];
    registry.context.events.on('building:ready', (payload) => readyEvents.push(payload));
    registry.register(createBuildingPlugin());

    await registry.setup('gaesup.building');

    expect(registry.context.grid.require('building.square')).toBe(buildingGridAdapter);
    const extension = registry.context.placement.require<BuildingPlacementExtension>('building.placement');
    expect(extension.adapter).toBe(buildingPlacementAdapter);
    expect(extension.createEngine().list()).toEqual([]);
    expect(extension.blockToEntry({
      id: 'block',
      position: { x: 0, y: 0, z: 0 },
    }).subject.type).toBe('block');
    expect(readyEvents).toEqual([
      {
        pluginId: 'gaesup.building',
        gridExtensionId: 'building.square',
        placementExtensionId: 'building.placement',
        saveExtensionId: 'building',
        storeServiceId: 'building.store',
      },
    ]);
    expect(registry.context.save.require('building')).toEqual(expect.objectContaining({ key: 'building' }));
    expect(registry.context.services.require('building.store')).toEqual(expect.objectContaining({
      useStore: expect.any(Function),
      getState: expect.any(Function),
      setState: expect.any(Function),
    }));
  });

  it('supports custom extension ids and removes extensions on dispose', async () => {
    const registry = createPluginRegistry();
    registry.register(createBuildingPlugin({
      id: 'custom.building',
      gridExtensionId: 'custom.grid',
      placementExtensionId: 'custom.placement',
      saveExtensionId: 'custom.save',
      storeServiceId: 'custom.store',
    }));

    await registry.setup('custom.building');

    expect(registry.context.grid.has('custom.grid')).toBe(true);
    expect(registry.context.placement.has('custom.placement')).toBe(true);
    expect(registry.context.save.has('custom.save')).toBe(true);
    expect(registry.context.services.has('custom.store')).toBe(true);

    await registry.dispose('custom.building');

    expect(registry.context.grid.has('custom.grid')).toBe(false);
    expect(registry.context.placement.has('custom.placement')).toBe(false);
    expect(registry.context.save.has('custom.save')).toBe(false);
    expect(registry.context.services.has('custom.store')).toBe(false);
  });
});
