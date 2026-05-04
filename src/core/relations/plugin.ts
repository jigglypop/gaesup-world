import { createStoreDomainPlugin } from '../plugins';
import { useFriendshipStore } from './stores/friendshipStore';
import type { RelationsSerialized } from './types';

export interface RelationsPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.relations';
const DEFAULT_SAVE_EXTENSION_ID = 'relations';
const DEFAULT_STORE_SERVICE_ID = 'relations.store';

export function serializeRelationsState(): RelationsSerialized {
  return useFriendshipStore.getState().serialize();
}

export function hydrateRelationsState(data: RelationsSerialized | null | undefined): void {
  useFriendshipStore.getState().hydrate(data);
}

export function createRelationsPlugin(options: RelationsPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Relations',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useFriendshipStore,
    readyEvent: 'relations:ready',
    capabilities: ['relations'],
    serialize: serializeRelationsState,
    hydrate: hydrateRelationsState,
  });
}

export const relationsPlugin = createRelationsPlugin();
