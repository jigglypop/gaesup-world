import { create } from 'zustand';

import { useWalletStore, type WalletStore } from '../../economy/stores/walletStore';
import { useInventoryStore, type InventoryStore } from '../../inventory/stores/inventoryStore';
import { runtimeStoreServiceKey } from '../../plugins/serviceKey';
import { useGaesupRuntime } from '../../runtime/runtimeContext';
import { lazyScopedStore } from '../../stores/scopedStore';
import { notify } from '../../ui/components/Toast/toastStore';
import { isAmount, isCount, isId, isRecord } from '../../utils/guards';
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


function isItemAttachment(a: MailAttachment): a is { itemId: string; count?: number } {
  return (a as { itemId?: string }).itemId !== undefined;
}

function isMailAttachment(value: unknown): value is MailAttachment {
  if (!isRecord<{ itemId: unknown; bells: unknown; count: unknown }>(value)) return false;
  if ('itemId' in value) return isId(value.itemId) && !('bells' in value) && (value.count === undefined || (isCount(value.count) && value.count > 0));
  return isAmount(value.bells);
}

/** What `send` accepts and a mail save may hold. */
function isMailMessage(value: unknown): value is MailMessage {
  return isRecord<MailMessage>(value) && isId(value.id) && typeof value.from === 'string' && typeof value.subject === 'string'
    && typeof value.body === 'string' && isCount(value.sentDay)
    && (value.read === undefined || typeof value.read === 'boolean')
    && (value.claimed === undefined || typeof value.claimed === 'boolean')
    && (value.attachments === undefined || (Array.isArray(value.attachments) && value.attachments.every(isMailAttachment)));
}

const copyAttachment = (a: MailAttachment): MailAttachment => (isItemAttachment(a)
  ? { itemId: a.itemId, ...(a.count !== undefined ? { count: a.count } : {}) }
  : { bells: a.bells });

const copyMessage = (m: MailMessage): MailMessage => ({ ...m, ...(m.attachments ? { attachments: m.attachments.map(copyAttachment) } : {}) });


export function createMailStore(inventoryStore: InventoryStore, walletStore: WalletStore) {
  let _seq = 0;
  function genId(): string { return `mail_${Date.now().toString(36)}_${(++_seq).toString(36)}`; }
  const PENDING_CLAIMS = new Set<string>();
  return create<State>((set, get) => ({
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
    if (!isMailMessage(next)) return '';
    set({ messages: [...get().messages, copyMessage(next)] });
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
          const left = inventoryStore.getState().add(a.itemId, a.count ?? 1);
          if (left > 0) {
            const attachments = [{ ...a, count: left }, ...msg.attachments.slice(index + 1)];
            set({ messages: get().messages.map((m) => (m.id === id ? { ...m, attachments, read: true } : m)) });
            notify('warn', '가방이 가득 찼어요. 남은 첨부물은 나중에 받을 수 있어요.');
            return false;
          }
        } else {
          walletStore.getState().add(a.bells);
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

  serialize: () => ({ version: 1, messages: get().messages.map(copyMessage) }),

  prepareHydrate: (data) => {
    if (data === null || data === undefined) return () => {};
    if (typeof data !== 'object' || data.version !== 1 || !Array.isArray(data.messages)) {
      throw new TypeError('Invalid mail snapshot');
    }
    const ids = new Set<string>();
    const messages = data.messages.map((message) => {
      if (!isMailMessage(message) || ids.has(message.id)) throw new TypeError('Invalid mail message');
      ids.add(message.id);
      return copyMessage(message);
    });
    return () => set({ messages });
  },
  hydrate: (data) => get().prepareHydrate(data)(),
}));
}

export type MailStore = ReturnType<typeof createMailStore>;
export const MAIL_STORE_SERVICE = runtimeStoreServiceKey<MailStore>('mail');
export const { useStore: useMailStore, useStoreApi: useMailStoreApi } = lazyScopedStore(
  'useMailStore', () => createMailStore(useInventoryStore, useWalletStore), () => useGaesupRuntime()?.mailStore,
);
