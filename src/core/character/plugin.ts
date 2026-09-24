import { createStoreDomainPlugin } from '../plugins';
import { useCharacterStore, type CharacterStore, CHARACTER_STORE_SERVICE } from './stores/characterStore';
import type {
  CharacterSerialized,
  CharacterSerializedV1,
  CharacterSerializedV2,
} from './types';

export interface CharacterPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.character';
const DEFAULT_SAVE_EXTENSION_ID = 'character';
const DEFAULT_STORE_SERVICE_ID = 'character.store';

export function serializeCharacterState(store: CharacterStore = useCharacterStore): CharacterSerialized {
  return store.getState().serialize();
}

export function hydrateCharacterState(
  data: CharacterSerialized | CharacterSerializedV2 | CharacterSerializedV1 | null | undefined,
  store: CharacterStore = useCharacterStore,
): void {
  store.getState().hydrate(data);
}

export function createCharacterPlugin(options: CharacterPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Character',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useCharacterStore,
    resolveStore: context => context.services.get(CHARACTER_STORE_SERVICE) ?? useCharacterStore,
    readyEvent: 'character:ready',
    capabilities: ['character'],
    serialize: serializeCharacterState,
    hydrate: hydrateCharacterState,
    prepareHydrate: (data, store) => store.getState().prepareHydrate(data),
  });
}

export const characterPlugin = createCharacterPlugin();
