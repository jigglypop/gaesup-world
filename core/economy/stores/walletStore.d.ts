import type { WalletSerialized } from '../types';
type WalletState = {
    bells: number;
    lifetimeEarned: number;
    lifetimeSpent: number;
    add: (amount: number) => void;
    spend: (amount: number) => boolean;
    set: (amount: number) => void;
    serialize: () => WalletSerialized;
    hydrate: (data: WalletSerialized | null | undefined) => void;
};
export declare const useWalletStore: import("zustand").UseBoundStore<import("zustand").StoreApi<WalletState>>;
export {};
