import type { NPCInstanceProps } from './types';

/** Observation and decision records change every decision tick but are never rendered. */
const UNRENDERED_KEYS: ReadonlySet<string> = new Set(['lastObservation', 'lastDecision']);

function sameRenderedInstance(a: NPCInstanceProps['instance'], b: NPCInstanceProps['instance']): boolean {
  if (a === b) return true;
  const left = a as unknown as Record<string, unknown>;
  const right = b as unknown as Record<string, unknown>;
  for (const key in left) if (!UNRENDERED_KEYS.has(key) && left[key] !== right[key]) return false;
  for (const key in right) if (!UNRENDERED_KEYS.has(key) && !(key in left)) return false;
  return true;
}

export function sameNPCInstanceProps(a: NPCInstanceProps, b: NPCInstanceProps): boolean {
  return a.isEditMode === b.isEditMode && a.onClick === b.onClick && a.onSelect === b.onSelect
    && sameRenderedInstance(a.instance, b.instance);
}
