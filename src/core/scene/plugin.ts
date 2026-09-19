import { createStoreDomainPlugin } from '../plugins';
import { useSceneStore, type SceneStore } from './stores/sceneStore';
import type { SceneSerialized } from './types';

export interface ScenePluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.scene';
const DEFAULT_SAVE_EXTENSION_ID = 'scene';
const DEFAULT_STORE_SERVICE_ID = 'scene.store';

export function serializeSceneState(store: SceneStore = useSceneStore): SceneSerialized {
  return store.getState().serialize();
}

export function hydrateSceneState(data: SceneSerialized | null | undefined, store: SceneStore = useSceneStore): void {
  store.getState().hydrate(data);
}

export function createScenePlugin(options: ScenePluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Scene',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useSceneStore,
    resolveStore: context => context.services.get<SceneStore>('gaesup.runtime.scene-store') ?? useSceneStore,
    readyEvent: 'scene:ready',
    capabilities: ['scene'],
    serialize: serializeSceneState,
    hydrate: hydrateSceneState,
    prepareHydrate: (data, store) => store.getState().prepareHydrate(data),
  });
}

export const scenePlugin = createScenePlugin();
