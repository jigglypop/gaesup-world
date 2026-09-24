import { setErrorSink } from '../../utils/reportError';
import { AnimationClockLoop } from '../AnimationClockLoop';
import { FixedStepClock } from '../FixedStepClock';

test('headless consumers retain fixed systems without requiring a browser or installing timers', () => {
  const request = globalThis.requestAnimationFrame; const cancel = globalThis.cancelAnimationFrame;
  Reflect.set(globalThis, 'requestAnimationFrame', undefined); Reflect.set(globalThis, 'cancelAnimationFrame', undefined);
  try {
    const clock = new FixedStepClock(); const loop = new AnimationClockLoop(clock); const update = jest.fn();
    clock.addSystem({ id: 'headless', phase: 'simulation', update });
    const release = loop.acquire(); expect(loop.consumerCount).toBe(1); expect(loop.ownerCount).toBe(0);
    clock.stepTicks(60); expect(update).toHaveBeenCalledTimes(60);
    loop.suspend(); loop.resume(); expect(loop.ownerCount).toBe(0);
    release(); expect(loop.consumerCount).toBe(0);
  } finally {
    Reflect.set(globalThis, 'requestAnimationFrame', request); Reflect.set(globalThis, 'cancelAnimationFrame', cancel);
  }
});

function fixture() {
  let nextId = 0;
  const pending = new Map<number, FrameRequestCallback>();
  const clock = new FixedStepClock();
  const loop = new AnimationClockLoop(clock, {
    request: callback => { pending.set(++nextId, callback); return nextId; },
    cancel: id => { pending.delete(id); },
  });
  const frame = (timestamp: number) => {
    const callbacks = [...pending.values()]; pending.clear();
    callbacks.forEach(callback => callback(timestamp));
  };
  const firstPending = () => {
    const callback = [...pending.values()][0];
    if (!callback) throw new Error('Expected a pending animation frame');
    return callback;
  };
  return { clock, loop, frame, pending, firstPending };
}

describe('AnimationClockLoop', () => {
  it('owns one RAF for multiple consumers, including timestamp zero and idempotent releases', () => {
    const { clock, loop, frame, pending } = fixture();
    const a = loop.acquire(); const b = loop.acquire();
    expect(pending.size).toBe(1); expect(loop.consumerCount).toBe(2);
    frame(0); frame(1000 / 60); expect(clock.tick).toBe(1);
    a(); a(); expect(pending.size).toBe(1);
    frame(2000 / 60); expect(clock.tick).toBe(2);
    b(); expect(pending.size).toBe(0); expect(loop.consumerCount).toBe(0);
  });

  it('suspends without losing mounted leases and does not simulate the suspended gap', () => {
    const { clock, loop, frame, pending, firstPending } = fixture();
    const a = loop.acquire(); frame(0); frame(1000 / 60);
    const stale = firstPending();
    loop.suspend(); const b = loop.acquire(); a();
    expect(pending.size).toBe(0); expect(loop.consumerCount).toBe(1);
    loop.resume(); loop.resume(); stale(5000);
    expect(pending.size).toBe(1);
    frame(6000); expect(clock.tick).toBe(1);
    frame(6000 + 1000 / 60); expect(clock.tick).toBe(2);
    b(); expect(pending.size).toBe(0);
  });

  it('ignores stale callbacks and releases after stop/reacquire inside an update', () => {
    const { clock, loop, frame, pending, firstPending } = fixture();
    const releaseOld = loop.acquire(); let releaseNew: (() => void) | undefined;
    clock.addSystem({ id: 'restart', phase: 'simulation', update: () => { loop.stop(); releaseNew = loop.acquire(); } });
    frame(0); const stale = firstPending(); frame(1000 / 60);
    expect(pending.size).toBe(1); expect(loop.consumerCount).toBe(1);
    releaseOld(); stale(100);
    expect(pending.size).toBe(1); expect(clock.tick).toBe(1);
    releaseNew!(); expect(pending.size).toBe(0);
  });

  it('keeps driving the clock when a simulation system fails and reports the failure', () => {
    const { clock, loop, frame, pending } = fixture();
    const reports = jest.fn(); const releaseSink = setErrorSink(reports);
    const remove = clock.addSystem({ id: 'fail', phase: 'simulation', update: () => { throw new Error('failed'); } });
    const release = loop.acquire(); frame(0); expect(() => frame(1000 / 60)).not.toThrow();
    expect(reports).toHaveBeenCalledWith(new Error('failed'), { source: 'clock:simulation', label: 'fail' });
    expect(pending.size).toBe(1); expect(loop.consumerCount).toBe(1);
    remove(); frame(2000 / 60); expect(clock.tick).toBe(2);
    release(); releaseSink();
  });
});
