import type { NPCBrainMode } from '../../../../../npc/types';

export const NPC_BRAIN_MODES: NPCBrainMode[] = ['none', 'scripted', 'llm', 'reinforcement'];
export const NPC_CONDITION_TYPES = [
  'always',
  'navigationIdle',
  'perceivedAny',
  'memoryEquals',
] as const;
export const NPC_ACTION_TYPES = [
  'idle',
  'moveTo',
  'patrol',
  'wander',
  'playAnimation',
  'lookAt',
  'speak',
  'interact',
  'remember',
  'moveToTarget',
] as const;
