import type { GaesupPlugin, PluginContext } from '../plugins';
import { useAudioStore, type AudioStore } from './stores/audioStore';
import type { AudioSerialized } from './types';

export interface AudioPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

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
  const pluginId = options.id ?? DEFAULT_PLUGIN_ID;
  const saveExtensionId = options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID;
  const storeServiceId = options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID;

  return {
    id: pluginId,
    name: 'GaeSup Audio',
    version: '0.1.0',
    runtime: 'client',
    capabilities: ['audio'],
    setup(ctx: PluginContext) {
      const store = ctx.services.get<AudioStore>('gaesup.runtime.audio-store') ?? useAudioStore;
      ctx.save.register(saveExtensionId, {
        key: saveExtensionId,
        serialize: () => serializeAudioState(store),
        hydrate: (data: AudioSerialized | null | undefined) => hydrateAudioState(data, store),
        prepareHydrate: (data: AudioSerialized | null | undefined) => store.getState().prepareHydrate(data),
      }, pluginId);
      ctx.services.register(storeServiceId, {
        useStore: store,
        getState: store.getState,
        setState: store.setState,
      }, pluginId);
      ctx.events.emit('audio:ready', {
        pluginId,
        saveExtensionId,
        storeServiceId,
      });
    },
    dispose(ctx) {
      ctx.save.remove(saveExtensionId);
      ctx.services.remove(storeServiceId);
    },
  };
}

export const audioPlugin = createAudioPlugin();
