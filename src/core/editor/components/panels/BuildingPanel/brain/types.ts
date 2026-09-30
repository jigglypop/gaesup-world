import type { NPCBrainBlueprint, NPCBrainConfig, NPCInstance as NPCInstanceData } from '../../../../../npc/types';

export type NPCBrainSectionProps = {
  instance: NPCInstanceData;
  blueprints: NPCBrainBlueprint[];
  selectedBlueprint: NPCBrainBlueprint | undefined;
  updateBrain: (id: string, updates: Partial<NPCBrainConfig>) => void;
  addBrainBlueprint: (blueprint: NPCBrainBlueprint) => void;
  updateBrainBlueprint: (id: string, updates: NPCBrainBlueprint) => void;
  onPreviewStateChange?: (state: NPCBrainPreviewState) => void;
};

export type NPCBrainPreviewState = {
  mode: 'idle' | 'move' | 'patrol' | 'wander' | 'action';
  label: string;
  target?: [number, number, number];
  waypoints?: [number, number, number][];
  radius?: number;
  animationId?: string;
};
