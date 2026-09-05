import type { ItemId } from '../items/types';

export type MailAttachment = { itemId: ItemId; count?: number } | { bells: number };

export type MailMessage = {
  id: string;
  from: string;
  subject: string;
  body: string;
  sentDay: number;
  attachments?: MailAttachment[];
  read?: boolean;
  claimed?: boolean;
};

export type MailSerialized = {
  version: number;
  messages: MailMessage[];
};
