import type { ItemCategory, ItemId } from '../items/types';

export type CatalogEntry = {
  itemId: ItemId;
  firstSeenDay: number;
  totalCollected: number;
};

export type CatalogSerialized = {
  version: number;
  entries: Record<ItemId, CatalogEntry>;
};

export const CATALOG_CATEGORIES: ItemCategory[] = ['fish', 'bug', 'food', 'material', 'furniture', 'tool', 'misc'];
