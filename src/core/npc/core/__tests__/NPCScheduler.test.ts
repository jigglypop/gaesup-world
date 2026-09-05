import { computeGameTime } from '../../../time/core/Clock';
import { resolveSchedule, type NPCSchedule } from '../NPCScheduler';

const SCHEDULE: NPCSchedule = {
  npcId: 'tommy',
  defaultEntry: { position: [0, 0, 0], activity: 'idle', dialogTreeId: 'npc.shopkeeper' },
  entries: [
    { startHour: 9,  endHour: 18, position: [10, 0, 0], activity: 'shop', dialogTreeId: 'npc.shopkeeper' },
    { startHour: 22, endHour: 6,  position: [0, 0, 10], activity: 'sleep' },
    { startHour: 19, endHour: 21, position: [5, 0, 5],  activity: 'eat', weekdays: ['fri'] },
  ],
};

function timeAt(hour: number, weekdayIndex: number = 1): ReturnType<typeof computeGameTime> {
  const minutes = weekdayIndex * 24 * 60 + hour * 60;
  return computeGameTime(minutes);
}

describe('NPCScheduler.resolveSchedule', () => {
  test('matches active hour range', () => {
    const slot = resolveSchedule(SCHEDULE, timeAt(12));
    expect(slot.activity).toBe('shop');
    expect(slot.position[0]).toBe(10);
    expect(slot.dialogTreeId).toBe('npc.shopkeeper');
  });

  test('matches overnight wrap range', () => {
    const slot = resolveSchedule(SCHEDULE, timeAt(2));
    expect(slot.activity).toBe('sleep');
  });

  test('weekday filter excludes wrong day', () => {
    const slot = resolveSchedule(SCHEDULE, timeAt(20, 1));
    expect(slot.activity).not.toBe('eat');
  });

  test('weekday filter includes matching day', () => {
    const slot = resolveSchedule(SCHEDULE, timeAt(20, 5));
    expect(slot.activity).toBe('eat');
  });

  test('falls back to defaultEntry when no match', () => {
    const empty: NPCSchedule = { npcId: 'x', defaultEntry: { position: [3, 0, 3], activity: 'idle' }, entries: [] };
    const slot = resolveSchedule(empty, timeAt(12));
    expect(slot.activity).toBe('idle');
    expect(slot.position).toEqual([3, 0, 3]);
  });
});
