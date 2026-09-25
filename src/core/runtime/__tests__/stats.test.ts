import { createGaesupRuntime } from '../createGaesupRuntime';

test('runtime.stats counts fixed ticks since reset without a canvas', async () => {
  const runtime = createGaesupRuntime();
  try {
    runtime.clockLoop.clock.stepTicks(2);
    runtime.stats.reset();
    runtime.clockLoop.clock.stepTicks(3);
    const snapshot = runtime.stats.snapshot();
    expect(snapshot['fixedTicks']).toBe(3);
    expect(snapshot['clockSystems']).toBe(runtime.clockLoop.clock.systemCount);
  } finally {
    await runtime.dispose();
  }
});
