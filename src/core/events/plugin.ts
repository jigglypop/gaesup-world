import { createStoreDomainPlugin } from '../plugins';
import { useEventsStore } from './stores/eventsStore';
import type { EventsSerialized } from './types';

export interface EventsPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.events';
const DEFAULT_SAVE_EXTENSION_ID = 'events';
const DEFAULT_STORE_SERVICE_ID = 'events.store';

export function serializeEventsState(): EventsSerialized {
  return useEventsStore.getState().serialize();
}

export function hydrateEventsState(data: EventsSerialized | null | undefined): void {
  useEventsStore.getState().hydrate(data);
}

export function createEventsPlugin(options: EventsPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Events',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useEventsStore,
    readyEvent: 'events:ready',
    capabilities: ['events'],
    serialize: serializeEventsState,
    hydrate: hydrateEventsState,
  });
}

export const eventsPlugin = createEventsPlugin();
