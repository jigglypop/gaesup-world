import type { GameplayEventBlueprint, GameplayEventContext, GameplayEventRuntimeState, GameplayTriggerEvent } from './types';

/** Stable object shape and shared methods keep the synchronous command path allocation-light. */
export class GameplayExecutionContext implements GameplayEventContext {
  private finished = false;
  private protectedState: GameplayEventRuntimeState | undefined;
  constructor(
    readonly blueprint: GameplayEventBlueprint,
    readonly trigger: GameplayTriggerEvent,
    private readonly ownedState: GameplayEventRuntimeState,
    readonly now: number,
    readonly signal: AbortSignal,
  ) {}

  get state(): GameplayEventRuntimeState { return this.protectedState ??= protectGameplayState(this.ownedState, () => this.isCurrent()); }
  isCurrent(): boolean { return !this.finished && !this.signal.aborted; }
  finish(): void { this.finished = true; }
  setFlag(key: string, value: string | number | boolean): boolean {
    if (!this.isCurrent()) return false;
    if (key === '__proto__') Object.defineProperty(this.ownedState.flags, key, { value, enumerable: true, configurable: true, writable: true });
    else this.ownedState.flags[key] = value;
    return true;
  }
}

/** Check again after each await, before committing an external side effect. */
export function commitGameplayEffect(context: GameplayEventContext, effect: () => void): boolean {
  if (context.signal?.aborted || context.isCurrent?.() === false) return false;
  effect();
  return !context.signal?.aborted && context.isCurrent?.() !== false;
}

export const CANCELLED_GAMEPLAY = Symbol('cancelled-gameplay');
export function isGameplayPromise<T>(value: T | PromiseLike<T>): value is PromiseLike<T> {
  return value !== null && (typeof value === 'object' || typeof value === 'function') && typeof (value as PromiseLike<T>).then === 'function';
}

/** Settle the caller on abort even if the custom handler ignores its signal. */
export function awaitGameplayResult<T>(value: PromiseLike<T>, signal: AbortSignal): Promise<T | typeof CANCELLED_GAMEPLAY> {
  return new Promise((resolve, reject) => {
    const abort = () => { signal.removeEventListener('abort', abort); resolve(CANCELLED_GAMEPLAY); };
    signal.addEventListener('abort', abort, { once: true });
    Promise.resolve(value).then(result => { signal.removeEventListener('abort', abort); resolve(signal.aborted ? CANCELLED_GAMEPLAY : result); }, error => {
      signal.removeEventListener('abort', abort);
      if (signal.aborted) resolve(CANCELLED_GAMEPLAY); else reject(error);
    });
    if (signal.aborted) abort();
  });
}

/** Preserve the writable context API while preventing retained contexts from writing a newer world. */
export function protectGameplayState(state: GameplayEventRuntimeState, current: () => boolean): GameplayEventRuntimeState {
  const protect = <T extends object>(target: T): T => new Proxy(target, {
    set: (object, key, value) => !current() || Reflect.set(object, key, value),
    deleteProperty: (object, key) => !current() || Reflect.deleteProperty(object, key),
    defineProperty: (object, key, descriptor) => !current() || Reflect.defineProperty(object, key, descriptor),
    setPrototypeOf: () => false,
  });
  const maps = new Map<string, { target: object; value: object }>();
  return new Proxy(protect(state), {
    get: (object, key) => {
      const value: unknown = Reflect.get(object, key);
      if ((key === 'flags' || key === 'executedAt') && typeof value === 'object' && value !== null) {
        let entry = maps.get(key);
        if (entry?.target !== value) { entry = { target: value, value: protect(value) }; maps.set(key, entry); }
        return entry!.value;
      }
      return value;
    },
  });
}
