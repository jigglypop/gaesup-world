export type FriendshipLevel = 'stranger' | 'acquaintance' | 'friend' | 'close' | 'best';
export type FriendshipEntry = {
    npcId: string;
    score: number;
    todayGained: number;
    lastGiftDay: number;
    giftHistory: Record<string, number>;
};
export type RelationsSerialized = {
    version: number;
    entries: Record<string, FriendshipEntry>;
};
export declare const FRIENDSHIP_LEVELS: Array<{
    level: FriendshipLevel;
    min: number;
}>;
export declare const DAILY_FRIENDSHIP_CAP = 25;
