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
  now?: () => number;
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
  private readonly now: () => number;
  private active = true;
  private generation = new AbortController();
  private readonly pending = new Map<string, symbol>();
  readonly state: GameplayEventRuntimeState;

  constructor(options: GameplayEventEngineOptions = {}) {
    this.blueprints = [...(options.blueprints ?? [])];
    this.registry = options.registry ?? getGameplayEventRegistry();
    this.now = options.now ?? (() => Date.now());
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

  suspend(): void {
    this.active = false;
    this.generation.abort();
    this.generation = new AbortController();
    this.pending.clear();
  }

  resume(): void { this.active = true; }

  async dispatch(trigger: GameplayTriggerEvent): Promise<GameplayEventExecution[]> {
    const results: GameplayEventExecution[] = [];
    const signal = this.generation.signal;
    for (const blueprint of this.blueprints) {
      if (!this.active || signal.aborted) break;
      if (blueprint.enabled === false || !triggerMatches(blueprint.trigger, trigger)) continue;
      results.push(await this.executeBlueprint(blueprint, trigger, signal));
    }
    return results;
  }

  private async executeBlueprint(
    blueprint: GameplayEventBlueprint,
    trigger: GameplayTriggerEvent,
    signal: AbortSignal,
  ): Promise<GameplayEventExecution> {
    const now = this.now();
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

    const guarded = policy.run === 'once' || policy.cooldownMs !== undefined;
    if (guarded && this.pending.has(blueprint.id)) {
      return { blueprintId: blueprint.id, actionCount: 0, skipped: 'in-flight' };
    }
    const token = Symbol(blueprint.id);
    if (guarded) this.pending.set(blueprint.id, token);
    let actionCount = 0;
    const cancelled = (): GameplayEventExecution => ({ blueprintId: blueprint.id, actionCount, skipped: 'cancelled' });
    try {
      const context = { blueprint, trigger, state: this.state, now, signal };
      for (const condition of blueprint.conditions ?? []) {
        const handler = this.registry.getCondition(condition.type);
        const pass = handler ? await handler(condition, context) : false;
        if (signal.aborted) return cancelled();
        if (!pass) {
          return { blueprintId: blueprint.id, actionCount: 0, skipped: `condition:${condition.type}` };
        }
      }

      for (const action of blueprint.actions) {
        if (signal.aborted) return cancelled();
        const handler = this.registry.getAction(action.type);
        if (!handler) continue;
        await handler(action, context);
        actionCount += 1;
      }
      if (signal.aborted) return cancelled();
      this.state.executedAt[blueprint.id] = now;
      return { blueprintId: blueprint.id, actionCount };
    } finally {
      if (this.pending.get(blueprint.id) === token) this.pending.delete(blueprint.id);
    }
  }
}
