import type {
  GameplayActionHandler,
  GameplayConditionHandler,
  GameplayEventAction,
  GameplayEventCondition,
} from './types';
import { useDialogStore } from '../../dialog';
import { useEventsStore } from '../../events';
import { useInventoryStore } from '../../inventory';
import { useQuestStore } from '../../quests';
import { notify } from '../../ui';

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

export function createDefaultGameplayEventRegistry(): GameplayEventRegistry {
  const registry = new GameplayEventRegistry();

  registry.registerCondition('always', () => true);
  registry.registerCondition<Extract<GameplayEventCondition, { type: 'hasItem' }>>('hasItem', (condition) =>
    useInventoryStore.getState().has(condition.itemId, condition.count ?? 1),
  );
  registry.registerCondition<Extract<GameplayEventCondition, { type: 'questStatus' }>>('questStatus', (condition) =>
    useQuestStore.getState().statusOf(condition.questId) === condition.status,
  );
  registry.registerCondition<Extract<GameplayEventCondition, { type: 'eventActive' }>>('eventActive', (condition) =>
    useEventsStore.getState().isActive(condition.eventId),
  );
  registry.registerCondition<Extract<GameplayEventCondition, { type: 'flagEquals' }>>('flagEquals', (condition, context) =>
    context.state.flags[condition.key] === condition.value,
  );
  registry.registerCondition('custom', () => false);

  registry.registerAction<Extract<GameplayEventAction, { type: 'giveItem' }>>('giveItem', (action) => {
    useInventoryStore.getState().add(action.itemId, action.count ?? 1);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'removeItem' }>>('removeItem', (action) => {
    useInventoryStore.getState().removeById(action.itemId, action.count ?? 1);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'startQuest' }>>('startQuest', (action) => {
    useQuestStore.getState().start(action.questId);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'completeQuest' }>>('completeQuest', (action) => {
    useQuestStore.getState().complete(action.questId);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'showDialog' }>>('showDialog', (action) => {
    useDialogStore.getState().start(
      action.dialogTreeId,
      action.npcId ? { context: { npcId: action.npcId } } : undefined,
    );
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'toast' }>>('toast', (action) => {
    notify(action.kind ?? 'info', action.text);
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'setFlag' }>>('setFlag', (action, context) => {
    context.state.flags[action.key] = action.value;
  });
  registry.registerAction<Extract<GameplayEventAction, { type: 'notifyQuestFlag' }>>('notifyQuestFlag', (action) => {
    useQuestStore.getState().notifyFlag(action.key, action.value);
  });
  registry.registerAction('emit', () => undefined);
  registry.registerAction('custom', () => undefined);

  return registry;
}

let defaultRegistry: GameplayEventRegistry | null = null;

export function getGameplayEventRegistry(): GameplayEventRegistry {
  if (!defaultRegistry) defaultRegistry = createDefaultGameplayEventRegistry();
  return defaultRegistry;
}
