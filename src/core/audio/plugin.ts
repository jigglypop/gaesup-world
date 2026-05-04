import type { GaesupPlugin, PluginContext } from '../plugins';
import { useAudioStore } from './stores/audioStore';
import type { AudioSerialized } from './types';

export interface AudioPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.audio';
const DEFAULT_SAVE_EXTENSION_ID = 'audio';
const DEFAULT_STORE_SERVICE_ID = 'audio.store';

export function serializeAudioState(): AudioSerialized {
  return useAudioStore.getState().serialize();
}

export function hydrateAudioState(data: AudioSerialized | null | undefined): void {
  useAudioStore.getState().hydrate(data);
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
      ctx.save.register(saveExtensionId, {
        key: saveExtensionId,
        serialize: serializeAudioState,
        hydrate: hydrateAudioState,
      }, pluginId);
      ctx.services.register(storeServiceId, {
        useStore: useAudioStore,
        getState: useAudioStore.getState,
        setState: useAudioStore.setState,
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
