import type {
  GameplayActionHandler,
  GameplayConditionHandler,
  GameplayEventAction,
  GameplayEventCondition,
  GameplayEventServices,
} from './types';

export class GameplayEventRegistry {
  private readonly conditions = new Map<string, GameplayConditionHandler>();
  private readonly actions = new Map<string, GameplayActionHandler>();

  registerCondition<TCondition extends GameplayEventCondition>(
    type: TCondition['type'],
    handler: GameplayConditionHandler<TCondition>,
  ): void {
    this.conditions.set(type, handler as GameplayConditionHandler);
  }

  registerAction<TAction extends GameplayEventAction>(
    type: TAction['type'],
    handler: GameplayActionHandler<TAction>,
  ): void {
    this.actions.set(type, handler as GameplayActionHandler);
  }

  getCondition(type: string): GameplayConditionHandler | undefined {
    return this.conditions.get(type);
  }

  getAction(type: string): GameplayActionHandler | undefined {
    return this.actions.get(type);
  }
}

let defaultServicesFactory: (() => GameplayEventServices) | null = null;
let defaultRegistry: GameplayEventRegistry | null = null;

export function setDefaultGameplayEventServices(factory: (() => GameplayEventServices) | null): void {
  defaultServicesFactory = factory;
  defaultRegistry = null;
}

function registerServiceHandlers(registry: GameplayEventRegistry, services: GameplayEventServices): void {
  registry.registerCondition<Extract<GameplayEventCondition, { type: 'hasItem' }>>('hasItem', (condition) =>
    services.hasItem(condition.itemId, condition.count ?? 1),
  );
  registry.registerCondition<Extract<GameplayEventCondition, { type: 'questStatus' }>>('questStatus', (condition) =>
    services.questStatus(condition.questId) === condition.status,
  );
  registry.registerCondition<Extract<GameplayEventCondition, { type: 'eventActive' }>>('eventActive', (condition) =>
    services.isEventActive(condition.eventId),
  );
  registry.registerAction<Extract<GameplayEventAction, { type: 'giveItem' }>>('giveItem', (action) => {
    services.addItem(action.itemId, action.count ?? 1);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'removeItem' }>>('removeItem', (action) => {
    services.removeItem(action.itemId, action.count ?? 1);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'startQuest' }>>('startQuest', (action) => {
    services.startQuest(action.questId);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'completeQuest' }>>('completeQuest', (action) => {
    services.completeQuest(action.questId);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'showDialog' }>>('showDialog', (action) => {
    services.showDialog(action.dialogTreeId, action.npcId);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'toast' }>>('toast', (action) => {
    services.notify(action.kind ?? 'info', action.text);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'notifyQuestFlag' }>>('notifyQuestFlag', (action) => {
    services.notifyQuestFlag(action.key, action.value);
  });
}

export function createDefaultGameplayEventRegistry(
  services: GameplayEventServices | null = defaultServicesFactory?.() ?? null,
): GameplayEventRegistry {
  const registry = new GameplayEventRegistry();

  registry.registerCondition('always', () => true);
  registry.registerCondition<Extract<GameplayEventCondition, { type: 'flagEquals' }>>('flagEquals', (condition, context) =>
    context.state.flags[condition.key] === condition.value,
  );
  registry.registerCondition('custom', () => false);
  registry.registerAction<Extract<GameplayEventAction, { type: 'setFlag' }>>('setFlag', (action, context) => {
    context.state.flags[action.key] = action.value;
  });
  registry.registerAction('emit', () => undefined);
  registry.registerAction('custom', () => undefined);
  if (services) registerServiceHandlers(registry, services);

  return registry;
}

export function getGameplayEventRegistry(): GameplayEventRegistry {
  if (!defaultRegistry) defaultRegistry = createDefaultGameplayEventRegistry();
  return defaultRegistry;
}
