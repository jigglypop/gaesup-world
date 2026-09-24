const sessionPrefix = Math.random().toString(36).slice(2, 10);
let fallbackCounter = 0;

/** Collision-resistant id that stays unique across reloads; `crypto.randomUUID` with a per-session fallback. */
export function createUniqueId(prefix?: string): string {
  const id = globalThis.crypto?.randomUUID?.()
    ?? `${sessionPrefix}-${Date.now().toString(36)}-${(++fallbackCounter).toString(36)}`;
  return prefix ? `${prefix}-${id}` : id;
}
