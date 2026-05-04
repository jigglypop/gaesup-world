import { createStoreDomainPlugin } from '../plugins';
import { useQuestStore } from './stores/questStore';
import type { QuestSerialized } from './types';

export interface QuestsPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.quests';
const DEFAULT_SAVE_EXTENSION_ID = 'quests';
const DEFAULT_STORE_SERVICE_ID = 'quests.store';

export function serializeQuestsState(): QuestSerialized {
  return useQuestStore.getState().serialize();
}

export function hydrateQuestsState(data: QuestSerialized | null | undefined): void {
  useQuestStore.getState().hydrate(data);
}

export function createQuestsPlugin(options: QuestsPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Quests',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useQuestStore,
    readyEvent: 'quests:ready',
    capabilities: ['quests'],
    serialize: serializeQuestsState,
    hydrate: hydrateQuestsState,
  });
}

export const questsPlugin = createQuestsPlugin();
