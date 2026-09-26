export type GameplayEventId = string;

export type GameplayEventTrigger =
  | { type: 'manual'; key: string }
  | { type: 'interaction'; targetId: string; action?: string }
  | { type: 'enterArea'; areaId: string }
  | { type: 'timeChanged'; hour?: number }
  | { type: 'custom'; key: string };

export type GameplayEventCondition =
  | { type: 'always' }
  | { type: 'flagEquals'; key: string; value: string | number | boolean }
  | { type: 'custom'; key: string; payload?: Record<string, unknown> };

export type GameplayEventAction =
  | { type: 'showDialog'; dialogTreeId: string; npcId?: string }
  | { type: 'toast'; kind?: 'info' | 'success' | 'warn' | 'error' | 'reward' | 'mail'; text: string }
  | { type: 'setFlag'; key: string; value: string | number | boolean }
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
  hour?: number;
  payload?: Record<string, unknown>;
};

export type GameplayEventRuntimeState = {
  executedAt: Record<GameplayEventId, number>;
  flags: Record<string, string | number | boolean>;
};

export type GameplayEventSerialized = GameplayEventRuntimeState & { version: 1 };

export type GameplayEventExecution = {
  blueprintId: GameplayEventId;
  /** Handlers invoked, including an async handler cancelled before it settles. */
  actionCount: number;
  skipped?: string;
};

export type GameplayEventContext = {
  blueprint: GameplayEventBlueprint;
  trigger: GameplayTriggerEvent;
  state: GameplayEventRuntimeState;
  now: number;
  /** Custom async handlers should stop their own work when the owning engine is suspended. */
  signal?: AbortSignal;
  /** False after cancellation or completion. Present on engine-created contexts. */
  isCurrent?: () => boolean;
  /** Fast guarded flag write. Returns false for a completed or cancelled execution. */
  setFlag?: (key: string, value: string | number | boolean) => boolean;
};

export type GameplayConditionHandler<TCondition extends GameplayEventCondition = GameplayEventCondition> = (
  condition: TCondition,
  context: GameplayEventContext,
) => boolean | Promise<boolean>;

export type GameplayActionHandler<TAction extends GameplayEventAction = GameplayEventAction> = (
  action: TAction,
  context: GameplayEventContext,
) => void | Promise<void>;

export type GameplayToastKind = NonNullable<Extract<GameplayEventAction, { type: 'toast' }>['kind']>;

export type GameplayEventServices = {
  showDialog: (dialogTreeId: string, npcId?: string) => void;
  notify: (kind: GameplayToastKind, text: string) => void;
  emit?: (eventName: string, payload?: Record<string, unknown>) => void;
};
