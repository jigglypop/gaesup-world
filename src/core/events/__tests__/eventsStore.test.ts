import type { GameTime } from '../../time/types';
import { registerSeedEvents } from '../data/events';
import { getEventRegistry, isEventActive } from '../registry/EventRegistry';
import { useEventsStore } from '../stores/eventsStore';
import type { EventDef } from '../types';

function gt(over: Partial<GameTime> = {}): GameTime {
  return {
    year: 1, month: 4, day: 5,
    hour: 12, minute: 0,
    weekday: 'sat', season: 'spring',
    totalMinutes: 0,
    ...over,
  };
}

const E_SEASON: EventDef = {
  id: 'e.spring',
  name: 'Spring',
  triggers: [{ kind: 'season', seasons: ['spring'] }],
  tags: ['season', 'fish:bass'],
};

const E_DAY: EventDef = {
  id: 'e.day',
  name: 'Apr5',
  triggers: [{ kind: 'monthDay', month: 4, day: 5 }],
  tags: ['festival'],
};

const E_RANGE: EventDef = {
  id: 'e.range',
  name: 'AprFest',
  triggers: [{ kind: 'monthRange', month: 4, fromDay: 1, toDay: 10 }],
  tags: ['festival'],
};

const E_WEEK: EventDef = {
  id: 'e.week',
  name: 'Weekend',
  triggers: [{ kind: 'weekday', weekdays: ['sat', 'sun'] }],
};

beforeEach(() => {
  getEventRegistry().clear();
  useEventsStore.setState({ active: [], startedAt: {}, tags: new Set<string>() });
});

describe('eventsStore', () => {
  test('seed events register without throwing', () => {
    registerSeedEvents();
    expect(getEventRegistry().all().length).toBeGreaterThan(0);
  });

  test('isEventActive reflects each trigger kind', () => {
    expect(isEventActive(E_SEASON, gt({ season: 'spring' }))).toBe(true);
    expect(isEventActive(E_SEASON, gt({ season: 'winter' }))).toBe(false);
    expect(isEventActive(E_DAY,    gt({ month: 4, day: 5 }))).toBe(true);
    expect(isEventActive(E_DAY,    gt({ month: 4, day: 6 }))).toBe(false);
    expect(isEventActive(E_RANGE,  gt({ month: 4, day: 7 }))).toBe(true);
    expect(isEventActive(E_RANGE,  gt({ month: 4, day: 11 }))).toBe(false);
    expect(isEventActive(E_WEEK,   gt({ weekday: 'sat' }))).toBe(true);
    expect(isEventActive(E_WEEK,   gt({ weekday: 'mon' }))).toBe(false);
  });

  test('refresh produces started/ended diffs', () => {
    getEventRegistry().registerAll([E_SEASON, E_DAY]);
    const a = useEventsStore.getState().refresh(gt({ month: 4, day: 5, season: 'spring' }));
    expect(a.started.sort()).toEqual(['e.day', 'e.spring']);
    expect(a.ended).toEqual([]);
    const b = useEventsStore.getState().refresh(gt({ month: 4, day: 6, season: 'spring' }));
    expect(b.started).toEqual([]);
    expect(b.ended).toEqual(['e.day']);
  });

  test('hasTag aggregates active event tags', () => {
    getEventRegistry().registerAll([E_SEASON, E_DAY]);
    useEventsStore.getState().refresh(gt({ season: 'spring', month: 4, day: 5 }));
    expect(useEventsStore.getState().hasTag('season')).toBe(true);
    expect(useEventsStore.getState().hasTag('fish:bass')).toBe(true);
    expect(useEventsStore.getState().hasTag('festival')).toBe(true);
    expect(useEventsStore.getState().hasTag('nope')).toBe(false);
  });

  test('serialize / hydrate round trip', () => {
    getEventRegistry().registerAll([E_SEASON]);
    useEventsStore.getState().refresh(gt({ season: 'spring' }));
    const data = useEventsStore.getState().serialize();
    useEventsStore.setState({ active: [], startedAt: {}, tags: new Set() });
    useEventsStore.getState().hydrate(data);
    expect(useEventsStore.getState().active).toEqual(['e.spring']);
  });
});
