import type { ItemId } from '../items/types';

export type QuestId = string;
export type ObjectiveId = string;

export type QuestObjective =
  | { id: ObjectiveId; type: 'collect'; itemId: ItemId; count: number; description?: string }
  | { id: ObjectiveId; type: 'deliver'; npcId: string; itemId: ItemId; count: number; description?: string }
  | { id: ObjectiveId; type: 'talk'; npcId: string; description?: string }
  | { id: ObjectiveId; type: 'visit'; tag: string; description?: string }
  | { id: ObjectiveId; type: 'flag'; key: string; value: string | number | boolean; description?: string };

export type QuestReward =
  | { type: 'item'; itemId: ItemId; count?: number }
  | { type: 'bells'; amount: number }
  | { type: 'friendship'; npcId: string; amount: number };

export type QuestDef = {
  id: QuestId;
  name: string;
  giverNpcId?: string;
  summary: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  prerequisiteQuests?: QuestId[];
  repeatable?: boolean;
};

export type QuestStatus = 'locked' | 'available' | 'active' | 'completed' | 'failed';

export type QuestProgress = {
  questId: QuestId;
  status: QuestStatus;
  progress: Record<ObjectiveId, number>;
  startedAt?: number;
  completedAt?: number;
};

export type QuestSerialized = {
  version: number;
  state: Record<QuestId, QuestProgress>;
};
