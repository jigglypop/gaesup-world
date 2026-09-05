import type { EventId } from '../../events';
import type { ItemId } from '../../items';
import type { QuestId, QuestStatus } from '../../quests';

export type GameplayEventId = string;

export type GameplayEventTrigger =
  | { type: 'manual'; key: string }
  | { type: 'interaction'; targetId: string; action?: string }
  | { type: 'enterArea'; areaId: string }
  | { type: 'itemCollected'; itemId: ItemId }
  | { type: 'timeChanged'; hour?: number }
  | { type: 'calendarEventStarted'; eventId: EventId }
  | { type: 'questChanged'; questId: QuestId; status?: QuestStatus }
  | { type: 'custom'; key: string };

export type GameplayEventCondition =
  | { type: 'always' }
  | { type: 'hasItem'; itemId: ItemId; count?: number }
  | { type: 'questStatus'; questId: QuestId; status: QuestStatus }
  | { type: 'eventActive'; eventId: EventId }
  | { type: 'flagEquals'; key: string; value: string | number | boolean }
  | { type: 'custom'; key: string; payload?: Record<string, unknown> };

export type GameplayEventAction =
  | { type: 'giveItem'; itemId: ItemId; count?: number }
  | { type: 'removeItem'; itemId: ItemId; count?: number }
  | { type: 'startQuest'; questId: QuestId }
  | { type: 'completeQuest'; questId: QuestId }
  | { type: 'showDialog'; dialogTreeId: string; npcId?: string }
  | { type: 'toast'; kind?: 'info' | 'success' | 'warn' | 'error' | 'reward' | 'mail'; text: string }
  | { type: 'setFlag'; key: string; value: string | number | boolean }
  | { type: 'notifyQuestFlag'; key: string; value: string | number | boolean }
  | { type: 'emit'; eventName: string; payload?: Record<string, unknown> }
  | { type: 'custom'; key: string; payload?: Record<string, unknown> };

export type GameplayEventPolicy = {
  run?: 'once' | 'repeat';
  cooldownMs?: number;
  requiresServer?: boolean;
};

export type GameplayEventBlueprint = {
  id: GameplayEventId;
  name: string;
  description?: string;
  enabled?: boolean;
  trigger: GameplayEventTrigger;
  conditions?: GameplayEventCondition[];
  actions: GameplayEventAction[];
  policy?: GameplayEventPolicy;
  tags?: string[];
};

export type GameplayTriggerEvent = {
  type: GameplayEventTrigger['type'];
  key?: string;
  targetId?: string;
  action?: string;
  areaId?: string;
  itemId?: ItemId;
  hour?: number;
  eventId?: EventId;
  questId?: QuestId;
  status?: QuestStatus;
  payload?: Record<string, unknown>;
};

export type GameplayEventRuntimeState = {
  executedAt: Record<GameplayEventId, number>;
  flags: Record<string, string | number | boolean>;
};

export type GameplayEventExecution = {
  blueprintId: GameplayEventId;
  actionCount: number;
  skipped?: string;
};

export type GameplayEventContext = {
  blueprint: GameplayEventBlueprint;
  trigger: GameplayTriggerEvent;
  state: GameplayEventRuntimeState;
  now: number;
};

export type GameplayConditionHandler<TCondition extends GameplayEventCondition = GameplayEventCondition> = (
  condition: TCondition,
  context: GameplayEventContext,
) => boolean | Promise<boolean>;

export type GameplayActionHandler<TAction extends GameplayEventAction = GameplayEventAction> = (
  action: TAction,
  context: GameplayEventContext,
) => void | Promise<void>;
