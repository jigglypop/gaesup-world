import type {
  GameplayEventAction,
  GameplayEventBlueprint,
  GameplayEventCondition,
  GameplayEventTrigger,
} from './types';

export const GAMEPLAY_EVENT_TRIGGER_TYPES = [
  'manual',
  'interaction',
  'enterArea',
  'itemCollected',
  'timeChanged',
  'calendarEventStarted',
  'questChanged',
  'custom',
] as const satisfies readonly GameplayEventTrigger['type'][];

export const GAMEPLAY_EVENT_CONDITION_TYPES = [
  'always',
  'hasItem',
  'questStatus',
  'eventActive',
  'flagEquals',
  'custom',
] as const satisfies readonly GameplayEventCondition['type'][];

export const GAMEPLAY_EVENT_ACTION_TYPES = [
  'giveItem',
  'removeItem',
  'startQuest',
  'completeQuest',
  'showDialog',
  'toast',
  'setFlag',
  'notifyQuestFlag',
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
    case 'itemCollected':
      return { type, itemId: 'item.default' };
    case 'timeChanged':
      return { type, hour: 9 };
    case 'calendarEventStarted':
      return { type, eventId: 'calendar.default' };
    case 'questChanged':
      return { type, questId: 'quest.default', status: 'active' };
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
    case 'hasItem':
      return { type, itemId: 'item.default', count: 1 };
    case 'questStatus':
      return { type, questId: 'quest.default', status: 'active' };
    case 'eventActive':
      return { type, eventId: 'calendar.default' };
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
    case 'giveItem':
      return { type, itemId: 'item.default', count: 1 };
    case 'removeItem':
      return { type, itemId: 'item.default', count: 1 };
    case 'startQuest':
      return { type, questId: 'quest.default' };
    case 'completeQuest':
      return { type, questId: 'quest.default' };
    case 'showDialog':
      return { type, dialogTreeId: 'dialog.default', npcId: 'npc.default' };
    case 'toast':
      return { type, kind: 'success', text: 'Event executed' };
    case 'setFlag':
      return { type, key: 'flag.default', value: true };
    case 'notifyQuestFlag':
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
  const safeId = id.trim() || `event-${Date.now()}`;
  const flagKey = safeId.trim() || 'manualEvent';

  return {
    id: safeId,
    name: name.trim() || 'Manual Event',
    trigger: { type: 'manual', key: triggerKey.trim() || 'manual.event' },
    conditions: [{ type: 'always' }],
    actions: [
      { type: 'toast', kind: 'success', text: message.trim() || 'Event executed' },
      { type: 'setFlag', key: flagKey, value: true },
    ],
    policy: { run: 'repeat' },
    tags: ['editor', 'manual'],
  };
};

export const createNpcTalkStartsQuestEventBlueprint = ({
  id,
  name,
  npcId = 'tommy',
  questId = 'welcome',
  dialogTreeId = 'npc.shopkeeper',
}: {
  id?: string;
  name?: string;
  npcId?: string;
  questId?: string;
  dialogTreeId?: string;
} = {}): GameplayEventBlueprint => {
  const safeNpcId = npcId.trim() || 'tommy';
  const safeQuestId = questId.trim() || 'welcome';

  return {
    id: id?.trim() || `npc-talk-${safeNpcId}-start-${safeQuestId}`,
    name: name?.trim() || `NPC Talk Starts Quest (${safeNpcId})`,
    trigger: { type: 'interaction', targetId: `npc:${safeNpcId}`, action: 'talk' },
    conditions: [{ type: 'questStatus', questId: safeQuestId, status: 'available' }],
    actions: [
      { type: 'startQuest', questId: safeQuestId },
      { type: 'showDialog', dialogTreeId: dialogTreeId.trim() || 'npc.shopkeeper', npcId: safeNpcId },
      { type: 'setFlag', key: `questStarted:${safeQuestId}`, value: true },
    ],
    policy: { run: 'once' },
    tags: ['editor', 'preset', 'npc', 'quest'],
  };
};
