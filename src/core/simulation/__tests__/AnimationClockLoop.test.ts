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
  return { clock, loop, frame, pending };
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
    const { clock, loop, frame, pending } = fixture();
    const a = loop.acquire(); frame(0); frame(1000 / 60);
    const stale = [...pending.values()][0];
    loop.suspend(); const b = loop.acquire(); a();
    expect(pending.size).toBe(0); expect(loop.consumerCount).toBe(1);
    loop.resume(); loop.resume(); stale(5000);
    expect(pending.size).toBe(1);
    frame(6000); expect(clock.tick).toBe(1);
    frame(6000 + 1000 / 60); expect(clock.tick).toBe(2);
    b(); expect(pending.size).toBe(0);
  });

  it('ignores stale callbacks and releases after stop/reacquire inside an update', () => {
    const { clock, loop, frame, pending } = fixture();
    const releaseOld = loop.acquire(); let releaseNew: (() => void) | undefined;
    clock.addSystem({ id: 'restart', phase: 'simulation', update: () => { loop.stop(); releaseNew = loop.acquire(); } });
    frame(0); const stale = [...pending.values()][0]; frame(1000 / 60);
    expect(pending.size).toBe(1); expect(loop.consumerCount).toBe(1);
    releaseOld(); stale(100);
    expect(pending.size).toBe(1); expect(clock.tick).toBe(1);
    releaseNew!(); expect(pending.size).toBe(0);
  });

  it('cancels the driver on simulation failure and allows explicit recovery', () => {
    const { clock, loop, frame, pending } = fixture();
    const remove = clock.addSystem({ id: 'fail', phase: 'simulation', update: () => { throw new Error('failed'); } });
    loop.acquire(); frame(0); expect(() => frame(1000 / 60)).toThrow('failed');
    expect(pending.size).toBe(0); expect(loop.consumerCount).toBe(0);
    remove(); const release = loop.acquire(); frame(1000); frame(1000 + 1000 / 60);
    expect(clock.tick).toBe(2); release();
  });
});
