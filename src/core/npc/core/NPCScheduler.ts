import type { GameTime, Weekday } from '../../time/types';

export type NPCActivity =
  | 'idle'
  | 'walk'
  | 'work'
  | 'shop'
  | 'sleep'
  | 'fish'
  | 'eat'
  | 'play';

export type NPCScheduleEntry = {
  startHour: number;
  endHour: number;
  position: [number, number, number];
  activity?: NPCActivity;
  dialogTreeId?: string;
  rotationY?: number;
  weekdays?: Weekday[];
  seasons?: GameTime['season'][];
};

export type NPCSchedule = {
  npcId: string;
  defaultEntry?: Omit<NPCScheduleEntry, 'startHour' | 'endHour'>;
  entries: NPCScheduleEntry[];
};

export type ActiveSlot = {
  position: [number, number, number];
  rotationY?: number;
  activity: NPCActivity;
  dialogTreeId?: string;
  source: NPCScheduleEntry | null;
};

function inHourRange(hour: number, start: number, end: number): boolean {
  if (start === end) return true;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

function entryMatches(entry: NPCScheduleEntry, time: GameTime): boolean {
  if (entry.weekdays && entry.weekdays.length > 0) {
    if (!entry.weekdays.includes(time.weekday)) return false;
  }
  if (entry.seasons && entry.seasons.length > 0) {
    if (!entry.seasons.includes(time.season)) return false;
  }
  return inHourRange(time.hour, entry.startHour, entry.endHour);
}

export function resolveSchedule(schedule: NPCSchedule, time: GameTime): ActiveSlot {
  for (const entry of schedule.entries) {
    if (entryMatches(entry, time)) {
      return {
        position: entry.position,
        rotationY: entry.rotationY,
        activity: entry.activity ?? 'idle',
        dialogTreeId: entry.dialogTreeId,
        source: entry,
      };
    }
  }
  const fallback = schedule.defaultEntry;
  return {
    position: fallback?.position ?? [0, 0, 0],
    rotationY: fallback?.rotationY,
    activity: fallback?.activity ?? 'idle',
    dialogTreeId: fallback?.dialogTreeId,
    source: null,
  };
}

class SchedulerRegistry {
  private map = new Map<string, NPCSchedule>();

  register(schedule: NPCSchedule): void {
    this.map.set(schedule.npcId, schedule);
  }

  unregister(npcId: string): void {
    this.map.delete(npcId);
  }

  get(npcId: string): NPCSchedule | undefined { return this.map.get(npcId); }

  resolve(npcId: string, time: GameTime): ActiveSlot | null {
    const s = this.map.get(npcId);
    if (!s) return null;
    return resolveSchedule(s, time);
  }

  all(): NPCSchedule[] { return Array.from(this.map.values()); }

  clear(): void { this.map.clear(); }
}

let _instance: SchedulerRegistry | null = null;
export function getNPCScheduler(): SchedulerRegistry {
  if (!_instance) _instance = new SchedulerRegistry();
  return _instance;
}
export type { SchedulerRegistry };
