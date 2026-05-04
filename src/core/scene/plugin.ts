import { createStoreDomainPlugin } from '../plugins';
import { useSceneStore } from './stores/sceneStore';
import type { SceneSerialized } from './types';

export interface ScenePluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.scene';
const DEFAULT_SAVE_EXTENSION_ID = 'scene';
const DEFAULT_STORE_SERVICE_ID = 'scene.store';

export function serializeSceneState(): SceneSerialized {
  return useSceneStore.getState().serialize();
}

export function hydrateSceneState(data: SceneSerialized | null | undefined): void {
  useSceneStore.getState().hydrate(data);
}

export function createScenePlugin(options: ScenePluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Scene',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useSceneStore,
    readyEvent: 'scene:ready',
    capabilities: ['scene'],
    serialize: serializeSceneState,
    hydrate: hydrateSceneState,
  });
}

export const scenePlugin = createScenePlugin();
