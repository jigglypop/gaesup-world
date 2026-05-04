import { createStoreDomainPlugin } from '../plugins';
import { useCharacterStore } from './stores/characterStore';
import type { CharacterSerialized } from './types';

export interface CharacterPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.character';
const DEFAULT_SAVE_EXTENSION_ID = 'character';
const DEFAULT_STORE_SERVICE_ID = 'character.store';

export function serializeCharacterState(): CharacterSerialized {
  return useCharacterStore.getState().serialize();
}

export function hydrateCharacterState(data: CharacterSerialized | null | undefined): void {
  useCharacterStore.getState().hydrate(data);
}

export function createCharacterPlugin(options: CharacterPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Character',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useCharacterStore,
    readyEvent: 'character:ready',
    capabilities: ['character'],
    serialize: serializeCharacterState,
    hydrate: hydrateCharacterState,
  });
}

export const characterPlugin = createCharacterPlugin();
