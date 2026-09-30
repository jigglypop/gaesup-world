import { useEffect, useState } from 'react';

const KEY = (name: string) => `minihome:${name}`;

/** Reads a stored value; storage can be missing or blocked (private windows, previews). */
export function readStored<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(KEY(name));
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStored(name: string, value: unknown): void {
  try {
    localStorage.setItem(KEY(name), JSON.stringify(value));
  } catch {
    // The page works without storage; the value just does not survive a reload.
  }
}

/** `useState` that survives reloads in this browser. */
export function useStored<T>(name: string, fallback: T) {
  const [value, setValue] = useState(() => readStored(name, fallback));
  useEffect(() => writeStored(name, value), [name, value]);
  return [value, setValue] as const;
}

/** TODAY/TOTAL visitor counters, counted once per page load. */
export function countVisit(): { today: number; total: number } {
  const date = new Date().toDateString();
  const last = readStored('visits', { date, today: 0, total: 0 });
  const next = { date, today: (last.date === date ? last.today : 0) + 1, total: last.total + 1 };
  writeStored('visits', next);
  return next;
}
