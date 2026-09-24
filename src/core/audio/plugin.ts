import { createStoreDomainPlugin, type GaesupPlugin } from '../plugins';
import { useAudioStore, type AudioStore, AUDIO_STORE_SERVICE } from './stores/audioStore';
import type { AudioSerialized } from './types';

export type AudioPluginOptions = {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
};

const DEFAULT_PLUGIN_ID = 'gaesup.audio';
const DEFAULT_SAVE_EXTENSION_ID = 'audio';
const DEFAULT_STORE_SERVICE_ID = 'audio.store';

export function serializeAudioState(store: AudioStore = useAudioStore): AudioSerialized {
  return store.getState().serialize();
}

export function hydrateAudioState(data: AudioSerialized | null | undefined, store: AudioStore = useAudioStore): void {
  store.getState().hydrate(data);
}

export function createAudioPlugin(options: AudioPluginOptions = {}): GaesupPlugin {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Audio',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useAudioStore,
    readyEvent: 'audio:ready',
    capabilities: ['audio'],
    resolveStore: (ctx) => ctx.services.get<AudioStore>(AUDIO_STORE_SERVICE) ?? useAudioStore,
    serialize: serializeAudioState,
    hydrate: hydrateAudioState,
    prepareHydrate: (data, store) => store.getState().prepareHydrate(data),
  });
}

export const audioPlugin = createAudioPlugin();
