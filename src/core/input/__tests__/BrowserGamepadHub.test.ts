import { BrowserGamepadHub, type BrowserGamepad } from '../BrowserGamepadHub';
import { logger } from '../../utils/logger';

function fixture() {
  const target = new EventTarget(); const document = Object.assign(new EventTarget(), { hidden: false, hasFocus: () => true });
  let pads: Array<BrowserGamepad | null> = [null, { id: 'pad', index: 1, mapping: 'standard', connected: true, axes: [0, 0, 0, 0], buttons: [], timestamp: 0 }];
  const getGamepads = jest.fn(() => pads); const frames = new Map<number, FrameRequestCallback>(); let nextFrame = 0;
  const window = Object.assign(target, { document, navigator: { getGamepads }, requestAnimationFrame: (fn: FrameRequestCallback) => { const id = ++nextFrame; frames.set(id, fn); return id; }, cancelAnimationFrame: (id: number) => frames.delete(id) });
  const tick = () => { const pending = [...frames]; frames.clear(); for (const [, callback] of pending) callback(0); };
  return { hub: new BrowserGamepadHub(window as unknown as Window), window, frames, tick, getGamepads, setPads: (next: typeof pads) => { pads = next; } };
}

test('two leases share exactly one poll per frame; final release cancels all work and stale frames', () => {
  const f = fixture(); const a = jest.fn(); const b = jest.fn(); const offA = f.hub.subscribe(a); const offB = f.hub.subscribe(b);
  expect(f.getGamepads).toHaveBeenCalledTimes(1); expect(b.mock.calls[0]![0][1].index).toBe(1);
  for (let frame = 0; frame < 50; frame++) f.tick();
  expect(f.getGamepads).toHaveBeenCalledTimes(51); expect(a).toHaveBeenCalledTimes(51); expect(b).toHaveBeenCalledTimes(51);
  offA(); f.tick(); expect(a).toHaveBeenCalledTimes(51); expect(b).toHaveBeenCalledTimes(52);
  const stale = [...f.frames.values()][0]!; offB(); offB(); stale(0);
  f.window.dispatchEvent(new Event('gamepadconnected')); f.window.dispatchEvent(new Event('focus'));
  expect(f.getGamepads).toHaveBeenCalledTimes(52); expect(f.frames.size).toBe(0); expect(f.hub.getStats()).toMatchObject({ subscribers: 0, pendingFrames: 0, status: 'idle' });
});

test('no devices or inactive document means no idle polling; connect, focus and visibility wake the hub', () => {
  const f = fixture(); f.setPads([]); const listener = jest.fn(); const off = f.hub.subscribe(listener);
  expect(f.frames.size).toBe(0); f.setPads([null, { id: 'pad', index: 1, connected: true, mapping: 'standard', axes: [], buttons: [], timestamp: 0 }]);
  f.window.dispatchEvent(new Event('gamepadconnected')); expect(f.frames.size).toBe(1);
  f.window.dispatchEvent(new Event('blur')); expect(listener).toHaveBeenLastCalledWith([]); expect(f.frames.size).toBe(0);
  const reads = f.getGamepads.mock.calls.length; f.tick(); expect(f.getGamepads).toHaveBeenCalledTimes(reads);
  f.window.dispatchEvent(new Event('focus')); expect(f.frames.size).toBe(1);
  f.window.document.hidden = true; f.window.document.dispatchEvent(new Event('visibilitychange'));
  expect(f.hub.getStats().status).toBe('paused'); expect(f.frames.size).toBe(0); expect(listener).toHaveBeenLastCalledWith([]);
  f.window.document.hidden = false; f.window.document.dispatchEvent(new Event('visibilitychange')); expect(f.frames.size).toBe(1);
  f.setPads([]); f.window.dispatchEvent(new Event('gamepaddisconnected')); expect(f.frames.size).toBe(0); off();
});

test('blocked and unsupported APIs publish neutral state without a retry loop', () => {
  const f = fixture(); f.getGamepads.mockImplementation(() => { throw new DOMException('Denied', 'SecurityError'); });
  const listener = jest.fn(); const off = f.hub.subscribe(listener); expect(f.hub.getStats().status).toBe('blocked'); expect(listener).toHaveBeenLastCalledWith([]); expect(f.frames.size).toBe(0); off();
  Object.defineProperty(f.window.navigator, 'getGamepads', { value: undefined });
  const off2 = f.hub.subscribe(listener); expect(f.hub.getStats().status).toBe('unsupported'); expect(f.frames.size).toBe(0); off2();
});

test('throwing consumers do not break later consumers or the next frame', () => {
  const f = fixture(); const log = jest.spyOn(logger, 'error').mockImplementation(() => {}); const b = jest.fn();
  const offA = f.hub.subscribe(() => { throw new Error('consumer'); }); const offB = f.hub.subscribe(b);
  try { f.tick(); expect(b).toHaveBeenCalledTimes(2); expect(f.frames.size).toBe(1); expect(log).toHaveBeenCalledTimes(2); }
  finally { offA(); offB(); log.mockRestore(); }
});

test('replacing the last lease during notification preserves the replacement frame loop', () => {
  const f = fixture(); const replacement = jest.fn(); let replace = false; let off = () => {}; let offNext = () => {};
  off = f.hub.subscribe(() => { if (replace) { off(); offNext = f.hub.subscribe(replacement); } });
  replace = true; f.tick(); expect(f.frames.size).toBe(1); f.tick();
  expect(replacement).toHaveBeenCalledTimes(1); expect(f.hub.getStats()).toMatchObject({ subscribers: 1, pendingFrames: 1 });
  f.tick(); expect(replacement).toHaveBeenCalledTimes(2); offNext(); expect(f.frames.size).toBe(0);
});

test('a blur dispatched inside a consumer is processed without recursive notification', () => {
  const f = fixture(); let blur = false; let calls = 0;
  const off = f.hub.subscribe(() => { calls++; if (blur) { blur = false; f.window.dispatchEvent(new Event('blur')); } });
  blur = true; f.tick(); expect(calls).toBe(2); f.tick(); expect(calls).toBe(3); expect(f.hub.getStats().status).toBe('paused'); expect(f.frames.size).toBe(0); off();
});
