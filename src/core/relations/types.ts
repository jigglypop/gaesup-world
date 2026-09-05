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

export const FRIENDSHIP_LEVELS: Array<{ level: FriendshipLevel; min: number }> = [
  { level: 'stranger',     min: 0 },
  { level: 'acquaintance', min: 50 },
  { level: 'friend',       min: 150 },
  { level: 'close',        min: 350 },
  { level: 'best',         min: 700 },
];

export const DAILY_FRIENDSHIP_CAP = 25;
