import { FixedStepClock } from '../FixedStepClock';

describe('FixedStepClock', () => {
  it('produces identical tick-stamped simulation and command order at 30/60/144 Hz and headless', () => {
    function run(rate?: number) {
      const clock = new FixedStepClock();
      const trace: number[] = [];
      let velocity = 1; let position = 0;
      clock.addSystem({ id: 'publish', phase: 'publish', update: tick => { trace.push(tick.tick, position); } });
      clock.addSystem({ id: 'move', phase: 'simulation', update: tick => { position += velocity * tick.deltaSeconds; } });
      clock.addSystem({ id: 'input', phase: 'commands', update: tick => { if (tick.tick === 30) velocity = -2; } });
      if (rate) for (let i = 0; i < rate * 3; i++) clock.advance(1 / rate);
      else clock.stepTicks(180);
      expect(clock.tick).toBe(180);
      expect(clock.elapsedSeconds).toBe(3);
      expect(clock.deferredSeconds).toBeCloseTo(0);
      return trace;
    }
    const replay = run();
    for (const rate of [30, 60, 144]) expect(run(rate)).toEqual(replay);
  });

  it('shares the same owner while rejecting conflicting IDs and makes release idempotent', () => {
    const clock = new FixedStepClock(); const owner = {}; const update = jest.fn();
    const system = { id: 'network', phase: 'publish' as const, update };
    const first = clock.acquireSystem(system, owner); const second = clock.acquireSystem(system, owner);
    expect(() => clock.addSystem(system)).toThrow('already registered');
    clock.stepTicks(); expect(update).toHaveBeenCalledTimes(1);
    first(); first(); clock.stepTicks(); expect(update).toHaveBeenCalledTimes(2);
    second(); expect(clock.systemCount).toBe(0);
    clock.stepTicks(); expect(update).toHaveBeenCalledTimes(2);
  });

  it('honors phase/priority order, immediate removal, and next-tick registration', () => {
    const clock = new FixedStepClock(); const trace: string[] = [];
    const remove = clock.addSystem({ id: 'removed', phase: 'publish', update: () => trace.push('removed') });
    clock.addSystem({ id: 'early', phase: 'simulation', priority: -1, update: () => trace.push('early') });
    clock.addSystem({ id: 'first', phase: 'simulation', update: tick => {
      trace.push('first'); remove();
      if (tick.tick === 1) clock.addSystem({ id: 'new', phase: 'commands', update: () => trace.push('new') });
    } });
    clock.addSystem({ id: 'second', phase: 'simulation', update: () => trace.push('second') });
    clock.stepTicks(2);
    expect(trace).toEqual(['early', 'first', 'second', 'new', 'early', 'first', 'second']);
  });

  it('bounds work, reports discarded suspension time, and preserves deferred ticks', () => {
    const clock = new FixedStepClock({ tickRate: 100, maxSubSteps: 2, maxFrameSeconds: 0.1 });
    expect(clock.advance(1)).toBe(2);
    expect(clock.discardedSeconds).toBeCloseTo(0.9);
    expect(clock.deferredSeconds).toBeCloseTo(0.08);
    expect(clock.interpolationAlpha).toBe(1);
    for (let i = 0; i < 4; i++) expect(clock.advance(0)).toBe(2);
    expect(clock.tick).toBe(10);
    expect(clock.deferredSeconds).toBeCloseTo(0);
    clock.advance(0.005); expect(clock.interpolationAlpha).toBeCloseTo(0.5);
  });

  it('rejects reentrant advancement and surfaces failures without leaving the clock locked', () => {
    const clock = new FixedStepClock(); const error = new Error('simulation failed');
    const remove = clock.addSystem({ id: 'fail', phase: 'simulation', update: () => {
      expect(() => clock.advance(0)).toThrow('not reentrant');
      expect(() => clock.stepTicks()).toThrow('not reentrant');
      throw error;
    } });
    expect(() => clock.advance(1 / 60)).toThrow(error);
    remove(); expect(() => clock.stepTicks()).not.toThrow();
    expect(clock.tick).toBe(2);
  });

  it('rejects nonfinite durations and impossible configurations', () => {
    for (const tickRate of [0, -1, Infinity, NaN, Number.MIN_VALUE]) expect(() => new FixedStepClock({ tickRate })).toThrow(RangeError);
    const clock = new FixedStepClock();
    for (const duration of [-1, NaN, Infinity]) expect(() => clock.advance(duration)).toThrow(RangeError);
    for (const count of [-1, 0.5, Infinity]) expect(() => clock.stepTicks(count)).toThrow(RangeError);
  });
});
