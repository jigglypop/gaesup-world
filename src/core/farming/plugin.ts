import { createStoreDomainPlugin } from '../plugins';
import type { PluginContext } from '../plugins';
import { acquireFarmingClock } from './stores/clock';
import { usePlotStore } from './stores/plotStore';
import type { FarmingSerialized } from './types';

export interface FarmingPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.farming';
const DEFAULT_SAVE_EXTENSION_ID = 'farming';
const DEFAULT_STORE_SERVICE_ID = 'farming.store';

export function serializeFarmingState(): FarmingSerialized {
  return usePlotStore.getState().serialize();
}

export function hydrateFarmingState(data: FarmingSerialized | null | undefined): void {
  usePlotStore.getState().hydrate(data);
}

export function createFarmingPlugin(options: FarmingPluginOptions = {}) {
  const plugin = createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Farming',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: usePlotStore,
    readyEvent: 'farming:ready',
    capabilities: ['farming'],
    serialize: serializeFarmingState,
    hydrate: hydrateFarmingState,
    prepareHydrate: (data) => usePlotStore.getState().prepareHydrate(data),
  });
  const releases = new WeakMap<PluginContext, () => void>();
  return {
    ...plugin,
    async setup(context: PluginContext) {
      await plugin.setup?.(context);
      if (!releases.has(context)) releases.set(context, acquireFarmingClock());
    },
    async dispose(context: PluginContext) {
      releases.get(context)?.();
      releases.delete(context);
      await plugin.dispose?.(context);
    },
  };
}

export const farmingPlugin = createFarmingPlugin();
