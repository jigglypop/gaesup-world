import { getDialogRegistry } from '../../dialog/registry/DialogRegistry';
import { logger } from '../logger';

type Definition = { id: string; name: string; nested: { list: string[] } };
type AnyRegistry = {
  register(def: never): void;
  get(id: string): unknown;
  require(id: string): unknown;
  all(): unknown[];
  clear(): void;
};

const REGISTRIES: [string, () => AnyRegistry][] = [['DialogTreeId', getDialogRegistry]];

const definition = (id: string, name = id): Definition => ({ id, name, nested: { list: ['a'] } });

describe.each(REGISTRIES)('%s registry contract', (kind, registryOf) => {
  const registry = registryOf();
  const register = (def: unknown) => registry.register(def as never);
  let warn: jest.SpyInstance;
  beforeEach(() => { warn = jest.spyOn(logger, 'warn').mockImplementation(() => undefined); });
  afterEach(() => { registry.clear(); warn.mockRestore(); });

  test('the first definition stays; the same data again is silent, different data warns', () => {
    register(definition('a', 'first'));
    register(definition('a', 'first'));
    expect(warn).not.toHaveBeenCalled();
    register(definition('a', 'second'));
    expect(warn).toHaveBeenCalledTimes(1);
    expect((registry.require('a') as Definition).name).toBe('first');
    expect(registry.all()).toHaveLength(1);
  });

  test('readers get a deep frozen copy while the caller keeps an editable object', () => {
    const source = definition('b');
    register(source);
    const stored = registry.require('b') as Definition;
    expect(stored).not.toBe(source);
    expect(Object.isFrozen(stored) && Object.isFrozen(stored.nested) && Object.isFrozen(stored.nested.list)).toBe(true);
    source.nested.list.push('b');
    expect(stored.nested.list).toEqual(['a']);
  });

  test('a definition without an id is ignored with a warning and lookups name the id kind', () => {
    register({ ...definition('c'), id: ' ' });
    expect(registry.all()).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(registry.get('missing')).toBeUndefined();
    expect(() => registry.require('missing')).toThrow(`Unknown ${kind}: missing`);
  });
});
