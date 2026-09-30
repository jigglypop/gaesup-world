export const DEFAULT_MAX_SLOTS_PER_WORLD = 10;

/**
 * Timestamped `${worldId}_${timestamp}` slots of one world beyond the newest `maxSlots`, counting `current`,
 * which is always kept. Other worlds and differently named slots are never selected.
 */
export function selectExpiredWorldSlots(
  slotIds: readonly string[],
  worldId: string,
  current: string,
  maxSlots: number = DEFAULT_MAX_SLOTS_PER_WORLD,
): string[] {
  const keep = Number.isNaN(maxSlots) ? DEFAULT_MAX_SLOTS_PER_WORLD : Math.max(1, Math.floor(maxSlots));
  const prefix = `${worldId}_`;
  const timestamp = (id: string) => Number(id.slice(prefix.length));
  return slotIds
    .filter((id) => id !== current && id.startsWith(prefix) && /^\d+$/.test(id.slice(prefix.length)))
    .sort((a, b) => timestamp(b) - timestamp(a))
    .slice(keep - 1);
}
