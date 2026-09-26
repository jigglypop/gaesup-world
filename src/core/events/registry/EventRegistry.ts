import type { GameTime } from '../../time/types';
import { DefinitionRegistry } from '../../utils/definitionRegistry';
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

class EventRegistry extends DefinitionRegistry<EventId, EventDef> {
  constructor() { super('EventId'); }

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
