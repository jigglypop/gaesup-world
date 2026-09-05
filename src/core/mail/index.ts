export type { MailAttachment, MailMessage, MailSerialized } from './types';
export {
  createMailPlugin,
  hydrateMailState,
  mailPlugin,
  serializeMailState,
} from './plugin';
export type { MailPluginOptions } from './plugin';
export { useMailStore } from './stores/mailStore';
export { MailboxUI } from './components/MailboxUI';
export type { MailboxUIProps } from './components/MailboxUI';
