import { createMemoryInputBackend } from '../../../interactions/core/adapter';
import { createKeyboardOwnership } from '../ownership';

test('allows a synchronous backend listener to release the input it just received', () => {
  const backend = createMemoryInputBackend();
  const owner = createKeyboardOwnership(backend);
  const unsubscribe = backend.subscribe?.(({ keyboard }) => {
    if (keyboard.forward) owner.release();
  });
  owner.set('KeyW', 'forward', true);
  expect(backend.getKeyboard().forward).toBe(false);
  expect(owner.isHeld('forward')).toBe(false);
  unsubscribe?.();
});

test('preserves a new owner acquired synchronously while the previous owner releases', () => {
  const backend = createMemoryInputBackend();
  const first = createKeyboardOwnership(backend);
  const next = createKeyboardOwnership(backend);
  first.set('KeyW', 'forward', true);
  const unsubscribe = backend.subscribe?.(({ keyboard }) => {
    if (!keyboard.forward) next.set('button', 'forward', true);
  });
  first.release();
  expect(backend.getKeyboard().forward).toBe(true);
  expect(next.isHeld('forward')).toBe(true);
  unsubscribe?.();
  next.release();
  expect(backend.getKeyboard().forward).toBe(false);
});

test('releases only owned actions and keeps independent adapters isolated', () => {
  const backend = createMemoryInputBackend();
  const otherBackend = createMemoryInputBackend();
  const first = createKeyboardOwnership(backend);
  const second = createKeyboardOwnership(backend);
  const other = createKeyboardOwnership(otherBackend);
  first.set('KeyW', 'forward', true);
  second.set('button', 'rightward', true);
  other.set('KeyW', 'forward', true);
  first.release();
  expect(backend.getKeyboard().forward).toBe(false);
  expect(backend.getKeyboard().rightward).toBe(true);
  expect(otherBackend.getKeyboard().forward).toBe(true);
  second.release();
  other.release();
  expect(backend.getKeyboard().rightward).toBe(false);
  expect(otherBackend.getKeyboard().forward).toBe(false);
});
