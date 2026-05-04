import { createStoreDomainPlugin } from '../plugins';
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
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Farming',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: usePlotStore,
    readyEvent: 'farming:ready',
    capabilities: ['farming'],
    serialize: serializeFarmingState,
    hydrate: hydrateFarmingState,
  });
}

export const farmingPlugin = createFarmingPlugin();
