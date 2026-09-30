import type { PlainDataValue } from '../types/common';

export type DialogNodeId = string;
export type DialogTreeId = string;

/** Game-specific effects and conditions are `custom` entries the game handles through the runner options. */
export type DialogEffect =
  | { type: 'setFlag'; key: string; value: string | number | boolean }
  | { type: 'custom'; key: string; payload?: PlainDataValue };

export type DialogCondition =
  | { type: 'flagEquals'; key: string; value: string | number | boolean }
  | { type: 'custom'; key: string; payload?: PlainDataValue };

export type DialogChoice = {
  text: string;
  next?: DialogNodeId | null;
  effects?: DialogEffect[];
  condition?: DialogCondition;
};

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
