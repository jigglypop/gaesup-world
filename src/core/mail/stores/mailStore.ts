import { create } from 'zustand';

import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { useWalletStore } from '../../economy/stores/walletStore';
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
};

let _seq = 0;
function genId(): string { return `mail_${Date.now().toString(36)}_${(++_seq).toString(36)}`; }

function isItemAttachment(a: MailAttachment): a is { itemId: string; count?: number } {
  return (a as { itemId?: string }).itemId !== undefined;
}

export const useMailStore = create<State>((set, get) => ({
  messages: [],

  send: (msg) => {
    const id = msg.id ?? genId();
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
    const msg = get().messages.find((m) => m.id === id);
    if (!msg || msg.claimed || !msg.attachments) return false;
    let allClaimed = true;
    for (const a of msg.attachments) {
      if (isItemAttachment(a)) {
        const left = useInventoryStore.getState().add(a.itemId, a.count ?? 1);
        if (left > 0) { allClaimed = false; notify('warn', '인벤토리 부족, 일부 우편물 미수령'); break; }
      } else {
        useWalletStore.getState().add(a.bells);
      }
    }
    if (allClaimed) {
      set({ messages: get().messages.map((m) => (m.id === id ? { ...m, claimed: true, read: true } : m)) });
      notify('reward', '우편 첨부물 수령');
    }
    return allClaimed;
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

  hydrate: (data) => {
    if (!data || !Array.isArray(data.messages)) return;
    set({ messages: data.messages.map((m) => ({ ...m })) });
  },
}));
