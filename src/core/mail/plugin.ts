import { createStoreDomainPlugin } from '../plugins';
import { useMailStore } from './stores/mailStore';
import type { MailSerialized } from './types';

export interface MailPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.mail';
const DEFAULT_SAVE_EXTENSION_ID = 'mail';
const DEFAULT_STORE_SERVICE_ID = 'mail.store';

export function serializeMailState(): MailSerialized {
  return useMailStore.getState().serialize();
}

export function hydrateMailState(data: MailSerialized | null | undefined): void {
  useMailStore.getState().hydrate(data);
}

export function createMailPlugin(options: MailPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Mail',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useMailStore,
    readyEvent: 'mail:ready',
    capabilities: ['mail'],
    serialize: serializeMailState,
    hydrate: hydrateMailState,
  });
}

export const mailPlugin = createMailPlugin();
