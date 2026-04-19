import type { GameTime, Season, Weekday } from '../types';

const WEEKDAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAYS_PER_MONTH = 30;
const MONTHS_PER_YEAR = 12;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;
const MINUTES_PER_MONTH = MINUTES_PER_DAY * DAYS_PER_MONTH;
const MINUTES_PER_YEAR = MINUTES_PER_MONTH * MONTHS_PER_YEAR;

function seasonFromMonth(month: number): Season {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

export function computeGameTime(totalMinutes: number): GameTime {
  const tm = Math.max(0, Math.floor(totalMinutes));
  const year = Math.floor(tm / MINUTES_PER_YEAR);
  const remAfterYear = tm % MINUTES_PER_YEAR;
  const monthIndex = Math.floor(remAfterYear / MINUTES_PER_MONTH);
  const remAfterMonth = remAfterYear % MINUTES_PER_MONTH;
  const dayIndex = Math.floor(remAfterMonth / MINUTES_PER_DAY);
  const remAfterDay = remAfterMonth % MINUTES_PER_DAY;
  const hour = Math.floor(remAfterDay / MINUTES_PER_HOUR);
  const minute = remAfterDay % MINUTES_PER_HOUR;

  const totalDays = Math.floor(tm / MINUTES_PER_DAY);
  const weekday = WEEKDAYS[totalDays % 7]!;
  const month = monthIndex + 1;
  const day = dayIndex + 1;

  return {
    year: year + 1,
    month,
    day,
    hour,
    minute,
    weekday,
    season: seasonFromMonth(month),
    totalMinutes: tm,
  };
}

export function realMsToGameMinutes(realMs: number, scale: number): number {
  // scale = real seconds per game minute. default 1 means 1real sec = 1game min.
  if (scale <= 0) return 0;
  return realMs / 1000 / scale;
}

export function isNewDay(prevTotalMinutes: number, nextTotalMinutes: number): boolean {
  return Math.floor(prevTotalMinutes / MINUTES_PER_DAY) !==
    Math.floor(nextTotalMinutes / MINUTES_PER_DAY);
}

export function isNewHour(prevTotalMinutes: number, nextTotalMinutes: number): boolean {
  return Math.floor(prevTotalMinutes / MINUTES_PER_HOUR) !==
    Math.floor(nextTotalMinutes / MINUTES_PER_HOUR);
}

export const TIME_CONSTANTS = {
  MINUTES_PER_HOUR,
  MINUTES_PER_DAY,
  MINUTES_PER_MONTH,
  MINUTES_PER_YEAR,
  DAYS_PER_MONTH,
  MONTHS_PER_YEAR,
  HOURS_PER_DAY,
} as const;
