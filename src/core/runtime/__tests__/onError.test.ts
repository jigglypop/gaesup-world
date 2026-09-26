import { reportError } from '../../utils/reportError';
import { createGaesupRuntime } from '../createGaesupRuntime';

const throwingSystem = (id: string) => ({ id, phase: 'simulation' as const, update: () => { throw new Error(id); } });

test('onError receives errors from its own boundaries from setup until dispose completes', async () => {
  const onError = jest.fn();
  const runtime = createGaesupRuntime({ onError });
  const events = runtime.plugins.context.events;
  events.on('boom', () => { throw new Error('handler'); });

  events.emit('boom', null);
  expect(onError).not.toHaveBeenCalled();

  await runtime.setup();
  events.emit('boom', null);
  expect(onError).toHaveBeenLastCalledWith(new Error('handler'), { source: 'event-bus', label: 'boom' });
  runtime.clockLoop.clock.addSystem(throwingSystem('clock-boom'));
  runtime.clockLoop.clock.stepTicks(1);
  expect(onError).toHaveBeenLastCalledWith(new Error('clock-boom'), { source: 'clock:simulation', label: 'clock-boom' });
  expect(runtime.save.reportError).toBe(runtime.reportError);
  // A boundary no runtime owns reports to the page default, not to whichever runtime was set up last.
  reportError(new Error('page'), { source: 'test' });
  expect(onError).toHaveBeenCalledTimes(2);

  await runtime.dispose();
  runtime.reportError(new Error('late'), { source: 'test' });
  expect(onError).toHaveBeenCalledTimes(2);
});

test('each runtime keeps its handler, and disposal in setup order never reinstates a disposed one', async () => {
  const onErrorA = jest.fn();
  const onErrorB = jest.fn();
  const a = createGaesupRuntime({ onError: onErrorA });
  const b = createGaesupRuntime({ onError: onErrorB });
  await a.setup();
  await b.setup();
  a.reportError(new Error('a'), { source: 'test' });
  b.reportError(new Error('b'), { source: 'test' });
  expect(onErrorA.mock.calls.map(([error]) => (error as Error).message)).toEqual(['a']);
  expect(onErrorB.mock.calls.map(([error]) => (error as Error).message)).toEqual(['b']);

  await a.dispose();
  await b.dispose();
  reportError(new Error('page'), { source: 'test' });
  a.reportError(new Error('late a'), { source: 'test' });
  b.reportError(new Error('late b'), { source: 'test' });
  expect(onErrorA).toHaveBeenCalledTimes(1);
  expect(onErrorB).toHaveBeenCalledTimes(1);
});
