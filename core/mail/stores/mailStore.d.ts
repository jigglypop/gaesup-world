import type { MailMessage, MailSerialized } from '../types';
type State = {
    messages: MailMessage[];
    send: (msg: Omit<MailMessage, 'id' | 'read' | 'claimed'> & {
        id?: string;
    }) => string;
    markRead: (id: string) => void;
    markAllRead: () => void;
    claim: (id: string) => boolean;
    delete: (id: string) => void;
    unreadCount: () => number;
    hasUnclaimedAttachments: () => boolean;
    serialize: () => MailSerialized;
    hydrate: (data: MailSerialized | null | undefined) => void;
};
export declare const useMailStore: import("zustand").UseBoundStore<import("zustand").StoreApi<State>>;
export {};
