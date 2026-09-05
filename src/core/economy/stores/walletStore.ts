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
  prepareHydrate: (data: WalletSerialized | null | undefined) => () => void;
};

const INITIAL_BELLS = 1000;

export const useWalletStore = create<WalletState>((set, get) => ({
  bells: INITIAL_BELLS,
  lifetimeEarned: 0,
  lifetimeSpent: 0,

  add: (amount) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const s = get();
    const bells = s.bells + amount;
    const lifetimeEarned = s.lifetimeEarned + amount;
    if (!Number.isFinite(bells) || !Number.isFinite(lifetimeEarned)) return;
    set({ bells, lifetimeEarned });
  },

  spend: (amount) => {
    if (!Number.isFinite(amount)) return false;
    if (amount <= 0) return true;
    const s = get();
    if (s.bells < amount) return false;
    const lifetimeSpent = s.lifetimeSpent + amount;
    if (!Number.isFinite(lifetimeSpent)) return false;
    set({ bells: s.bells - amount, lifetimeSpent });
    return true;
  },

  set: (amount) => {
    if (Number.isFinite(amount)) set({ bells: Math.max(0, amount) });
  },

  serialize: (): WalletSerialized => {
    const s = get();
    return {
      version: 1,
      bells: s.bells,
      lifetimeEarned: s.lifetimeEarned,
      lifetimeSpent: s.lifetimeSpent,
    };
  },

  prepareHydrate: (data) => {
    if (data === null || data === undefined) return () => {};
    if (typeof data !== 'object' || data.version !== 1 ||
      ![data.bells, data.lifetimeEarned, data.lifetimeSpent].every(
        (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0,
      )) throw new TypeError('Invalid wallet snapshot');
    const { bells, lifetimeEarned, lifetimeSpent } = data;
    return () => set({ bells, lifetimeEarned, lifetimeSpent });
  },
  hydrate: (data) => get().prepareHydrate(data)(),
}));
