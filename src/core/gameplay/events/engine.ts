import { awaitGameplayResult, CANCELLED_GAMEPLAY, GameplayExecutionContext, isGameplayPromise } from './execution';
import { getGameplayEventRegistry, type GameplayEventRegistry } from './registry';
import { copyGameplayState, prepareGameplayState } from './state';
import type {
  GameplayEventBlueprint,
  GameplayEventExecution,
  GameplayEventRuntimeState,
  GameplayEventSerialized,
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
      executedAt: Object.assign(Object.create(null) as GameplayEventRuntimeState['executedAt'], DEFAULT_STATE.executedAt),
      flags: Object.assign(Object.create(null) as GameplayEventRuntimeState['flags'], DEFAULT_STATE.flags),
    };
  }

  setBlueprints(blueprints: GameplayEventBlueprint[]): void {
    this.invalidate();
    this.blueprints = [...blueprints];
  }

  getBlueprints(): GameplayEventBlueprint[] {
    return [...this.blueprints];
  }

  suspend(): void {
    this.active = false;
    this.invalidate();
  }

  private invalidate(): void {
    this.generation.abort();
    this.generation = new AbortController();
    this.pending.clear();
  }

  resume(): void { this.active = true; }

  serialize(): GameplayEventSerialized { return { version: 1, ...copyGameplayState(this.state) }; }

  prepareHydrate(data: unknown): () => void {
    const prepared = prepareGameplayState(data);
    return () => {
      this.invalidate();
      const next = copyGameplayState(prepared);
      this.state.executedAt = next.executedAt; this.state.flags = next.flags;
    };
  }

  hydrate(data: unknown): void { this.prepareHydrate(data)(); }

  async dispatch(trigger: GameplayTriggerEvent): Promise<GameplayEventExecution[]> {
    const results: GameplayEventExecution[] = [];
    const signal = this.generation.signal;
    for (const blueprint of this.blueprints) {
      if (!this.active || signal.aborted) break;
      if (blueprint.enabled === false || !triggerMatches(blueprint.trigger, trigger)) continue;
      const work = this.executeBlueprint(blueprint, trigger, signal);
      results.push(isGameplayPromise(work) ? await work : work);
    }
    return results;
  }

  private executeBlueprint(
    blueprint: GameplayEventBlueprint,
    trigger: GameplayTriggerEvent,
    signal: AbortSignal,
  ): GameplayEventExecution | Promise<GameplayEventExecution> {
    const now = this.now();
    const lastExecutedAt = Object.hasOwn(this.state.executedAt, blueprint.id) ? this.state.executedAt[blueprint.id] : undefined;
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
    const token = guarded ? Symbol(blueprint.id) : undefined;
    if (token) this.pending.set(blueprint.id, token);
    let actionCount = 0;
    const context = new GameplayExecutionContext(blueprint, trigger, this.state, now, signal);
    const cancelled = (): GameplayEventExecution => ({ blueprintId: blueprint.id, actionCount, skipped: 'cancelled' });
    const finish = () => {
      context.finish();
      if (token && this.pending.get(blueprint.id) === token) this.pending.delete(blueprint.id);
    };
    try {
      const conditions = blueprint.conditions ?? [];
      let conditionIndex = 0; let actionIndex = 0;
      // Stay synchronous until a handler actually returns a promise.
      const advance = (): GameplayEventExecution | Promise<GameplayEventExecution> => {
        while (conditionIndex < conditions.length) {
          if (signal.aborted) return cancelled();
          const condition = conditions[conditionIndex++]!;
          const handler = this.registry.getCondition(condition.type);
          const work = handler ? handler(condition, context) : false;
          const rejected = (): GameplayEventExecution => ({ blueprintId: blueprint.id, actionCount: 0, skipped: `condition:${condition.type}` });
          if (isGameplayPromise(work)) return awaitGameplayResult(work, signal).then(pass => signal.aborted ? cancelled() : !pass ? rejected() : advance());
          if (signal.aborted) return cancelled();
          if (!work) return rejected();
        }
        while (actionIndex < blueprint.actions.length) {
          if (signal.aborted) return cancelled();
          const action = blueprint.actions[actionIndex++]!;
          const handler = this.registry.getAction(action.type);
          if (!handler) continue;
          const work = handler(action, context);
          actionCount += 1;
          if (isGameplayPromise(work)) return awaitGameplayResult(work, signal).then(result => result === CANCELLED_GAMEPLAY ? cancelled() : advance());
        }
        if (signal.aborted) return cancelled();
        if (blueprint.id === '__proto__') Object.defineProperty(this.state.executedAt, blueprint.id, { value: now, enumerable: true, configurable: true, writable: true });
        else this.state.executedAt[blueprint.id] = now;
        return { blueprintId: blueprint.id, actionCount };
      };
      const result = advance();
      if (isGameplayPromise(result)) return Promise.resolve(result).finally(finish);
      finish(); return result;
    } catch (error) {
      finish(); throw error;
    }
  }
}
