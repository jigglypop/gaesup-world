import { getGameplayEventRegistry, type GameplayEventRegistry } from './registry';
import type {
  GameplayEventBlueprint,
  GameplayEventExecution,
  GameplayEventRuntimeState,
  GameplayEventTrigger,
  GameplayTriggerEvent,
} from './types';

export type GameplayEventEngineOptions = {
  blueprints?: GameplayEventBlueprint[];
  registry?: GameplayEventRegistry;
  state?: GameplayEventRuntimeState;
};

const DEFAULT_STATE: GameplayEventRuntimeState = {
  executedAt: {},
  flags: {},
};

const triggerMatches = (blueprintTrigger: GameplayEventTrigger, event: GameplayTriggerEvent): boolean => {
  if (blueprintTrigger.type !== event.type) return false;
  switch (blueprintTrigger.type) {
    case 'manual':
      return blueprintTrigger.key === event.key;
    case 'interaction':
      return blueprintTrigger.targetId === event.targetId &&
        (blueprintTrigger.action === undefined || blueprintTrigger.action === event.action);
    case 'enterArea':
      return blueprintTrigger.areaId === event.areaId;
    case 'itemCollected':
      return blueprintTrigger.itemId === event.itemId;
    case 'timeChanged':
      return blueprintTrigger.hour === undefined || blueprintTrigger.hour === event.hour;
    case 'calendarEventStarted':
      return blueprintTrigger.eventId === event.eventId;
    case 'questChanged':
      return blueprintTrigger.questId === event.questId &&
        (blueprintTrigger.status === undefined || blueprintTrigger.status === event.status);
    case 'custom':
      return blueprintTrigger.key === event.key;
    default: {
      const exhaustive: never = blueprintTrigger;
      return exhaustive;
    }
  }
};

export class GameplayEventEngine {
  private blueprints: GameplayEventBlueprint[];
  private readonly registry: GameplayEventRegistry;
  readonly state: GameplayEventRuntimeState;

  constructor(options: GameplayEventEngineOptions = {}) {
    this.blueprints = options.blueprints ?? [];
    this.registry = options.registry ?? getGameplayEventRegistry();
    this.state = options.state ?? {
      executedAt: { ...DEFAULT_STATE.executedAt },
      flags: { ...DEFAULT_STATE.flags },
    };
  }

  setBlueprints(blueprints: GameplayEventBlueprint[]): void {
    this.blueprints = [...blueprints];
  }

  getBlueprints(): GameplayEventBlueprint[] {
    return [...this.blueprints];
  }

  async dispatch(trigger: GameplayTriggerEvent): Promise<GameplayEventExecution[]> {
    const results: GameplayEventExecution[] = [];
    for (const blueprint of this.blueprints) {
      if (blueprint.enabled === false || !triggerMatches(blueprint.trigger, trigger)) continue;
      results.push(await this.executeBlueprint(blueprint, trigger));
    }
    return results;
  }

  private async executeBlueprint(
    blueprint: GameplayEventBlueprint,
    trigger: GameplayTriggerEvent,
  ): Promise<GameplayEventExecution> {
    const now = Date.now();
    const lastExecutedAt = this.state.executedAt[blueprint.id];
    const policy = blueprint.policy ?? {};
    if (policy.run === 'once' && lastExecutedAt !== undefined) {
      return { blueprintId: blueprint.id, actionCount: 0, skipped: 'already-executed' };
    }
    if (policy.cooldownMs !== undefined && lastExecutedAt !== undefined && now - lastExecutedAt < policy.cooldownMs) {
      return { blueprintId: blueprint.id, actionCount: 0, skipped: 'cooldown' };
    }
    if (policy.requiresServer) {
      return { blueprintId: blueprint.id, actionCount: 0, skipped: 'requires-server' };
    }

    const context = { blueprint, trigger, state: this.state, now };
    for (const condition of blueprint.conditions ?? []) {
      const handler = this.registry.getCondition(condition.type);
      if (!handler || !(await handler(condition, context))) {
        return { blueprintId: blueprint.id, actionCount: 0, skipped: `condition:${condition.type}` };
      }
    }

    let actionCount = 0;
    for (const action of blueprint.actions) {
      const handler = this.registry.getAction(action.type);
      if (!handler) continue;
      await handler(action, context);
      actionCount += 1;
    }
    this.state.executedAt[blueprint.id] = now;
    return { blueprintId: blueprint.id, actionCount };
  }
}
