import { DEFAULT_SCENE_ID, type SceneSerialized } from '../../types';
import { createSceneStore, useSceneStore } from '../sceneStore';

beforeEach(() => {
  jest.useFakeTimers();
  useSceneStore.getState().hydrate({ version: 1, current: DEFAULT_SCENE_ID });
  useSceneStore.getState().registerScene({ id: 'room', name: '방', interior: true });
  useSceneStore.getState().setReturnPoint(null);
});

afterEach(() => {
  useSceneStore.getState().unregisterScene('room');
  jest.useRealTimers();
});

test.each([0, 100, 250, 400])('loading cancels a scene transition at %s ms', async (elapsed) => {
  const transition = useSceneStore.getState().goTo('room');
  await jest.advanceTimersByTimeAsync(elapsed);
  useSceneStore.getState().hydrate({ version: 1, current: DEFAULT_SCENE_ID });
  const restored = useSceneStore.getState();
  expect(restored.pending).toBeNull();
  expect(restored.transition).toMatchObject({ active: false, progress: 0 });
  await jest.runAllTimersAsync();
  await transition;
  expect(useSceneStore.getState()).toBe(restored);
});

test('a cancelled transition cannot interfere with a new transition to the same scene', async () => {
  const old = useSceneStore.getState().goTo('room');
  await jest.advanceTimersByTimeAsync(100);
  useSceneStore.getState().hydrate({ version: 1, current: DEFAULT_SCENE_ID });
  const next = useSceneStore.getState().goTo('room');
  await jest.advanceTimersByTimeAsync(130);
  expect(useSceneStore.getState().current).toBe(DEFAULT_SCENE_ID);
  expect(useSceneStore.getState().pending).toBe('room');
  await jest.runAllTimersAsync();
  await Promise.all([old, next]);
  expect(useSceneStore.getState().current).toBe('room');
  expect(useSceneStore.getState().transition.active).toBe(false);
});

test('preparation leaves navigation running until application and owns the saved ID', async () => {
  const transition = useSceneStore.getState().goTo('room');
  const before = useSceneStore.getState();
  const data: SceneSerialized = { version: 1, current: DEFAULT_SCENE_ID };
  const apply = before.prepareHydrate(data);
  data.current = 'room';
  expect(useSceneStore.getState()).toBe(before);
  await jest.runAllTimersAsync();
  await transition;
  expect(useSceneStore.getState().current).toBe('room');
  apply();
  expect(useSceneStore.getState().current).toBe(DEFAULT_SCENE_ID);
});

test('invalid saves reject without mutation and unregistered scenes remain a no-op', () => {
  const before = useSceneStore.getState();
  expect(() => before.prepareHydrate({ version: 2, current: DEFAULT_SCENE_ID } as unknown as SceneSerialized)).toThrow(TypeError);
  expect(() => before.prepareHydrate({ version: 1, current: '' })).toThrow(TypeError);
  before.hydrate({ version: 1, current: 'unregistered' });
  before.hydrate(null);
  expect(useSceneStore.getState()).toBe(before);
});

test('two stores navigate concurrently and suspending one clears its timer and settles its promise', async () => {
  const a = createSceneStore(); const b = createSceneStore();
  for (const store of [a, b]) store.getState().registerScene({ id: 'room', interior: true });
  const enteredA = jest.fn(); const enteredB = jest.fn();
  const first = a.getState().goTo('room', { onEntered: enteredA });
  const second = b.getState().goTo('room', { onEntered: enteredB });
  expect(jest.getTimerCount()).toBe(2);
  a.getState().suspendTransitions(); await first;
  expect(jest.getTimerCount()).toBe(1);
  expect(enteredA).not.toHaveBeenCalled();
  await a.getState().goTo('room', { onEntered: enteredA });
  await jest.runAllTimersAsync(); await second;
  expect(a.getState().current).toBe('outdoor'); expect(b.getState().current).toBe('room');
  expect(enteredB).toHaveBeenCalledTimes(1);
  expect(jest.getTimerCount()).toBe(0);
  a.getState().resumeTransitions(); const restarted = a.getState().goTo('room');
  await jest.runAllTimersAsync(); await restarted;
  expect(a.getState().current).toBe('room');
});

test('entry callback runs once under opaque cover, before fade-in and completion', async () => {
  const store = createSceneStore(); const entry = { position: [1, 2, 3] as [number, number, number] };
  store.getState().registerScene({ id: 'room', entry });
  const entered = jest.fn(value => {
    expect(value).toBe(entry);
    expect(store.getState()).toMatchObject({ current: 'room', pending: 'room', transition: { active: true, progress: 1 } });
  });
  const transition = store.getState().goTo('room', { onEntered: entered });
  await jest.advanceTimersByTimeAsync(224);
  expect(entered).toHaveBeenCalledTimes(1);
  expect(store.getState().pending).toBe('room');
  await jest.runAllTimersAsync(); await transition;
  expect(entered).toHaveBeenCalledTimes(1);
  expect(store.getState().transition.active).toBe(false);
});

test('external abort clears timers immediately and the old finally cannot clear a new navigation', async () => {
  const store = createSceneStore(); store.getState().registerScene({ id: 'room' });
  const controller = new AbortController(); const entered = jest.fn();
  const old = store.getState().goTo('room', { signal: controller.signal, onEntered: entered });
  await jest.advanceTimersByTimeAsync(100); controller.abort();
  expect(jest.getTimerCount()).toBe(0);
  const current = store.getState().goTo('room'); await old;
  expect(store.getState().pending).toBe('room'); expect(entered).not.toHaveBeenCalled();
  await jest.runAllTimersAsync(); await current;
  expect(store.getState().current).toBe('room'); expect(jest.getTimerCount()).toBe(0);
});

test('reentrant hydration at commit prevents entry effects and leaves no pending timer', async () => {
  const store = createSceneStore(); store.getState().registerScene({ id: 'room' });
  const off = store.subscribe(state => {
    if (state.current === 'room') state.hydrate({ version: 1, current: 'outdoor' });
  });
  const entered = jest.fn(); const task = store.getState().goTo('room', { onEntered: entered });
  await jest.runAllTimersAsync(); await task; off();
  expect(entered).not.toHaveBeenCalled(); expect(store.getState().current).toBe('outdoor');
  expect(jest.getTimerCount()).toBe(0);
});

test('entry callback failure releases the transition and preserves the committed scene', async () => {
  const store = createSceneStore(); store.getState().registerScene({ id: 'room' });
  const task = store.getState().goTo('room', { onEntered: () => { throw new Error('entry failed'); } });
  const rejected = expect(task).rejects.toThrow('entry failed');
  await jest.runAllTimersAsync(); await rejected;
  expect(store.getState()).toMatchObject({ current: 'room', pending: null, transition: { active: false } });
  expect(jest.getTimerCount()).toBe(0);
});
