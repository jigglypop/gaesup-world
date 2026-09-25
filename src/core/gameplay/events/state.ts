import type { GameplayEventRuntimeState, GameplayEventSerialized } from './types';

/** A flag value a save can hold; a NaN flag would otherwise fail every domain's autosave. */
export const isFlagValue = (value: unknown): value is string | number | boolean =>
  typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value));

function record(value: unknown, valid: (entry: unknown) => boolean): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.values(value).some(entry => !valid(entry))) throw new TypeError('Invalid gameplay event snapshot');
  return Object.assign(Object.create(null) as Record<string, unknown>, Object.fromEntries(Object.entries(value)));
}

export function copyGameplayState(value: GameplayEventRuntimeState): GameplayEventRuntimeState {
  return {
    executedAt: record(value.executedAt, entry => typeof entry === 'number' && Number.isFinite(entry) && entry >= 0) as GameplayEventRuntimeState['executedAt'],
    flags: record(value.flags, isFlagValue) as GameplayEventRuntimeState['flags'],
  };
}

export function prepareGameplayState(data: unknown): GameplayEventRuntimeState {
  // Saves predating this domain represent no recorded executions or flags.
  if (data === undefined || data === null) return copyGameplayState({ executedAt: {}, flags: {} });
  if (typeof data !== 'object' || (data as GameplayEventSerialized).version !== 1) throw new TypeError('Invalid gameplay event snapshot');
  return copyGameplayState(data as GameplayEventSerialized);
}
