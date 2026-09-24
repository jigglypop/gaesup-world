import { act, renderHook } from '@testing-library/react';

import { useGameTime } from '../hooks/useGameTime';
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

test('paused realtime restoration stays paused and resume excludes time spent away', () => {
  useTimeStore.getState().setMode('realtime'); useTimeStore.getState().setTotalMinutes(1440); useTimeStore.getState().pause();
  const saved = useTimeStore.getState().serialize(); const revision = useTimeStore.getState().hydrationRevision;
  const apply = useTimeStore.getState().prepareHydrate(saved); saved.pausedAt = null;
  useTimeStore.getState().resume(); jest.setSystemTime(NOW + 10 * MINUTE_MS); apply();
  expect(useTimeStore.getState().paused).toBe(true); expect(useTimeStore.getState().hydrationRevision).toBe(revision + 1);
  useTimeStore.getState().tick(1000); expect(useTimeStore.getState().totalMinutes).toBe(1440);
  useTimeStore.getState().resume(); jest.setSystemTime(NOW + 11 * MINUTE_MS); useTimeStore.getState().tick(1000); expect(useTimeStore.getState().totalMinutes).toBe(1441);
  expect(useTimeStore.getState().serialize()).not.toHaveProperty('hydrationRevision');
});

test('같은 게임 분 안의 tick은 time 객체를 유지하고 분이 바뀔 때만 새로 만든다', () => {
  const first = useTimeStore.getState().time;
  useTimeStore.getState().tick(16);
  expect(useTimeStore.getState().totalMinutes).toBe(480);
  expect(useTimeStore.getState().exactMinutes()).toBeGreaterThan(480);
  expect(useTimeStore.getState().time).toBe(first);
  useTimeStore.getState().tick(MINUTE_MS / 60);
  expect(useTimeStore.getState().time).not.toBe(first);
  expect(useTimeStore.getState().time.minute).toBe(first.minute + 1);
});

test('분 안의 tick은 구독자를 깨우지 않는다(60틱에 알림 1회 이하)', () => {
  const listener = jest.fn();
  const off = useTimeStore.subscribe(listener);
  for (let i = 0; i < 60; i++) useTimeStore.getState().tick(16);
  expect(listener.mock.calls.length).toBeLessThanOrEqual(1);
  off();
});

test('분 안의 tick은 구독자를 깨우지 않는다(60틱에 알림 1회 이하)', () => {
  const listener = jest.fn();
  const off = useTimeStore.subscribe(listener);
  for (let i = 0; i < 60; i++) useTimeStore.getState().tick(16);
  expect(listener.mock.calls.length).toBeLessThanOrEqual(1);
  off();
});

test('useGameTime은 분 안의 프레임 tick마다 다시 렌더하지 않는다', () => {
  let renders = 0;
  const view = renderHook(() => { renders++; return useGameTime(); });
  act(() => { for (let i = 0; i < 30; i++) useTimeStore.getState().tick(16); });
  expect(renders).toBe(1);
  act(() => { useTimeStore.getState().tick(MINUTE_MS / 60); });
  expect(renders).toBe(2);
  expect(view.result.current.minute).toBe(1);
  view.unmount();
});
