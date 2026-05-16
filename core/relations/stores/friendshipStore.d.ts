import type { ItemId } from '../../items/types';
import { type FriendshipEntry, type FriendshipLevel, type RelationsSerialized } from '../types';
type State = {
    entries: Record<string, FriendshipEntry>;
    ensure: (npcId: string) => FriendshipEntry;
    add: (npcId: string, amount: number, gameDay: number) => number;
    giveGift: (npcId: string, itemId: ItemId, gameDay: number) => {
        gained: number;
        capped: boolean;
    };
    resetDaily: (npcId?: string) => void;
    scoreOf: (npcId: string) => number;
    levelOf: (npcId: string) => FriendshipLevel;
    serialize: () => RelationsSerialized;
    hydrate: (data: RelationsSerialized | null | undefined) => void;
};
export declare const useFriendshipStore: import("zustand").UseBoundStore<import("zustand").StoreApi<State>>;
export {};
