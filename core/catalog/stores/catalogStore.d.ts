import type { ItemId } from '../../items/types';
import type { CatalogEntry, CatalogSerialized } from '../types';
type State = {
    entries: Record<ItemId, CatalogEntry>;
    record: (itemId: ItemId, count: number, gameDay: number) => void;
    has: (itemId: ItemId) => boolean;
    get: (itemId: ItemId) => CatalogEntry | undefined;
    size: () => number;
    serialize: () => CatalogSerialized;
    hydrate: (data: CatalogSerialized | null | undefined) => void;
};
export declare const useCatalogStore: import("zustand").UseBoundStore<import("zustand").StoreApi<State>>;
export {};
