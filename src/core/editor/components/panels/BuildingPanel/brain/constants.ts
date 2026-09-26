import type { NPCBrainMode } from '../../../../../npc/types';

export const NPC_BRAIN_MODES: NPCBrainMode[] = ['none', 'scripted', 'llm', 'reinforcement'];
export const NPC_QUEST_STATUS_OPTIONS = ['locked', 'available', 'active', 'completed', 'failed'] as const;
export const NPC_CONDITION_TYPES = [
  'always',
  'navigationIdle',
  'perceivedAny',
  'questStatus',
  'friendshipAtLeast',
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
