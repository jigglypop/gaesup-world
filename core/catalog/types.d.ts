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
export declare const CATALOG_CATEGORIES: ItemCategory[];
