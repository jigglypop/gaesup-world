import { createKeyboardOwnership } from '../../hooks/useKeyboard/ownership';
import { createMemoryInputBackend } from '../../interactions/core/adapter';
import { logger } from '../../utils/logger';

test('release preserves leases created reentrantly by a key-up observer', () => {
  const backend = createMemoryInputBackend(); const ownership = createKeyboardOwnership(backend);
  ownership.set('old-a', 'space', true); ownership.set('old-b', 'keyE', true);
  let released = false; const off = backend.subscribe!(() => { if (!backend.getKeyboard().space && !released) { released = true; ownership.set('new-a', 'space', true); ownership.set('new-b', 'keyE', true); } });
  try { ownership.release(); expect(backend.getKeyboard().space).toBe(true); expect(backend.getKeyboard().keyE).toBe(true); ownership.release(); expect(backend.getKeyboard().space).toBe(false); expect(backend.getKeyboard().keyE).toBe(false); }
  finally { off(); ownership.release(); }
});

test('a failed key-up write does not retain leases or skip releasing other keys', () => {
  const backend = createMemoryInputBackend(); const ownership = createKeyboardOwnership(backend); const next = createKeyboardOwnership(backend);
  const log = jest.spyOn(logger, 'error').mockImplementation(() => {}); const update = backend.updateKeyboard;
  ownership.set('a', 'space', true); ownership.set('b', 'keyE', true);
  backend.updateKeyboard = input => { if (input.space === false) throw new Error('key-up'); update(input); };
  try { expect(() => ownership.release()).not.toThrow(); expect(backend.getKeyboard().keyE).toBe(false); expect(log).toHaveBeenCalledTimes(1); backend.updateKeyboard = update; next.set('new', 'space', true); next.release(); expect(backend.getKeyboard().space).toBe(false); }
  finally { backend.updateKeyboard = update; ownership.release(); next.release(); log.mockRestore(); }
});
