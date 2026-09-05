import { useSceneStore } from '../sceneStore';
import { DEFAULT_SCENE_ID, type SceneSerialized } from '../../types';

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
