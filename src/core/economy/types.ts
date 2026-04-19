import type { ItemId } from '../items/types';

export type WalletSerialized = {
  version: number;
  bells: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
};

export type ShopOffer = {
  itemId: ItemId;
  price?: number;
  stock?: number;
};

export type ShopSerialized = {
  version: number;
  lastRolledDay: number;
  dailyStock: ShopOffer[];
};
