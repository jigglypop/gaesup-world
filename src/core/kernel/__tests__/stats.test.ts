import { EngineStats } from '../stats';

test('counters count since the last reset through a shared handle', () => {
  const stats = new EngineStats();
  const saves = stats.counter('saves');
  saves.value += 2;
  expect(stats.counter('saves')).toBe(saves);
  expect(stats.snapshot()).toEqual({ saves: 2 });
  stats.reset();
  saves.value += 1;
  expect(stats.snapshot()['saves']).toBe(1);
});

test('cumulative sources report the change since reset, gauges the current value', () => {
  const stats = new EngineStats();
  let ticks = 40;
  let systems = 3;
  stats.source('ticks', () => ticks);
  stats.source('systems', () => systems, 'gauge');
  ticks += 5;
  expect(stats.snapshot()).toEqual({ ticks: 5, systems: 3 });
  stats.reset();
  ticks += 2;
  systems = 4;
  expect(stats.snapshot()).toEqual({ ticks: 2, systems: 4 });
});

test('a released source stops reporting, and a newer registration replaces an older one', () => {
  const stats = new EngineStats();
  const releaseFirst = stats.source('frames', () => 10, 'gauge');
  const releaseSecond = stats.source('frames', () => 20, 'gauge');
  releaseFirst();
  expect(stats.snapshot()['frames']).toBe(20);
  releaseSecond();
  expect(stats.snapshot()).toEqual({});
});

test('one name cannot be both a counter and a source', () => {
  const stats = new EngineStats();
  stats.counter('a');
  expect(() => stats.source('a', () => 0)).toThrow();
  stats.source('b', () => 0);
  expect(() => stats.counter('b')).toThrow();
});
