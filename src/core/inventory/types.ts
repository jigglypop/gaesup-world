import type { ItemId } from '../items/types';

export type Slot = {
  itemId: ItemId;
  count: number;
  durability?: number;
} | null;

export type InventorySerialized = {
  version: number;
  slots: Slot[];
  hotbar: number[];
  equippedHotbar: number;
};

export const DEFAULT_INVENTORY_SIZE = 20;
export const DEFAULT_HOTBAR_SIZE = 5;
