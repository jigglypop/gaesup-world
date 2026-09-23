import { createStoreDomainPlugin } from '../plugins';
import type { PluginContext } from '../plugins';
import { acquireFarmingClock } from './stores/clock';
import { usePlotStore, type PlotStore } from './stores/plotStore';
import type { FarmingSerialized } from './types';
import type { SaveSystem } from '../save/core/SaveSystem';
import { RUNTIME_TIME_STORE_SERVICE_ID } from '../time/core/timeClock';
import type { TimeStore } from '../time/stores/timeStore';

export interface FarmingPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.farming';
const DEFAULT_SAVE_EXTENSION_ID = 'farming';
const DEFAULT_STORE_SERVICE_ID = 'farming.store';

export function serializeFarmingState(store: PlotStore = usePlotStore): FarmingSerialized {
  return store.getState().serialize();
}

export function hydrateFarmingState(data: FarmingSerialized | null | undefined, store: PlotStore = usePlotStore): void {
  store.getState().hydrate(data);
}

export function createFarmingPlugin(options: FarmingPluginOptions = {}) {
  const plugin = createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Farming',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: usePlotStore,
    resolveStore: ctx => ctx.services.get<PlotStore>('gaesup.runtime.farming-store') ?? usePlotStore,
    readyEvent: 'farming:ready',
    capabilities: ['farming'],
    serialize: serializeFarmingState,
    hydrate: hydrateFarmingState,
    prepareHydrate: (data, store) => store.getState().prepareHydrate(data),
  });
  const releases = new WeakMap<PluginContext, () => void>();
  return {
    ...plugin,
    async setup(context: PluginContext) {
      await plugin.setup?.(context);
      if (!releases.has(context)) releases.set(context, acquireFarmingClock(context.services.get<TimeStore>(RUNTIME_TIME_STORE_SERVICE_ID), context.services.get<PlotStore>('gaesup.runtime.farming-store'), () => !context.services.get<SaveSystem>('gaesup.runtime.save-system')?.isRestoring()));
    },
    async dispose(context: PluginContext) {
      releases.get(context)?.();
      releases.delete(context);
      await plugin.dispose?.(context);
    },
  };
}

export const farmingPlugin = createFarmingPlugin();
