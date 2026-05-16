import type { ItemDef, ItemId } from '../types';
declare class Registry {
    private items;
    register(def: ItemDef): void;
    registerAll(defs: ItemDef[]): void;
    get(id: ItemId): ItemDef | undefined;
    require(id: ItemId): ItemDef;
    all(): ItemDef[];
    has(id: ItemId): boolean;
    clear(): void;
}
export declare function getItemRegistry(): Registry;
export type ItemRegistry = Registry;
export {};
