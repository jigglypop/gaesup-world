import type {
  GameplayEventAction,
  GameplayEventBlueprint,
  GameplayEventCondition,
  GameplayEventTrigger,
} from './types';
import { createUniqueId } from '../../utils/id';

export const GAMEPLAY_EVENT_TRIGGER_TYPES = [
  'manual',
  'interaction',
  'enterArea',
  'timeChanged',
  'custom',
] as const satisfies readonly GameplayEventTrigger['type'][];

export const GAMEPLAY_EVENT_CONDITION_TYPES = [
  'always',
  'flagEquals',
  'custom',
] as const satisfies readonly GameplayEventCondition['type'][];

export const GAMEPLAY_EVENT_ACTION_TYPES = [
  'showDialog',
  'toast',
  'setFlag',
  'emit',
  'custom',
] as const satisfies readonly GameplayEventAction['type'][];

export type GameplayEventTriggerType = (typeof GAMEPLAY_EVENT_TRIGGER_TYPES)[number];
export type GameplayEventConditionType = (typeof GAMEPLAY_EVENT_CONDITION_TYPES)[number];
export type GameplayEventActionType = (typeof GAMEPLAY_EVENT_ACTION_TYPES)[number];

export const createGameplayEventTriggerTemplate = (
  type: GameplayEventTriggerType,
): GameplayEventTrigger => {
  switch (type) {
    case 'manual':
      return { type, key: 'manual.event' };
    case 'interaction':
      return { type, targetId: 'target.entity', action: 'interact' };
    case 'enterArea':
      return { type, areaId: 'area.default' };
    case 'timeChanged':
      return { type, hour: 9 };
    case 'custom':
      return { type, key: 'custom.event' };
    default: {
      const exhaustive: never = type;
      return exhaustive;
    }
  }
};

export const createGameplayEventConditionTemplate = (
  type: GameplayEventConditionType,
): GameplayEventCondition => {
  switch (type) {
    case 'always':
      return { type };
    case 'flagEquals':
      return { type, key: 'flag.default', value: true };
    case 'custom':
      return { type, key: 'custom.condition' };
    default: {
      const exhaustive: never = type;
      return exhaustive;
    }
  }
};

export const createGameplayEventActionTemplate = (
  type: GameplayEventActionType,
): GameplayEventAction => {
  switch (type) {
    case 'showDialog':
      return { type, dialogTreeId: 'dialog.default', npcId: 'npc.default' };
    case 'toast':
      return { type, kind: 'success', text: '이벤트가 실행되었습니다.' };
    case 'setFlag':
      return { type, key: 'flag.default', value: true };
    case 'emit':
      return { type, eventName: 'gameplay.event' };
    case 'custom':
      return { type, key: 'custom.action' };
    default: {
      const exhaustive: never = type;
      return exhaustive;
    }
  }
};

export const createManualToastEventBlueprint = ({
  id,
  name,
  triggerKey,
  message,
}: {
  id: string;
  name: string;
  triggerKey: string;
  message: string;
}): GameplayEventBlueprint => {
  const safeId = id.trim() || createUniqueId('event');
  const flagKey = safeId.trim() || 'manualEvent';

  return {
    id: safeId,
    name: name.trim() || '수동 이벤트',
    trigger: { type: 'manual', key: triggerKey.trim() || 'manual.event' },
    conditions: [{ type: 'always' }],
    actions: [
      { type: 'toast', kind: 'success', text: message.trim() || '이벤트가 실행되었습니다.' },
      { type: 'setFlag', key: flagKey, value: true },
    ],
    policy: { run: 'repeat' },
    tags: ['editor', 'manual'],
  };
};

/** First talk with an NPC opens its dialog once and records it as a flag. */
export const createNpcTalkEventBlueprint = ({
  id,
  name,
  npcId = 'npc',
  dialogTreeId = 'npc.greeting',
}: {
  id?: string;
  name?: string;
  npcId?: string;
  dialogTreeId?: string;
} = {}): GameplayEventBlueprint => {
  const safeNpcId = npcId.trim() || 'npc';

  return {
    id: id?.trim() || `npc-talk-${safeNpcId}`,
    name: name?.trim() || `NPC Talk (${safeNpcId})`,
    trigger: { type: 'interaction', targetId: `npc:${safeNpcId}`, action: 'talk' },
    conditions: [{ type: 'always' }],
    actions: [
      { type: 'showDialog', dialogTreeId: dialogTreeId.trim() || 'npc.greeting', npcId: safeNpcId },
      { type: 'setFlag', key: `talked:${safeNpcId}`, value: true },
    ],
    policy: { run: 'once' },
    tags: ['editor', 'preset', 'npc'],
  };
};
