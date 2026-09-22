import 'reflect-metadata';

import { logger } from '../../utils/logger';
import { AbstractBridge } from '../bridge/AbstractBridge';
import { LogSnapshot } from '../decorators/bridge';
import { Profile } from '../decorators/monitoring';

type Engine = { value: number; dispose: () => void };
type Snapshot = { value: number };

class ProbeBridge extends AbstractBridge<Engine, Snapshot, { type: 'noop' }> {
  emitted = 0;

  protected override emit(event: Parameters<AbstractBridge<Engine, Snapshot, { type: 'noop' }>['emit']>[0]): void {
    this.emitted++;
    super.emit(event);
  }

  protected buildEngine(_id: string, value: number): Engine {
    return { value, dispose: () => {} };
  }

  protected executeCommand(): void {}

  protected createSnapshot(engine: Engine): Snapshot {
    return { value: engine.value };
  }
}

class Profiled {
  calls = 0;

  @Profile()
  step(): number {
    return ++this.calls;
  }

  @LogSnapshot()
  snapshot(): number {
    return this.calls;
  }
}

afterEach(() => {
  logger.disable();
  logger.setLevel('info');
});

test('snapshots skip building bridge events when nobody observes them', () => {
  const bridge = new ProbeBridge();
  bridge.register('a', 1);
  bridge.emitted = 0;

  expect(bridge.snapshot('a')).toEqual({ value: 1 });
  expect(bridge.emitted).toBe(0);

  const handler = jest.fn();
  const off = bridge.on('snapshot', handler);
  bridge.snapshot('a');
  expect(bridge.emitted).toBe(1);
  expect(handler).toHaveBeenCalledWith(expect.objectContaining({ type: 'snapshot', id: 'a' }));
  off();

  bridge.use((_event, next) => next());
  bridge.snapshot('a');
  expect(bridge.emitted).toBe(2);
});

test('profiling decorators do not time or format messages while log level output is off', () => {
  const now = jest.spyOn(performance, 'now');
  const console = jest.spyOn(globalThis.console, 'log').mockImplementation(() => {});
  const probe = new Profiled();

  logger.enable();
  logger.setLevel('info');
  expect(logger.isEnabled('log')).toBe(false);
  expect(probe.step()).toBe(1);
  expect(probe.snapshot()).toBe(1);
  expect(now).not.toHaveBeenCalled();
  expect(console).not.toHaveBeenCalled();

  logger.setLevel('log');
  expect(probe.step()).toBe(2);
  expect(probe.snapshot()).toBe(2);
  expect(now).toHaveBeenCalled();
  expect(console).toHaveBeenCalledWith(expect.stringContaining('[Profile] Profiled.step executed in'));
  expect(console).toHaveBeenCalledWith(expect.stringContaining('[Profiled] snapshot snapshot processed in'));
});

test('logger.isEnabled follows the enabled flag and level ranking', () => {
  logger.disable();
  expect(logger.isEnabled('error')).toBe(false);
  logger.enable();
  logger.setLevel('warn');
  expect(logger.isEnabled('error')).toBe(true);
  expect(logger.isEnabled('warn')).toBe(true);
  expect(logger.isEnabled('info')).toBe(false);
  expect(logger.isEnabled('log')).toBe(false);
});
