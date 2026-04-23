import type { ItemId } from '../items/types';
import type { PlainDataValue } from '../types/common';

export type DialogNodeId = string;
export type DialogTreeId = string;

export type DialogEffect =
  | { type: 'giveItem'; itemId: ItemId; count?: number }
  | { type: 'takeItem'; itemId: ItemId; count?: number }
  | { type: 'giveBells'; amount: number }
  | { type: 'takeBells'; amount: number }
  | { type: 'addFriendship'; npcId: string; amount: number }
  | { type: 'setFlag'; key: string; value: string | number | boolean }
  | { type: 'startQuest'; questId: string }
  | { type: 'completeQuest'; questId: string }
  | { type: 'openShop'; shopId?: string }
  | { type: 'custom'; key: string; payload?: PlainDataValue };

export type DialogChoice = {
  text: string;
  next?: DialogNodeId | null;
  effects?: DialogEffect[];
  condition?: DialogCondition;
};

export type DialogCondition =
  | { type: 'hasItem'; itemId: ItemId; count?: number }
  | { type: 'hasBells'; amount: number }
  | { type: 'flagEquals'; key: string; value: string | number | boolean }
  | { type: 'friendshipAtLeast'; npcId: string; amount: number };

export type DialogNode = {
  id: DialogNodeId;
  speaker?: string;
  text: string;
  choices?: DialogChoice[];
  next?: DialogNodeId | null;
  effects?: DialogEffect[];
};

export type DialogTree = {
  id: DialogTreeId;
  startId: DialogNodeId;
  nodes: Record<DialogNodeId, DialogNode>;
};

export type DialogContext = {
  npcId?: string;
  flags?: Record<string, string | number | boolean>;
};
