import { createStoreDomainPlugin } from '../plugins';
import { useAudioStore } from './stores/audioStore';
import type { AudioSerialized } from './types';

export type AudioPluginOptions = {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
};

const DEFAULT_PLUGIN_ID = 'gaesup.audio';
const DEFAULT_SAVE_EXTENSION_ID = 'audio';
const DEFAULT_STORE_SERVICE_ID = 'audio.store';

export function serializeAudioState(): AudioSerialized {
  return useAudioStore.getState().serialize();
}

export function hydrateAudioState(data: AudioSerialized | null | undefined): void {
  useAudioStore.getState().hydrate(data);
}

export function createAudioPlugin(options: AudioPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Audio',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useAudioStore,
    readyEvent: 'audio:ready',
    capabilities: ['audio'],
    serialize: serializeAudioState,
    hydrate: hydrateAudioState,
    prepareHydrate: (data) => useAudioStore.getState().prepareHydrate(data),
  });
}

export const audioPlugin = createAudioPlugin();
