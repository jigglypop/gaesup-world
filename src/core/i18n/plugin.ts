import { createStoreDomainPlugin } from '../plugins';
import { useI18nStore } from './stores/i18nStore';
import type { I18nSerialized } from './types';

export interface I18nPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.i18n';
const DEFAULT_SAVE_EXTENSION_ID = 'i18n';
const DEFAULT_STORE_SERVICE_ID = 'i18n.store';

export function serializeI18nState(): I18nSerialized {
  return useI18nStore.getState().serialize();
}

export function hydrateI18nState(data: I18nSerialized | null | undefined): void {
  useI18nStore.getState().hydrate(data);
}

export function createI18nPlugin(options: I18nPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup i18n',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useI18nStore,
    readyEvent: 'i18n:ready',
    capabilities: ['i18n'],
    serialize: serializeI18nState,
    hydrate: hydrateI18nState,
  });
}

export const i18nPlugin = createI18nPlugin();
