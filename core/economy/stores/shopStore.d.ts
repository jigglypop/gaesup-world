import type { ItemId } from '../../items/types';
import type { ShopOffer, ShopSerialized } from '../types';
type ShopState = {
    catalog: ItemId[];
    dailyStock: ShopOffer[];
    lastRolledDay: number;
    setCatalog: (ids: ItemId[]) => void;
    rollDailyStock: (gameDay: number, count?: number) => void;
    buy: (itemId: ItemId, count?: number) => {
        ok: boolean;
        reason?: string;
    };
    sell: (itemId: ItemId, count?: number) => {
        ok: boolean;
        reason?: string;
    };
    priceOf: (itemId: ItemId) => number;
    sellPriceOf: (itemId: ItemId) => number;
    serialize: () => ShopSerialized;
    hydrate: (data: ShopSerialized | null | undefined) => void;
};
export declare const useShopStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ShopState>>;
export {};
