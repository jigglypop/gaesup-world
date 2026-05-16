import type { GameplayEventAction, GameplayEventBlueprint, GameplayEventCondition, GameplayEventTrigger } from './types';
export declare const GAMEPLAY_EVENT_TRIGGER_TYPES: readonly ["manual", "interaction", "enterArea", "itemCollected", "timeChanged", "calendarEventStarted", "questChanged", "custom"];
export declare const GAMEPLAY_EVENT_CONDITION_TYPES: readonly ["always", "hasItem", "questStatus", "eventActive", "flagEquals", "custom"];
export declare const GAMEPLAY_EVENT_ACTION_TYPES: readonly ["giveItem", "removeItem", "startQuest", "completeQuest", "showDialog", "toast", "setFlag", "notifyQuestFlag", "emit", "custom"];
export type GameplayEventTriggerType = (typeof GAMEPLAY_EVENT_TRIGGER_TYPES)[number];
export type GameplayEventConditionType = (typeof GAMEPLAY_EVENT_CONDITION_TYPES)[number];
export type GameplayEventActionType = (typeof GAMEPLAY_EVENT_ACTION_TYPES)[number];
export declare const createGameplayEventTriggerTemplate: (type: GameplayEventTriggerType) => GameplayEventTrigger;
export declare const createGameplayEventConditionTemplate: (type: GameplayEventConditionType) => GameplayEventCondition;
export declare const createGameplayEventActionTemplate: (type: GameplayEventActionType) => GameplayEventAction;
export declare const createManualToastEventBlueprint: ({ id, name, triggerKey, message, }: {
    id: string;
    name: string;
    triggerKey: string;
    message: string;
}) => GameplayEventBlueprint;
export declare const createNpcTalkStartsQuestEventBlueprint: ({ id, name, npcId, questId, dialogTreeId, }?: {
    id?: string;
    name?: string;
    npcId?: string;
    questId?: string;
    dialogTreeId?: string;
}) => GameplayEventBlueprint;
