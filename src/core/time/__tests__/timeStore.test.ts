import { useTimeStore } from '../stores/timeStore';

const NOW = Date.UTC(2026, 8, 5);
const MINUTE_MS = 60_000;

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
  useTimeStore.setState({ ...useTimeStore.getInitialState(), listeners: new Set() });
});

afterEach(() => jest.useRealTimers());

test('entering realtime preserves current minutes and advances at wall-clock speed', () => {
  const listener = jest.fn();
  useTimeStore.getState().addListener(listener);
  useTimeStore.getState().setMode('realtime');
  useTimeStore.getState().tick(16);
  expect(useTimeStore.getState().totalMinutes).toBe(480);
  expect(listener).not.toHaveBeenCalled();
  jest.setSystemTime(NOW + MINUTE_MS);
  useTimeStore.getState().tick(16);
  expect(useTimeStore.getState().totalMinutes).toBe(481);
});

test('setting realtime minutes rebases the clock and switching modes preserves progress', () => {
  useTimeStore.getState().setMode('realtime');
  useTimeStore.getState().setTotalMinutes(900);
  jest.setSystemTime(NOW + MINUTE_MS);
  useTimeStore.getState().tick(16);
  expect(useTimeStore.getState().totalMinutes).toBe(901);
  useTimeStore.getState().setMode('scaled');
  useTimeStore.getState().tick(1000);
  expect(useTimeStore.getState().totalMinutes).toBe(902);
  useTimeStore.getState().setMode('realtime');
  useTimeStore.getState().tick(16);
  expect(useTimeStore.getState().totalMinutes).toBe(902);
});

test('realtime pause excludes paused duration and repeated resume does not reset elapsed time', () => {
  useTimeStore.getState().setMode('realtime');
  useTimeStore.getState().pause();
  jest.setSystemTime(NOW + 10 * MINUTE_MS);
  useTimeStore.getState().tick(16);
  expect(useTimeStore.getState().totalMinutes).toBe(480);
  useTimeStore.getState().resume();
  jest.setSystemTime(NOW + 11 * MINUTE_MS);
  useTimeStore.getState().resume();
  useTimeStore.getState().setMode('realtime');
  useTimeStore.getState().tick(16);
  expect(useTimeStore.getState().totalMinutes).toBe(481);
});

test('unpaused realtime saves keep elapsed wall-clock time across reloads', () => {
  useTimeStore.getState().setMode('realtime');
  const saved = useTimeStore.getState().serialize();
  jest.setSystemTime(NOW + 2 * MINUTE_MS);
  useTimeStore.getState().hydrate(saved);
  useTimeStore.getState().tick(16);
  expect(useTimeStore.getState().totalMinutes).toBe(482);
});
