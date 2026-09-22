import type { ToolUseEvent } from '../../types';
import { createToolEvents } from '../ToolEvents';

const event: ToolUseEvent = { kind: 'shovel', origin: [0, 0, 0], direction: [0, 0, 1], range: 2, timestamp: 0 };

test('suspend and immediate restart during a callback cannot continue dispatching the old generation', () => {
  const bus = createToolEvents(); const other = createToolEvents();
  const stale = jest.fn(); const fresh = jest.fn(); const independent = jest.fn();
  bus.on('shovel', () => { bus.suspend(); bus.resume(); bus.on('shovel', fresh); });
  bus.on('shovel', stale); bus.onAny(stale); other.on('shovel', independent);
  bus.emit(event); expect(stale).not.toHaveBeenCalled(); expect(fresh).not.toHaveBeenCalled();
  bus.emit(event); other.emit(event);
  expect(fresh).toHaveBeenCalledTimes(1); expect(independent).toHaveBeenCalledTimes(1);
});

test('kind listeners added during dispatch begin with the next event', () => {
  const bus = createToolEvents(); const late = jest.fn();
  bus.on('shovel', () => { bus.on('shovel', late); });
  bus.emit(event); expect(late).not.toHaveBeenCalled();
  bus.emit(event); expect(late).toHaveBeenCalledTimes(1);
});

test('duplicate subscriptions retain their last owner and stale global cleanup cannot remove a new generation', () => {
  const bus = createToolEvents(); const handler = jest.fn();
  const first = bus.on('shovel', handler); const second = bus.on('shovel', handler);
  first(); first(); bus.emit(event); expect(handler).toHaveBeenCalledTimes(1);
  second(); bus.emit(event); expect(handler).toHaveBeenCalledTimes(1);
  const stale = bus.onAny(handler); bus.suspend(); bus.resume(); bus.onAny(handler);
  stale(); bus.emit(event); expect(handler).toHaveBeenCalledTimes(2);
});
