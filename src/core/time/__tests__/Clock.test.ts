import { computeGameTime, isNewDay, isNewHour, realMsToGameMinutes, TIME_CONSTANTS } from '../core/Clock';

describe('Clock', () => {
  test('computeGameTime epoch returns Y1 M1 D1 00:00 sun spring', () => {
    const t = computeGameTime(0);
    expect(t.year).toBe(1);
    expect(t.month).toBe(1);
    expect(t.day).toBe(1);
    expect(t.hour).toBe(0);
    expect(t.minute).toBe(0);
    expect(t.weekday).toBe('sun');
    expect(t.season).toBe('winter');
  });

  test('computeGameTime + one day rolls weekday', () => {
    const t = computeGameTime(TIME_CONSTANTS.MINUTES_PER_DAY);
    expect(t.weekday).toBe('mon');
    expect(t.day).toBe(2);
  });

  test('season mapping matches months', () => {
    expect(computeGameTime(TIME_CONSTANTS.MINUTES_PER_MONTH * 3).season).toBe('spring');
    expect(computeGameTime(TIME_CONSTANTS.MINUTES_PER_MONTH * 6).season).toBe('summer');
    expect(computeGameTime(TIME_CONSTANTS.MINUTES_PER_MONTH * 9).season).toBe('autumn');
    expect(computeGameTime(TIME_CONSTANTS.MINUTES_PER_MONTH * 11).season).toBe('winter');
  });

  test('isNewDay / isNewHour boundaries', () => {
    expect(isNewDay(TIME_CONSTANTS.MINUTES_PER_DAY - 1, TIME_CONSTANTS.MINUTES_PER_DAY + 1)).toBe(true);
    expect(isNewDay(0, 1)).toBe(false);
    expect(isNewHour(59, 61)).toBe(true);
    expect(isNewHour(0, 30)).toBe(false);
  });

  test('realMsToGameMinutes uses scale (real seconds per game minute)', () => {
    expect(realMsToGameMinutes(1000, 1)).toBeCloseTo(1, 6);
    expect(realMsToGameMinutes(2000, 2)).toBeCloseTo(1, 6);
    expect(realMsToGameMinutes(0, 1)).toBe(0);
  });
});
