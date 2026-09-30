import { useFrame, useThree, type RootState } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';

import { useCanvasFrameScheduler, type FrameScheduler } from '../../runtime/frame';
import { createIdleFrameGate, IdleFrameRate } from '../idle';

const DISPLAY_FRAME = 1000 / 60;

test('draws every display frame while active, then every other one at 30 fps once idle, and every one again after input', () => {
  const gate = createIdleFrameGate({ fps: 30, afterMs: 1000 });
  gate.activity(0);
  const drawn = (from: number, count: number) =>
    Array.from({ length: count }, (_, index) => gate.shouldDraw(from + index * DISPLAY_FRAME)).filter(Boolean).length;
  expect(drawn(0, 54)).toBe(54);
  expect(drawn(1000, 60)).toBe(30);
  gate.activity(2000);
  expect(drawn(2000, 30)).toBe(30);
});

test('an earlier activity time never pulls the idle clock back', () => {
  const gate = createIdleFrameGate({ fps: 30, afterMs: 1000 });
  gate.activity(2000);
  gate.activity(500);
  expect(gate.shouldDraw(2500)).toBe(true);
  expect(gate.shouldDraw(2500 + DISPLAY_FRAME)).toBe(true);
});

test('activity marked on the canvas scheduler, such as walking NPCs, keeps every frame drawn without input', async () => {
  let scheduler: FrameScheduler | null = null;
  const deltas: number[] = [];
  function Probe() {
    scheduler = useCanvasFrameScheduler();
    useFrame((_, delta) => { deltas.push(delta); });
    return null;
  }
  let now = 0;
  const frames: FrameRequestCallback[] = [];
  const request = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => frames.push(callback));
  const cancel = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  const clock = jest.spyOn(performance, 'now').mockImplementation(() => now);
  const run = (count: number, each?: () => void) => {
    for (let index = 0; index < count; index++) {
      now += DISPLAY_FRAME;
      each?.();
      frames.splice(0).forEach((callback) => callback(now));
    }
  };
  const view = await ReactThreeTestRenderer.create(<><Probe /><IdleFrameRate fps={30} after={1} /></>, { frameloop: 'always' });
  try {
    run(90);
    deltas.length = 0;
    run(120, () => scheduler!.markActivity(now));
    expect(deltas).toHaveLength(120);
    deltas.length = 0;
    run(120);
    expect(deltas.length).toBeLessThanOrEqual(90);
  } finally {
    await view.unmount();
    request.mockRestore();
    cancel.mockRestore();
    clock.mockRestore();
  }
});

test('taking the canvas over drops frames requested before, which would run with a millisecond timestamp', async () => {
  let get: (() => RootState) | null = null;
  function Probe() {
    get = useThree((state) => state.get);
    return null;
  }
  const view = await ReactThreeTestRenderer.create(<><Probe /><IdleFrameRate /></>, { frameloop: 'always' });
  try {
    expect(get!().frameloop).toBe('never');
    expect(get!().internal.frames).toBe(0);
  } finally {
    await view.unmount();
  }
});

test('the gate alone paces frames: requests from awake physics bodies add none while idle, and time runs on', async () => {
  let get: (() => RootState) | null = null;
  const deltas: number[] = [];
  function Probe() {
    get = useThree((state) => state.get);
    useFrame((_, delta) => { deltas.push(delta); });
    return null;
  }
  let now = 0;
  const frames: FrameRequestCallback[] = [];
  const request = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => frames.push(callback));
  const cancel = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  const clock = jest.spyOn(performance, 'now').mockImplementation(() => now);
  const run = (count: number, each?: () => void) => {
    for (let index = 0; index < count; index++) {
      now += DISPLAY_FRAME;
      each?.();
      frames.splice(0).forEach((callback) => callback(now));
    }
  };
  const view = await ReactThreeTestRenderer.create(<><Probe /><IdleFrameRate fps={30} after={1} /></>, { frameloop: 'always' });
  try {
    expect(get!().frameloop).toBe('never');
    run(30);
    expect(deltas).toHaveLength(30);
    deltas.length = 0;
    // Physics invalidates for every awake body after each step (a standing player never sleeps).
    run(120, () => get!().invalidate());
    expect(deltas.length).toBeGreaterThan(60);
    expect(deltas.length).toBeLessThanOrEqual(80);
    expect(deltas.reduce((sum, delta) => sum + delta, 0)).toBeCloseTo(2, 1);
    deltas.length = 0;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
    run(10);
    expect(deltas).toHaveLength(10);
  } finally {
    await view.unmount();
    request.mockRestore();
    cancel.mockRestore();
    clock.mockRestore();
  }
  expect(get!().frameloop).toBe('always');
});
