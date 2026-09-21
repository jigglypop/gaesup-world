import type {
  GameplayActionHandler,
  GameplayConditionHandler,
  GameplayEventAction,
  GameplayEventCondition,
} from './types';
import { useDialogStore, type DialogStore } from '../../dialog/stores/dialogStore';
import { useEventsStore, type EventsStore } from '../../events/stores/eventsStore';
import { useInventoryStore, type InventoryStore } from '../../inventory/stores/inventoryStore';
import { useQuestStore, type QuestStore } from '../../quests/stores/questStore';
import { notify } from '../../ui/components/Toast/toastStore';

export type GameplayEventDependencies = {
  dialogStore: DialogStore;
  eventsStore: EventsStore;
  inventoryStore: InventoryStore;
  questStore: QuestStore;
  emit?: (eventName: string, payload?: Record<string, unknown>) => void;
};
const legacyDependencies: GameplayEventDependencies = { dialogStore: useDialogStore, eventsStore: useEventsStore, inventoryStore: useInventoryStore, questStore: useQuestStore };

export class GameplayEventRegistry {
  private readonly conditions = new Map<string, GameplayConditionHandler>();
  private readonly actions = new Map<string, GameplayActionHandler>();

  registerCondition<TCondition extends GameplayEventCondition>(
    type: TCondition['type'],
    handler: GameplayConditionHandler<TCondition>,
  ): void {
    this.conditions.set(type, (condition, context) => {
      if (context.isCurrent ? !context.isCurrent() : context.signal?.aborted) return false;
      return handler(condition as TCondition, context);
    });
  }

  registerAction<TAction extends GameplayEventAction>(
    type: TAction['type'],
    handler: GameplayActionHandler<TAction>,
  ): void {
    this.actions.set(type, (action, context) => {
      if (context.isCurrent ? !context.isCurrent() : context.signal?.aborted) return;
      return handler(action as TAction, context);
    });
  }

  getCondition(type: string): GameplayConditionHandler | undefined {
    return this.conditions.get(type);
  }

  getAction(type: string): GameplayActionHandler | undefined {
    return this.actions.get(type);
  }
}

export function createDefaultGameplayEventRegistry(dependencies: GameplayEventDependencies = legacyDependencies): GameplayEventRegistry {
  const registry = new GameplayEventRegistry();

  registry.registerCondition('always', () => true);
  registry.registerCondition<Extract<GameplayEventCondition, { type: 'hasItem' }>>('hasItem', (condition) =>
    dependencies.inventoryStore.getState().has(condition.itemId, condition.count ?? 1),
  );
  registry.registerCondition<Extract<GameplayEventCondition, { type: 'questStatus' }>>('questStatus', (condition) =>
    dependencies.questStore.getState().statusOf(condition.questId) === condition.status,
  );
  registry.registerCondition<Extract<GameplayEventCondition, { type: 'eventActive' }>>('eventActive', (condition) =>
    dependencies.eventsStore.getState().isActive(condition.eventId),
  );
  registry.registerCondition<Extract<GameplayEventCondition, { type: 'flagEquals' }>>('flagEquals', (condition, context) =>
    context.state.flags[condition.key] === condition.value,
  );
  registry.registerCondition('custom', () => false);

  registry.registerAction<Extract<GameplayEventAction, { type: 'giveItem' }>>('giveItem', (action) => {
    dependencies.inventoryStore.getState().add(action.itemId, action.count ?? 1);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'removeItem' }>>('removeItem', (action) => {
    dependencies.inventoryStore.getState().removeById(action.itemId, action.count ?? 1);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'startQuest' }>>('startQuest', (action) => {
    dependencies.questStore.getState().start(action.questId);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'completeQuest' }>>('completeQuest', (action) => {
    dependencies.questStore.getState().complete(action.questId);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'showDialog' }>>('showDialog', (action) => {
    dependencies.dialogStore.getState().start(
      action.dialogTreeId,
      action.npcId ? { context: { npcId: action.npcId } } : undefined,
    );
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'toast' }>>('toast', (action) => {
    notify(action.kind ?? 'info', action.text);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'setFlag' }>>('setFlag', (action, context) => {
    if (context.setFlag) context.setFlag(action.key, action.value);
    else context.state.flags[action.key] = action.value;
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'notifyQuestFlag' }>>('notifyQuestFlag', (action) => {
    dependencies.questStore.getState().notifyFlag(action.key, action.value);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'emit' }>>('emit', action => dependencies.emit?.(action.eventName, action.payload));
  registry.registerAction('custom', () => undefined);

  return registry;
}

let defaultRegistry: GameplayEventRegistry | null = null;

export function getGameplayEventRegistry(): GameplayEventRegistry {
  if (!defaultRegistry) defaultRegistry = createDefaultGameplayEventRegistry();
  return defaultRegistry;
}
