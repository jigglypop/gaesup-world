import { createStoreDomainPlugin } from '../plugins';
import { useQuestStore, type QuestStore, QUESTS_STORE_SERVICE } from './stores/questStore';
import type { QuestSerialized } from './types';

export interface QuestsPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.quests';
const DEFAULT_SAVE_EXTENSION_ID = 'quests';
const DEFAULT_STORE_SERVICE_ID = 'quests.store';

export function serializeQuestsState(store: QuestStore = useQuestStore): QuestSerialized {
  return store.getState().serialize();
}

export function hydrateQuestsState(data: QuestSerialized | null | undefined, store: QuestStore = useQuestStore): void {
  store.getState().hydrate(data);
}

export function createQuestsPlugin(options: QuestsPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Quests',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useQuestStore,
    resolveStore: ctx => ctx.services.get(QUESTS_STORE_SERVICE) ?? useQuestStore,
    readyEvent: 'quests:ready',
    capabilities: ['quests'],
    serialize: serializeQuestsState,
    hydrate: hydrateQuestsState,
    prepareHydrate: (data, store) => store.getState().prepareHydrate(data),
  });
}

export const questsPlugin = createQuestsPlugin();
