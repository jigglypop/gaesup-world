import { createSharedObserver } from '../sharedObserver';
import { logger } from '../../utils/logger';

test('one source/target pair has one subscription with independent leases and live activity gates', () => {
  let emit!: (value: number) => void; let active!: () => boolean; const stop = jest.fn(); const connect = jest.fn((_a: object, _b: object, controls: { emit: typeof emit; active: typeof active }) => { emit = controls.emit; active = controls.active; return stop; });
  const acquire = createSharedObserver(connect); const source = {}; const target = {}; let enabled = false; const first = jest.fn(); const second = jest.fn();
  const off = acquire(source, target, { active: () => enabled, notify: first }); const off2 = acquire(source, target, { active: () => true, notify: second });
  expect(connect).toHaveBeenCalledTimes(1); expect(active()).toBe(true); emit(1); expect(first).not.toHaveBeenCalled(); expect(second).toHaveBeenCalledWith(1);
  enabled = true; off2(); emit(2); expect(first).toHaveBeenCalledWith(2); expect(stop).not.toHaveBeenCalled(); off(); off(); expect(stop).toHaveBeenCalledTimes(1); emit(3); expect(first).toHaveBeenCalledTimes(1);
  const restarted = acquire(source, target, { active: () => true }); expect(connect).toHaveBeenCalledTimes(2); restarted(); expect(stop).toHaveBeenCalledTimes(2);
});

test('callbacks are delivered in transition order under reentry and one failure does not skip another owner', () => {
  let emit!: (value: number) => void; const acquire = createSharedObserver<object, object, number>((_a, _b, controls) => { emit = controls.emit; return () => {}; });
  const source = {}; const target = {}; const order: string[] = []; const log = jest.spyOn(logger, 'error').mockImplementation(() => {});
  const a = acquire(source, target, { active: () => true, notify: value => { order.push(`a${value}`); if (value === 1) { emit(2); throw new Error('consumer'); } } });
  const b = acquire(source, target, { active: () => true, notify: value => { order.push(`b${value}`); } });
  try { emit(1); expect(order).toEqual(['a1', 'b1', 'a2', 'b2']); expect(log).toHaveBeenCalledTimes(1); } finally { a(); b(); log.mockRestore(); }
});

test('a removed listener and replaced connection cannot receive stale notifications or stale cleanup', () => {
  const emitters: Array<(value: number) => void> = []; const source = {}; const target = {}; const stop = jest.fn();
  const acquire = createSharedObserver<object, object, number>((_a, _b, controls) => { emitters.push(controls.emit); return stop; });
  const seen = jest.fn(); let b = () => {}; const a = acquire(source, target, { active: () => true, notify: () => b() }); b = acquire(source, target, { active: () => true, notify: seen });
  emitters[0]!(1); expect(seen).not.toHaveBeenCalled(); a(); const newer = acquire(source, target, { active: () => true, notify: seen }); a(); b(); emitters[0]!(2); expect(seen).not.toHaveBeenCalled(); emitters[1]!(3); expect(seen).toHaveBeenCalledWith(3); newer(); expect(stop).toHaveBeenCalledTimes(2);
});

test('failed connection and throwing teardown do not poison a later acquisition', () => {
  const source = {}; const target = {}; let fail = true;
  const acquire = createSharedObserver<object, object>(() => { if (fail) throw new Error('connect'); return () => { throw new Error('stop'); }; });
  expect(() => acquire(source, target, { active: () => true })).toThrow('connect'); fail = false;
  const off = acquire(source, target, { active: () => true }); expect(off).toThrow('stop'); expect(off).not.toThrow(); const again = acquire(source, target, { active: () => true }); expect(again).toThrow('stop');
});

test('a newly mounted callback does not receive transitions queued before its registration', () => {
  let emit!: (value: number) => void; const source = {}; const target = {}; let offLater = () => {}; const later = jest.fn();
  const acquire = createSharedObserver<object, object, number>((_a, _b, controls) => { emit = controls.emit; return () => {}; });
  const off = acquire(source, target, { active: () => true, notify: value => { if (value === 1) { emit(2); offLater = acquire(source, target, { active: () => true, notify: later }); } } });
  try { emit(1); expect(later).not.toHaveBeenCalled(); emit(3); expect(later).toHaveBeenCalledTimes(1); expect(later).toHaveBeenCalledWith(3); } finally { off(); offLater(); }
});
