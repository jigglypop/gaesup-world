import type { NPCAction } from '../types';

const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const nonnegative = (value: unknown) => finite(value) && value >= 0;
const vector = (value: unknown) => Array.isArray(value) && value.length === 3 && value.every(finite);
const optional = (value: unknown, validate: (value: unknown) => boolean) => value === undefined || validate(value);
const string = (value: unknown) => typeof value === 'string';
const boolean = (value: unknown) => typeof value === 'boolean';
function json(value: unknown, depth = 0): boolean {
  if (depth > 32) return false;
  if (value === null || string(value) || boolean(value) || finite(value)) return true;
  if (Array.isArray(value)) return value.every(entry => json(entry, depth + 1));
  return record(value) && Object.values(value).every(entry => json(entry, depth + 1));
}

export function isNPCAction(value: unknown): value is NPCAction {
  if (!record(value) || !optional(value['animationId'], string) || !optional(value['speed'], nonnegative) || !optional(value['loop'], boolean)) return false;
  switch (value['type']) {
    case 'idle': return true;
    case 'moveTo': case 'lookAt': return vector(value['target']);
    case 'patrol': return Array.isArray(value['waypoints']) && value['waypoints'].every(vector);
    case 'wander': return optional(value['radius'], nonnegative) && optional(value['waitSeconds'], nonnegative);
    case 'playAnimation': return string(value['animationId']);
    case 'speak': return string(value['text']) && optional(value['duration'], nonnegative);
    case 'interact': return string(value['targetId']);
    case 'remember': return string(value['key']) && json(value['value']);
    default: return false;
  }
}

export function isNPCPolicyResponse(value: unknown): value is { actions?: NPCAction[]; reason?: string; ttlMs?: number } {
  return record(value) && optional(value['reason'], string) && optional(value['ttlMs'], nonnegative)
    && optional(value['actions'], actions => Array.isArray(actions) && actions.every(isNPCAction));
}
