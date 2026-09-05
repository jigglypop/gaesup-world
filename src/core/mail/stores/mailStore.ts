import { create } from 'zustand';

import { useWalletStore } from '../../economy/stores/walletStore';
import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { notify } from '../../ui/components/Toast/toastStore';
import type { MailAttachment, MailMessage, MailSerialized } from '../types';

type State = {
  messages: MailMessage[];

  send: (msg: Omit<MailMessage, 'id' | 'read' | 'claimed'> & { id?: string }) => string;
  markRead: (id: string) => void;
  markAllRead: () => void;
  claim: (id: string) => boolean;
  delete: (id: string) => void;

  unreadCount: () => number;
  hasUnclaimedAttachments: () => boolean;

  serialize: () => MailSerialized;
  hydrate: (data: MailSerialized | null | undefined) => void;
  prepareHydrate: (data: MailSerialized | null | undefined) => () => void;
};

let _seq = 0;
function genId(): string { return `mail_${Date.now().toString(36)}_${(++_seq).toString(36)}`; }

function isItemAttachment(a: MailAttachment): a is { itemId: string; count?: number } {
  return (a as { itemId?: string }).itemId !== undefined;
}

const PENDING_CLAIMS = new Set<string>();

export const useMailStore = create<State>((set, get) => ({
  messages: [],

  send: (msg) => {
    const id = msg.id ?? genId();
    if (get().messages.some((message) => message.id === id)) return id;
    const next: MailMessage = {
      id,
      from: msg.from,
      subject: msg.subject,
      body: msg.body,
      sentDay: msg.sentDay,
      ...(msg.attachments ? { attachments: msg.attachments } : {}),
      read: false,
      claimed: !msg.attachments || msg.attachments.length === 0,
    };
    set({ messages: [...get().messages, next] });
    notify('mail', `새 우편: ${msg.subject}`);
    return id;
  },

  markRead: (id) => {
    set({ messages: get().messages.map((m) => (m.id === id ? { ...m, read: true } : m)) });
  },

  markAllRead: () => {
    set({ messages: get().messages.map((m) => ({ ...m, read: true })) });
  },

  claim: (id) => {
    if (PENDING_CLAIMS.has(id)) return false;
    PENDING_CLAIMS.add(id);
    try {
      const msg = get().messages.find((m) => m.id === id);
      if (!msg || msg.claimed || !msg.attachments) return false;
      for (const [index, a] of msg.attachments.entries()) {
        if (isItemAttachment(a)) {
          const left = useInventoryStore.getState().add(a.itemId, a.count ?? 1);
          if (left > 0) {
            const attachments = [{ ...a, count: left }, ...msg.attachments.slice(index + 1)];
            set({ messages: get().messages.map((m) => (m.id === id ? { ...m, attachments, read: true } : m)) });
            notify('warn', '가방이 가득 찼어요. 남은 첨부물은 나중에 받을 수 있어요.');
            return false;
          }
        } else {
          useWalletStore.getState().add(a.bells);
        }
      }
      set({ messages: get().messages.map((m) => (m.id === id ? { ...m, claimed: true, read: true } : m)) });
      notify('reward', '우편 첨부물 수령');
      return true;
    } finally {
      PENDING_CLAIMS.delete(id);
    }
  },

  delete: (id) => {
    set({ messages: get().messages.filter((m) => m.id !== id) });
  },

  unreadCount: () => get().messages.reduce((n, m) => n + (m.read ? 0 : 1), 0),
  hasUnclaimedAttachments: () => get().messages.some((m) => !m.claimed && (m.attachments?.length ?? 0) > 0),

  serialize: () => ({
    version: 1,
    messages: get().messages.map((m) => ({
      ...m,
      ...(m.attachments ? { attachments: m.attachments.map((a) => ({ ...a })) } : {}),
    })),
  }),

  prepareHydrate: (data) => {
    if (data === null || data === undefined) return () => {};
    if (typeof data !== 'object' || data.version !== 1 || !Array.isArray(data.messages)) {
      throw new TypeError('Invalid mail snapshot');
    }
    const ids = new Set<string>();
    const messages = data.messages.map((message) => {
      if (!message || typeof message !== 'object' || typeof message.id !== 'string' || !message.id.trim()
        || ids.has(message.id) || typeof message.from !== 'string' || typeof message.subject !== 'string'
        || typeof message.body !== 'string' || !Number.isSafeInteger(message.sentDay) || message.sentDay < 0
        || (message.read !== undefined && typeof message.read !== 'boolean')
        || (message.claimed !== undefined && typeof message.claimed !== 'boolean')
        || (message.attachments !== undefined && !Array.isArray(message.attachments))) {
        throw new TypeError('Invalid mail message');
      }
      ids.add(message.id);
      const attachments = message.attachments?.map((attachment) => {
        if (!attachment || typeof attachment !== 'object' || Array.isArray(attachment)) {
          throw new TypeError('Invalid mail attachment');
        }
        if (isItemAttachment(attachment)) {
          if (typeof attachment.itemId !== 'string' || !attachment.itemId.trim() || 'bells' in attachment
            || (attachment.count !== undefined && (!Number.isSafeInteger(attachment.count) || attachment.count <= 0))) {
            throw new TypeError('Invalid mail item attachment');
          }
          return { ...attachment };
        }
        if (!Number.isFinite(attachment.bells) || attachment.bells < 0) {
          throw new TypeError('Invalid mail currency attachment');
        }
        return { bells: attachment.bells };
      });
      return { ...message, ...(attachments ? { attachments } : {}) };
    });
    return () => set({ messages });
  },
  hydrate: (data) => get().prepareHydrate(data)(),
}));
