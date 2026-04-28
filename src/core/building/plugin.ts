import type { GaesupPlugin, PluginContext } from '../plugins';
import {
  buildingGroupsToPlacementEntries,
  buildingGridAdapter,
  buildingPlacementAdapter,
  blockToPlacementEntry,
  createBuildingPlacementEngine,
  tileToPlacementEntry,
  wallToPlacementEntry,
} from './model';

export interface BuildingPlacementExtension {
  adapter: typeof buildingPlacementAdapter;
  createEngine: typeof createBuildingPlacementEngine;
  toEntries: typeof buildingGroupsToPlacementEntries;
  blockToEntry: typeof blockToPlacementEntry;
  tileToEntry: typeof tileToPlacementEntry;
  wallToEntry: typeof wallToPlacementEntry;
}

export interface BuildingPluginOptions {
  id?: string;
  gridExtensionId?: string;
  placementExtensionId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.building';
const DEFAULT_GRID_EXTENSION_ID = 'building.square';
const DEFAULT_PLACEMENT_EXTENSION_ID = 'building.placement';

export function createBuildingPlugin(options: BuildingPluginOptions = {}): GaesupPlugin {
  const pluginId = options.id ?? DEFAULT_PLUGIN_ID;
  const gridExtensionId = options.gridExtensionId ?? DEFAULT_GRID_EXTENSION_ID;
  const placementExtensionId = options.placementExtensionId ?? DEFAULT_PLACEMENT_EXTENSION_ID;

  const register = (ctx: PluginContext): void => {
    ctx.grid.register(gridExtensionId, buildingGridAdapter, pluginId);
    ctx.placement.register(
      placementExtensionId,
      {
        adapter: buildingPlacementAdapter,
        createEngine: createBuildingPlacementEngine,
        toEntries: buildingGroupsToPlacementEntries,
        blockToEntry: blockToPlacementEntry,
        tileToEntry: tileToPlacementEntry,
        wallToEntry: wallToPlacementEntry,
      },
      pluginId,
    );
    ctx.events.emit('building:ready', {
      pluginId,
      gridExtensionId,
      placementExtensionId,
    });
  };

  return {
    id: pluginId,
    name: 'GaeSup Building',
    version: '0.1.0',
    runtime: 'client',
    capabilities: ['building', 'grid', 'placement'],
    setup: register,
    dispose(ctx) {
      ctx.grid.remove(gridExtensionId);
      ctx.placement.remove(placementExtensionId);
    },
  };
}

export const buildingPlugin = createBuildingPlugin();
