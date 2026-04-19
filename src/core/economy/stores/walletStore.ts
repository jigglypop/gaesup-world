import { create } from 'zustand';

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

const INITIAL_BELLS = 1000;

export const useWalletStore = create<WalletState>((set, get) => ({
  bells: INITIAL_BELLS,
  lifetimeEarned: 0,
  lifetimeSpent: 0,

  add: (amount) => {
    if (amount <= 0) return;
    const s = get();
    set({ bells: s.bells + amount, lifetimeEarned: s.lifetimeEarned + amount });
  },

  spend: (amount) => {
    if (amount <= 0) return true;
    const s = get();
    if (s.bells < amount) return false;
    set({ bells: s.bells - amount, lifetimeSpent: s.lifetimeSpent + amount });
    return true;
  },

  set: (amount) => set({ bells: Math.max(0, amount) }),

  serialize: (): WalletSerialized => {
    const s = get();
    return {
      version: 1,
      bells: s.bells,
      lifetimeEarned: s.lifetimeEarned,
      lifetimeSpent: s.lifetimeSpent,
    };
  },

  hydrate: (data) => {
    if (!data) return;
    set({
      bells: typeof data.bells === 'number' ? Math.max(0, data.bells) : INITIAL_BELLS,
      lifetimeEarned: typeof data.lifetimeEarned === 'number' ? data.lifetimeEarned : 0,
      lifetimeSpent: typeof data.lifetimeSpent === 'number' ? data.lifetimeSpent : 0,
    });
  },
}));
