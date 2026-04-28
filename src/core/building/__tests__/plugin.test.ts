import { createPluginRegistry } from '../../plugins';
import {
  buildingGridAdapter,
  buildingPlacementAdapter,
} from '../model';
import { createBuildingPlugin } from '../plugin';
import type { BuildingPlacementExtension } from '../plugin';

describe('building plugin', () => {
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
      },
    ]);
  });

  it('supports custom extension ids and removes extensions on dispose', async () => {
    const registry = createPluginRegistry();
    registry.register(createBuildingPlugin({
      id: 'custom.building',
      gridExtensionId: 'custom.grid',
      placementExtensionId: 'custom.placement',
    }));

    await registry.setup('custom.building');

    expect(registry.context.grid.has('custom.grid')).toBe(true);
    expect(registry.context.placement.has('custom.placement')).toBe(true);

    await registry.dispose('custom.building');

    expect(registry.context.grid.has('custom.grid')).toBe(false);
    expect(registry.context.placement.has('custom.placement')).toBe(false);
  });
});
