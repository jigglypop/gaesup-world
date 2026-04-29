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
import { useBuildingStore } from './stores/buildingStore';
import type { BuildingSerializedState } from './types';

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
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.building';
const DEFAULT_GRID_EXTENSION_ID = 'building.square';
const DEFAULT_PLACEMENT_EXTENSION_ID = 'building.placement';
const DEFAULT_SAVE_EXTENSION_ID = 'building';
const DEFAULT_STORE_SERVICE_ID = 'building.store';

export function createBuildingPlugin(options: BuildingPluginOptions = {}): GaesupPlugin {
  const pluginId = options.id ?? DEFAULT_PLUGIN_ID;
  const gridExtensionId = options.gridExtensionId ?? DEFAULT_GRID_EXTENSION_ID;
  const placementExtensionId = options.placementExtensionId ?? DEFAULT_PLACEMENT_EXTENSION_ID;
  const saveExtensionId = options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID;
  const storeServiceId = options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID;

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
    ctx.save.register(saveExtensionId, {
      key: saveExtensionId,
      serialize: () => useBuildingStore.getState().serialize(),
      hydrate: (data: Partial<BuildingSerializedState> | null | undefined) => useBuildingStore.getState().hydrate(data),
    }, pluginId);
    ctx.services.register(storeServiceId, {
      useStore: useBuildingStore,
      getState: useBuildingStore.getState,
      setState: useBuildingStore.setState,
    }, pluginId);
    ctx.events.emit('building:ready', {
      pluginId,
      gridExtensionId,
      placementExtensionId,
      saveExtensionId,
      storeServiceId,
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
      ctx.save.remove(saveExtensionId);
      ctx.services.remove(storeServiceId);
    },
  };
}

export const buildingPlugin = createBuildingPlugin();
