/**
 * Value checks shared by store mutations and their save hydration. A store must never hold a value its own load
 * rejects: one bad write would otherwise make the whole save slot unloadable.
 */
/** A plain object whose fields are not checked yet; `T` names the fields the caller is about to check. */
export const isRecord = <T extends object = Record<string, unknown>>(value: unknown): value is { [K in keyof T]?: unknown } =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isId = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

/** Whole, non-negative numbers: counts and day indices. */
export const isCount = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0;

/** Finite, non-negative numbers: prices, bells, elapsed minutes. */
export const isAmount = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;

export const isVector3 = (value: unknown): value is [number, number, number] =>
  Array.isArray(value) && value.length === 3 && value.every(Number.isFinite);
