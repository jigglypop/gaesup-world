export declare function useInventory(): {
    slots: import("..").Slot[];
    add: (itemId: import("../..").ItemId, count?: number) => number;
    remove: (slotIndex: number, count?: number) => boolean;
    removeById: (itemId: import("../..").ItemId, count?: number) => number;
    move: (from: number, to: number) => void;
    countOf: (itemId: import("../..").ItemId) => number;
    has: (itemId: import("../..").ItemId, count?: number) => boolean;
};
export declare function useEquippedItem(): {
    itemId: import("../..").ItemId;
    count: number;
    durability?: number;
} | null;
export declare function useHotbar(): {
    hotbar: number[];
    slots: ({
        itemId: import("../..").ItemId;
        count: number;
        durability?: number;
    } | null)[];
    equipped: number;
    setEquipped: (index: number) => void;
};
export declare function useHotbarKeyboard(enabled?: boolean): void;
