export type VisitRecord = { day: string; today: number; total: number };

export const VISITS_KEY = 'gaesup.minihome.visits';
const SESSION_KEY = 'gaesup.minihome.visit-counted';

type ReadWrite = Pick<Storage, 'getItem' | 'setItem'>;

export function localDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseVisits(raw: string | null): VisitRecord | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return null;
    const { day, today, total } = value as Record<string, unknown>;
    if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
    if (!Number.isSafeInteger(today) || !Number.isSafeInteger(total)) return null;
    if ((today as number) < 0 || (total as number) < (today as number)) return null;
    return { day, today: today as number, total: total as number };
  } catch {
    return null;
  }
}

/** Today resets on a new local day; total keeps growing. */
export function recordVisit(previous: VisitRecord | null, now: Date): VisitRecord {
  const day = localDay(now);
  if (!previous) return { day, today: 1, total: 1 };
  return { day, today: previous.day === day ? previous.today + 1 : 1, total: previous.total + 1 };
}

/** Counts one visit per browser tab session; reloads and remounts in the same tab do not recount. */
export function registerVisit(storage: ReadWrite, session: ReadWrite, now: Date = new Date()): VisitRecord | null {
  try {
    const previous = parseVisits(storage.getItem(VISITS_KEY));
    if (session.getItem(SESSION_KEY) === '1' && previous) {
      return previous.day === localDay(now) ? previous : { ...previous, day: localDay(now), today: 0 };
    }
    const next = recordVisit(previous, now);
    storage.setItem(VISITS_KEY, JSON.stringify(next));
    session.setItem(SESSION_KEY, '1');
    return next;
  } catch {
    return null;
  }
}
