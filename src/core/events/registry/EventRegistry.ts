import type { GameTime } from '../../time/types';
import type { EventDef, EventId, EventTrigger } from '../types';

function triggerActive(trigger: EventTrigger, time: GameTime): boolean {
  switch (trigger.kind) {
    case 'always':
      return true;
    case 'season':
      return trigger.seasons.includes(time.season);
    case 'monthDay':
      return time.month === trigger.month && time.day === trigger.day;
    case 'monthRange':
      return time.month === trigger.month
        && time.day >= trigger.fromDay
        && time.day <= trigger.toDay;
    case 'weekday':
      return trigger.weekdays.includes(time.weekday);
    default:
      return false;
  }
}

export function isEventActive(def: EventDef, time: GameTime): boolean {
  if (!def.triggers.length) return false;
  return def.triggers.some((t) => triggerActive(t, time));
}

class EventRegistry {
  private defs = new Map<EventId, EventDef>();

  register(def: EventDef): void {
    if (this.defs.has(def.id)) return;
    this.defs.set(def.id, def);
  }

  registerAll(defs: EventDef[]): void {
    for (const d of defs) this.register(d);
  }

  get(id: EventId): EventDef | undefined { return this.defs.get(id); }
  has(id: EventId): boolean { return this.defs.has(id); }
  all(): EventDef[] { return Array.from(this.defs.values()); }
  clear(): void { this.defs.clear(); }

  resolveActive(time: GameTime): EventId[] {
    const out: EventId[] = [];
    for (const def of this.defs.values()) {
      if (isEventActive(def, time)) out.push(def.id);
    }
    return out;
  }

  resolveTags(time: GameTime): Set<string> {
    const tags = new Set<string>();
    for (const def of this.defs.values()) {
      if (!isEventActive(def, time)) continue;
      for (const t of def.tags ?? []) tags.add(t);
    }
    return tags;
  }
}

let _instance: EventRegistry | null = null;
export function getEventRegistry(): EventRegistry {
  if (!_instance) _instance = new EventRegistry();
  return _instance;
}
export type { EventRegistry };
