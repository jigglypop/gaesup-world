import { Vector3 } from 'three';

import { createGaesupRuntime } from '../../runtime/createGaesupRuntime';
import { createSceneStore } from '../../scene/stores/sceneStore';
import { createGaesupStore } from '../../stores/gaesupStore';
import { createCameraCinematicPlayer, playCameraCinematic, type CameraCinematicBeat, type CameraCinematicPlayback } from '../cinematic';

function fixture() {
  const store = createGaesupStore(); const sceneStore = createSceneStore();
  store.getState().replaceCameraOption({ focus: false, fov: 75, offset: new Vector3(1, 2, 3) });
  return { store, sceneStore, player: createCameraCinematicPlayer({ store, sceneStore }) };
}
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('cancel settles immediately, removes the timer and never dispatches following commands', async () => {
  const { player, store } = fixture(); const effect = jest.fn();
  const run = player.play([{ kind: 'closeUp', target: [1, 0, 0], durationMs: 60000 }, { kind: 'event', name: 'late' }], { onEvent: effect });
  expect(jest.getTimerCount()).toBe(1); run.cancel(); await run.finished;
  expect(run.state).toBe('cancelled'); expect(jest.getTimerCount()).toBe(0); expect(effect).not.toHaveBeenCalled();
  expect(store.getState().cameraOption).toMatchObject({ focus: false, fov: 75 });
  expect(player.getStats()).toMatchObject({ playing: false, pendingTimers: 0, cancelled: 1 });
});

test('the latest timeline owns the camera; stale completion and cancellation cannot restore it', async () => {
  const { player, store } = fixture();
  const old = player.play([{ kind: 'closeUp', target: [1, 0, 0], durationMs: 60000 }]);
  const latest = playCameraCinematic([{ kind: 'closeUp', target: [2, 0, 0], durationMs: 100 }], { store });
  await old.finished; old.cancel(); expect(store.getState().cameraOption.focusTarget?.x).toBe(2); expect(store.getState().cameraOption.focus).toBe(true);
  await jest.runAllTimersAsync(); await latest.finished;
  expect(store.getState().cameraOption).toMatchObject({ focus: false, fov: 75 }); expect(jest.getTimerCount()).toBe(0);
});

test('pre-aborted playback does not interrupt an existing timeline and live abort releases its timer', async () => {
  const { player, store } = fixture(); const signal = new AbortController();
  const current = player.play([{ kind: 'closeUp', target: [1, 0, 0], durationMs: 1000 }], { signal: signal.signal });
  const aborted = new AbortController(); aborted.abort(); const effect = jest.fn();
  const skipped = player.play([{ kind: 'event', name: 'skip' }], { signal: aborted.signal, onEvent: effect }); await skipped.finished;
  expect(current.state).toBe('playing'); expect(effect).not.toHaveBeenCalled();
  signal.abort(); await current.finished; expect(jest.getTimerCount()).toBe(0); expect(store.getState().cameraOption.focus).toBe(false);
});

test('shake and fade restore previous values on cancellation and natural completion', async () => {
  const { player, store, sceneStore } = fixture();
  sceneStore.getState().setTransition({ active: true, progress: 0.3, color: '#fedcba' });
  const fade = player.play([{ kind: 'fade', durationMs: 1000 }]); fade.cancel(); await fade.finished;
  expect(sceneStore.getState().transition).toEqual({ active: true, progress: 0.3, color: '#fedcba' });
  const shake = player.play([{ kind: 'shake', durationMs: 1000 }]); shake.cancel(); await shake.finished;
  expect(store.getState().cameraOption.offset?.toArray()).toEqual([1, 2, 3]);
  const completed = player.play([{ kind: 'shake', durationMs: 10 }], { restoreOnComplete: false });
  await jest.runAllTimersAsync(); await completed.finished; expect(store.getState().cameraOption.offset?.toArray()).toEqual([1, 2, 3]);
});

test('cleanup preserves camera and fade state subsequently written by another owner', async () => {
  const { player, store, sceneStore } = fixture();
  const camera = player.play([{ kind: 'closeUp', target: [1, 0, 0], durationMs: 1000 }]);
  store.getState().setCameraOption({ fov: 91, focusTarget: new Vector3(8, 0, 0) }); camera.cancel(); await camera.finished;
  expect(store.getState().cameraOption.fov).toBe(91); expect(store.getState().cameraOption.focusTarget?.x).toBe(8);
  const fade = player.play([{ kind: 'fade', durationMs: 1000 }]); sceneStore.getState().setTransition({ color: '#123456', progress: 0.4 });
  fade.cancel(); await fade.finished; expect(sceneStore.getState().transition).toMatchObject({ color: '#123456', progress: 0.4 });
});

test('callback failure restores owned state and rejects finished without retaining timers', async () => {
  const { player, store } = fixture(); const error = new Error('callback failed');
  const run = player.play([{ kind: 'closeUp', target: [1, 0, 0] }, { kind: 'event', name: 'fail' }], { onEvent: () => { throw error; } });
  const rejected = expect(run.finished).rejects.toBe(error); await jest.runAllTimersAsync(); await rejected;
  expect(run.state).toBe('failed'); expect(store.getState().cameraOption.focus).toBe(false); expect(jest.getTimerCount()).toBe(0);
});

test('a command can synchronously replace its timeline without executing the old continuation', async () => {
  const { player, store } = fixture(); const after = jest.fn(); let next: CameraCinematicPlayback | undefined;
  const old = player.play([{ kind: 'event', name: 'replace' }, { kind: 'event', name: 'old' }], { onEvent: name => {
    if (name === 'replace') next = player.play([{ kind: 'closeUp', target: [5, 0, 0], durationMs: 100 }]); else after();
  } });
  await old.finished; expect(old.state).toBe('cancelled'); expect(store.getState().cameraOption.focusTarget?.x).toBe(5);
  await jest.runAllTimersAsync(); await next!.finished; expect(after).not.toHaveBeenCalled();
});

test('reentrant camera observers can replace playback during its first write', async () => {
  const { player, store } = fixture(); let next: CameraCinematicPlayback | undefined;
  const off = store.subscribe(state => { if (!next && state.cameraOption.focusTarget?.x === 1) next = player.play([{ kind: 'closeUp', target: [5, 0, 0], durationMs: 100 }]); });
  try {
    const old = player.play([{ kind: 'closeUp', target: [1, 0, 0], durationMs: 1000 }]); await old.finished;
    expect(old.state).toBe('cancelled'); expect(store.getState().cameraOption.focusTarget?.x).toBe(5);
    await jest.runAllTimersAsync(); await next!.finished; expect(store.getState().cameraOption.fov).toBe(75);
  } finally { off(); player.cancel(); }
});

test('asynchronous beats use snapshotted target vectors and options; completed cancel is harmless', async () => {
  const { player, store } = fixture(); const target = new Vector3(2, 3, 4);
  const beats: CameraCinematicBeat[] = [{ kind: 'event', name: 'wait', durationMs: 10 }, { kind: 'closeUp', target, fov: 42 }];
  const run = player.play(beats, { restoreOnComplete: false }); target.set(9, 9, 9); beats.splice(1, 1);
  await jest.runAllTimersAsync(); await run.finished; run.cancel();
  expect(run.state).toBe('completed'); expect(store.getState().cameraOption.focusTarget?.toArray()).toEqual([2, 3, 4]); expect(store.getState().cameraOption.fov).toBe(42);
});

test('world lifetime gates both runtime and public API playback, with zero timers across 50 restarts', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime(); const effect = jest.fn();
  try {
    await a.cinematics.play([{ kind: 'event', name: 'inactive' }], { onEvent: effect }).finished; expect(effect).not.toHaveBeenCalled();
    await a.setup(); await b.setup(); const other = b.cinematics.play([{ kind: 'closeUp', target: [3, 0, 0], durationMs: 60000 }]);
    for (let cycle = 0; cycle < 50; cycle++) {
      const run = playCameraCinematic([{ kind: 'closeUp', target: [1, 0, 0], durationMs: 60000 }, { kind: 'event', name: 'late' }], { store: a.store, onEvent: effect });
      await a.dispose(); await run.finished; expect(a.cinematics.getStats()).toMatchObject({ active: false, pendingTimers: 0, playing: false });
      await a.setup();
    }
    expect(effect).not.toHaveBeenCalled(); expect(other.state).toBe('playing'); expect(jest.getTimerCount()).toBe(1);
    await b.dispose(); await other.finished; expect(jest.getTimerCount()).toBe(0);
  } finally { await a.dispose(); await b.dispose(); }
});
