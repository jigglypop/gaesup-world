export type { MailAttachment, MailMessage, MailSerialized } from './types';
export {
  createMailPlugin,
  hydrateMailState,
  mailPlugin,
  serializeMailState,
} from './plugin';
export type { MailPluginOptions } from './plugin';
export { useMailStore, useMailStoreApi, createMailStore } from './stores/mailStore';
export { MailboxUI } from './components/MailboxUI';
export type { MailboxUIProps } from './components/MailboxUI';

export type { MailStore } from './stores/mailStore';
