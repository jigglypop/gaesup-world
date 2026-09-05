import type { ItemId } from '../items/types';

export type CropId = string;

export type CropStage = {
  durationMinutes: number;
  scale: number;
  color?: string;
  needsWater?: boolean;
};

export type CropDef = {
  id: CropId;
  name: string;
  seedItemId: ItemId;
  yieldItemId: ItemId;
  yieldCount: number;
  stages: CropStage[];
  waterIntervalMinutes: number;
  driedOutMinutes: number;
};

export type PlotState = 'empty' | 'tilled' | 'planted' | 'mature' | 'dried';

export type Plot = {
  id: string;
  position: [number, number, number];
  state: PlotState;
  cropId?: CropId;
  plantedAt?: number;
  lastWateredAt?: number;
  stageIndex: number;
};

export type FarmingSerialized = {
  version: number;
  plots: Plot[];
};
