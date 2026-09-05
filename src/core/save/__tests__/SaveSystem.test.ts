import { SaveSystem } from '../core/SaveSystem';
import type { SaveAdapter, SaveBlob, SaveDiagnostic } from '../types';

class MemoryAdapter implements SaveAdapter {
  private map = new Map<string, SaveBlob>();
  async read(slot: string) { return this.map.get(slot) ?? null; }
  async write(slot: string, blob: SaveBlob) { this.map.set(slot, JSON.parse(JSON.stringify(blob))); }
  async list() { return Array.from(this.map.keys()); }
  async remove(slot: string) { this.map.delete(slot); }
}

describe('SaveSystem', () => {
  test('serializes writes to one slot using snapshots captured when save was called', async () => {
    const adapter = new MemoryAdapter();
    const originalWrite = adapter.write.bind(adapter);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const write = jest.spyOn(adapter, 'write').mockImplementationOnce(async (slot, blob) => {
      await gate;
      await originalWrite(slot, blob);
    });
    const sys = new SaveSystem({ adapter });
    let value = 1;
    sys.register({ key: 'world', serialize: () => value, hydrate: () => {} });
    const first = sys.save();
    value = 2;
    const second = sys.save();
    value = 3;
    await Promise.resolve();
    expect(write).toHaveBeenCalledTimes(1);
    release();
    await Promise.all([first, second]);
    expect((await adapter.read('main'))?.domains.world).toBe(2);
    await sys.save();
    expect((await adapter.read('main'))?.domains.world).toBe(3);
  });

  test.each(['save', 'remove'] as const)('orders a pending %s before the next mutation of the same slot', async (operation) => {
    const adapter = new MemoryAdapter();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const originalWrite = adapter.write.bind(adapter);
    const originalRemove = adapter.remove.bind(adapter);
    const write = jest.spyOn(adapter, 'write');
    const remove = jest.spyOn(adapter, 'remove');
    if (operation === 'save') write.mockImplementationOnce(async (slot, blob) => {
      await gate;
      await originalWrite(slot, blob);
    });
    else remove.mockImplementationOnce(async (slot) => {
      await gate;
      await originalRemove(slot);
    });
    const sys = new SaveSystem({ adapter });
    const first = operation === 'save' ? sys.save() : sys.remove();
    const second = operation === 'save' ? sys.remove() : sys.save();
    await Promise.resolve();
    expect(operation === 'save' ? remove : write).not.toHaveBeenCalled();
    release();
    await Promise.all([first, second]);
    expect((await adapter.read('main')) !== null).toBe(operation === 'remove');
  });

  test.each(['save', 'remove'] as const)('a failed %s does not block later writes or independent slots', async (operation) => {
    const adapter = new MemoryAdapter();
    let reject!: (error: Error) => void;
    const gate = new Promise<void>((_resolve, fail) => { reject = fail; });
    jest.spyOn(adapter, operation === 'save' ? 'write' : 'remove').mockReturnValueOnce(gate);
    const sys = new SaveSystem({ adapter });
    const first = operation === 'save' ? sys.save() : sys.remove();
    const failed = expect(first).rejects.toThrow('storage failed');
    const second = sys.save();
    await sys.save('other');
    expect(await adapter.read('other')).not.toBeNull();
    expect(await adapter.read('main')).toBeNull();
    reject(new Error('storage failed'));
    await failed;
    await second;
    expect(await adapter.read('main')).not.toBeNull();
  });

  test('does not briefly apply an older read while a newer request is pending', async () => {
    const adapter = new MemoryAdapter();
    let resolveOlder!: (blob: SaveBlob) => void;
    let resolveNewer!: (blob: SaveBlob) => void;
    jest.spyOn(adapter, 'read')
      .mockReturnValueOnce(new Promise<SaveBlob>((resolve) => { resolveOlder = resolve; }))
      .mockReturnValueOnce(new Promise<SaveBlob>((resolve) => { resolveNewer = resolve; }));
    const sys = new SaveSystem({ adapter });
    const hydrate = jest.fn();
    sys.register({ key: 'world', serialize: () => null, hydrate });
    const older = sys.load('older');
    const newer = sys.load('newer');
    resolveOlder({ version: 1, savedAt: 0, domains: { world: 'older' } });
    expect(await older).toBe(false);
    expect(hydrate).not.toHaveBeenCalled();
    resolveNewer({ version: 1, savedAt: 1, domains: { world: 'newer' } });
    expect(await newer).toBe(true);
    expect(hydrate).toHaveBeenCalledTimes(1);
    expect(hydrate).toHaveBeenCalledWith('newer');
  });

  test.each(['load', 'hydrate', 'missing', 'failed', 'aborted'] as const)('a newer %s prevents an older read from restoring stale state', async (operation) => {
    const adapter = new MemoryAdapter();
    let resolveOlder!: (blob: SaveBlob) => void;
    const olderRead = new Promise<SaveBlob>((resolve) => { resolveOlder = resolve; });
    const read = jest.spyOn(adapter, 'read').mockReturnValueOnce(olderRead);
    const sys = new SaveSystem({ adapter });
    const hydrate = jest.fn();
    sys.register({ key: 'world', serialize: () => null, hydrate });
    const older = sys.load('older');
    const newer: SaveBlob = { version: 1, savedAt: 2, domains: { world: 'newer' } };
    if (operation === 'hydrate') sys.hydrateBlob(newer);
    else if (operation === 'failed') {
      read.mockRejectedValueOnce(new Error('read failed'));
      await expect(sys.load('newer')).rejects.toThrow('read failed');
    } else if (operation === 'aborted') {
      const controller = new AbortController();
      read.mockResolvedValueOnce(newer);
      const pending = sys.load('newer', controller.signal);
      controller.abort();
      expect(await pending).toBe(false);
    } else {
      read.mockResolvedValueOnce(operation === 'missing' ? null : newer);
      expect(await sys.load('newer')).toBe(operation === 'load');
    }
    resolveOlder({ version: 1, savedAt: 1, domains: { world: 'older' } });
    expect(await older).toBe(false);
    if (operation === 'load' || operation === 'hydrate') {
      expect(hydrate).toHaveBeenCalledTimes(1);
      expect(hydrate).toHaveBeenCalledWith('newer');
    } else expect(hydrate).not.toHaveBeenCalled();
    read.mockResolvedValueOnce(newer);
    expect(await sys.load('retry')).toBe(true);
  });

  test('a request cancelled before it starts does not supersede an active load', async () => {
    const adapter = new MemoryAdapter();
    let resolve!: (blob: SaveBlob) => void;
    const read = jest.spyOn(adapter, 'read').mockReturnValue(new Promise<SaveBlob>((done) => { resolve = done; }));
    const sys = new SaveSystem({ adapter });
    const hydrate = jest.fn();
    sys.register({ key: 'world', serialize: () => null, hydrate });
    const pending = sys.load();
    const controller = new AbortController();
    controller.abort();
    expect(await sys.load('cancelled', controller.signal)).toBe(false);
    resolve({ version: 1, savedAt: 0, domains: { world: 'active' } });
    expect(await pending).toBe(true);
    expect(read).toHaveBeenCalledTimes(1);
    expect(hydrate).toHaveBeenCalledWith('active');
  });

  test.each(['serialize', 'prepare', 'apply'])('rejects reentrant save/load during %s and releases ownership afterwards', async (phase) => {
    const adapter = new MemoryAdapter();
    const read = jest.spyOn(adapter, 'read');
    const write = jest.spyOn(adapter, 'write');
    const sys = new SaveSystem({ adapter });
    const pending: Promise<unknown>[] = [];
    let reenter = true;
    const blob: SaveBlob = { version: 1, savedAt: 0, domains: { first: 1, second: 2 } };
    const attempt = () => {
      if (!reenter) return;
      reenter = false;
      expect(() => sys.createBlob()).toThrow('Save operation already in progress');
      expect(() => sys.hydrateBlob(blob)).toThrow('Save operation already in progress');
      pending.push(expect(sys.save()).rejects.toThrow('Save operation already in progress'));
      pending.push(expect(sys.load()).rejects.toThrow('Save operation already in progress'));
    };
    let first = 0;
    let second = 0;
    sys.register({ key: 'first', serialize: () => { if (phase === 'serialize') attempt(); return first; },
      hydrate: () => {}, prepareHydrate: () => {
        if (phase === 'prepare') attempt();
        return () => { first = 1; if (phase === 'apply') attempt(); };
      } });
    sys.register({ key: 'second', serialize: () => second, hydrate: () => { second = 2; } });
    if (phase === 'serialize') sys.createBlob();
    else sys.hydrateBlob(blob);
    await Promise.all(pending);
    expect(pending).toHaveLength(2);
    expect(read).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
    await sys.save('after');
    expect(write).toHaveBeenCalledTimes(1);
    expect(write.mock.calls[0]?.[1].domains).toEqual({ first, second });
  });

  test('listener failures preserve original domain errors and do not prevent later diagnostics or recovery', () => {
    const sys = new SaveSystem({ adapter: new MemoryAdapter() });
    const original = new Error('invalid data');
    sys.subscribeDiagnostics(() => { throw new Error('observer failure'); });
    const observer = jest.fn();
    sys.subscribeDiagnostics(observer);
    const unregister = sys.register({ key: 'broken', serialize: () => null, hydrate: () => {},
      prepareHydrate: () => { throw original; } });
    try {
      sys.hydrateBlob({ version: 1, savedAt: 0, domains: {} });
      throw new Error('Expected hydration failure');
    } catch (error) {
      expect(error).toBeInstanceOf(AggregateError);
      expect((error as AggregateError).errors).toEqual([original]);
    }
    expect(observer).toHaveBeenCalledWith(expect.objectContaining({ key: 'broken', error: original }));
    unregister();
    expect(sys.hydrateBlob({ version: 1, savedAt: 0, domains: {} })).toBe(true);
    expect(sys.createBlob().domains).toEqual({});
  });

  test.each([
    null,
    [],
    { version: 1, savedAt: 0 },
    { version: 1, savedAt: 0, domains: null },
    { version: 1, savedAt: 0, domains: [] },
    { version: 1, savedAt: 0, domains: 'invalid' },
    { version: 1, savedAt: -1, domains: {} },
    { version: 1, savedAt: Infinity, domains: {} },
    { version: 1, domains: {} },
  ])('rejects malformed saved envelopes before calling any domain: %j', (raw) => {
    const sys = new SaveSystem({ adapter: new MemoryAdapter() });
    const hydrate = jest.fn();
    sys.register({ key: 'world', serialize: () => ({ intact: true }), hydrate });
    expect(() => sys.hydrateBlob(raw as unknown as SaveBlob)).toThrow('Invalid save data envelope');
    expect(hydrate).not.toHaveBeenCalled();
  });

  test('rejects a malformed migration result before hydration', () => {
    const sys = new SaveSystem({
      adapter: new MemoryAdapter(), currentVersion: 2,
      migrations: { 1: blob => ({ ...blob, version: 2, domains: null } as unknown as SaveBlob) },
    });
    const hydrate = jest.fn();
    sys.register({ key: 'world', serialize: () => ({ intact: true }), hydrate });
    expect(() => sys.hydrateBlob({ version: 1, savedAt: 0, domains: {} })).toThrow('Invalid save data envelope');
    expect(hydrate).not.toHaveBeenCalled();
  });

  test('an already aborted load skips storage and hydration', async () => {
    const adapter = new MemoryAdapter();
    const read = jest.spyOn(adapter, 'read');
    const sys = new SaveSystem({ adapter });
    const controller = new AbortController();
    controller.abort();

    expect(await sys.load('main', controller.signal)).toBe(false);
    expect(read).not.toHaveBeenCalled();
  });

  test.each([0, NaN, 1.5, 4])('rejects unsupported version %s without hydrating', (version) => {
    const sys = new SaveSystem({ adapter: new MemoryAdapter(), currentVersion: 3 });
    const hydrate = jest.fn();
    sys.register({ key: 'x', serialize: () => null, hydrate });
    expect(() => sys.hydrateBlob({ version, savedAt: 0, domains: {} })).toThrow('Unsupported save version');
    expect(hydrate).not.toHaveBeenCalled();
  });

  test.each([undefined, 1, 4])('rejects missing or invalid migration output %s before hydration', (nextVersion) => {
    const sys = new SaveSystem({
      adapter: new MemoryAdapter(), currentVersion: 3,
      migrations: nextVersion === undefined ? {} : { 1: blob => ({ ...blob, version: nextVersion }) },
    });
    const hydrate = jest.fn();
    sys.register({ key: 'x', serialize: () => null, hydrate });
    expect(() => sys.hydrateBlob({ version: 1, savedAt: 0, domains: {} })).toThrow(/migration/);
    expect(hydrate).not.toHaveBeenCalled();
  });

  test('serialize / hydrate round-trip across multiple domains', async () => {
    const adapter = new MemoryAdapter();
    const sys = new SaveSystem({ adapter, currentVersion: 1 });

    let counter = 5;
    let label = 'hello';

    sys.register({
      key: 'counter',
      serialize: () => ({ value: counter }),
      hydrate: (d) => { if (d && typeof (d as { value?: unknown }).value === 'number') counter = (d as { value: number }).value; },
    });
    sys.register({
      key: 'label',
      serialize: () => ({ text: label }),
      hydrate: (d) => { if (d && typeof (d as { text?: unknown }).text === 'string') label = (d as { text: string }).text; },
    });

    await sys.save('s');
    counter = 0;
    label = 'lost';

    const ok = await sys.load('s');
    expect(ok).toBe(true);
    expect(counter).toBe(5);
    expect(label).toBe('hello');
  });

  test('load returns false when slot missing', async () => {
    const sys = new SaveSystem({ adapter: new MemoryAdapter() });
    const ok = await sys.load('nope');
    expect(ok).toBe(false);
  });

  test('migrations chain bumps version blob', async () => {
    const adapter = new MemoryAdapter();
    await adapter.write('m', { version: 1, savedAt: 0, domains: { x: { v: 1 } } });
    const sys = new SaveSystem({
      adapter,
      currentVersion: 3,
      migrations: {
        1: (b) => ({ ...b, version: 2, domains: { x: { v: 2 } } }),
        2: (b) => ({ ...b, version: 3, domains: { x: { v: 3 } } }),
      },
    });
    let received: unknown = null;
    sys.register({ key: 'x', serialize: () => null, hydrate: (d) => { received = d; } });
    await sys.load('m');
    expect(received).toEqual({ v: 3 });
  });

  test('creates and hydrates save blobs without adapter IO', () => {
    const diagnostics: SaveDiagnostic[] = [];
    const sys = new SaveSystem({
      adapter: new MemoryAdapter(),
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    });
    let value = 3;

    sys.register({
      key: 'counter',
      serialize: () => ({ value }),
      hydrate: (data) => {
        if (data && typeof data === 'object' && 'value' in data) {
          value = Number((data as { value: unknown }).value);
        }
      },
    });

    const blob = sys.createBlob('file-slot');
    value = 0;
    const ok = sys.hydrateBlob(blob, 'file-slot');

    expect(ok).toBe(true);
    expect(value).toBe(3);
    expect(blob).toEqual(expect.objectContaining({
      version: 1,
      domains: {
        counter: { value: 3 },
      },
    }));
    expect(diagnostics).toEqual([]);
  });

  test('preserves the previous save and reports serialization failures', async () => {
    const adapter = new MemoryAdapter();
    const previous: SaveBlob = { version: 1, savedAt: 1, domains: { healthy: { value: 42 } } };
    await adapter.write('diagnostic-slot', previous);
    const diagnostics: SaveDiagnostic[] = [];
    const sys = new SaveSystem({
      adapter,
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    });

    sys.register({
      key: 'broken',
      serialize: () => { throw new Error('serialize failed'); },
      hydrate: () => undefined,
    });
    sys.register({
      key: 'healthy',
      serialize: () => ({ ok: true }),
      hydrate: () => undefined,
    });

    await expect(sys.save('diagnostic-slot')).rejects.toThrow('Save serialization failed');

    expect(await adapter.read('diagnostic-slot')).toEqual(previous);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({
      phase: 'serialize',
      key: 'broken',
      slot: 'diagnostic-slot',
    });
    expect(diagnostics[0]?.error).toBeInstanceOf(Error);
  });

  test('allows diagnostics to be subscribed after construction', async () => {
    const adapter = new MemoryAdapter();
    const sys = new SaveSystem({ adapter });
    const diagnostics: SaveDiagnostic[] = [];
    const unsubscribe = sys.subscribeDiagnostics((diagnostic) => diagnostics.push(diagnostic));

    sys.register({
      key: 'broken',
      serialize: () => { throw new Error('first failure'); },
      hydrate: () => undefined,
    });

    await expect(sys.save('diagnostic-slot')).rejects.toThrow('Save serialization failed');
    unsubscribe();
    await expect(sys.save('diagnostic-slot')).rejects.toThrow('Save serialization failed');

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({
      phase: 'serialize',
      key: 'broken',
      slot: 'diagnostic-slot',
    });
  });

  test('rejects duplicate domain bindings and keeps unregister ownership scoped', () => {
    const sys = new SaveSystem({ adapter: new MemoryAdapter() });
    const unregister = sys.register({
      key: 'profile',
      serialize: () => ({ name: 'first' }),
      hydrate: () => undefined,
    });

    expect(() => sys.register({
      key: 'profile',
      serialize: () => ({ name: 'second' }),
      hydrate: () => undefined,
    })).toThrow('Save domain "profile" is already registered.');

    unregister();
    expect(sys.has('profile')).toBe(false);

    const unregisterNext = sys.register({
      key: 'profile',
      serialize: () => ({ name: 'next' }),
      hydrate: () => undefined,
    });
    unregister();

    expect(sys.has('profile')).toBe(true);
    unregisterNext();
    expect(sys.has('profile')).toBe(false);
  });

  test('reports hydrate failures without blocking other domains', async () => {
    const adapter = new MemoryAdapter();
    const diagnostics: SaveDiagnostic[] = [];
    await adapter.write('diagnostic-slot', {
      version: 1,
      savedAt: 0,
      domains: {
        broken: { value: 1 },
        healthy: { value: 2 },
      },
    });
    const sys = new SaveSystem({
      adapter,
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    });
    let healthy = 0;

    sys.register({
      key: 'broken',
      serialize: () => null,
      hydrate: () => { throw new Error('hydrate failed'); },
    });
    sys.register({
      key: 'healthy',
      serialize: () => null,
      hydrate: (data) => {
        if (data && typeof data === 'object' && 'value' in data) {
          healthy = Number((data as { value: unknown }).value);
        }
      },
    });

    await expect(sys.load('diagnostic-slot')).rejects.toThrow('Save hydration failed');
    expect(healthy).toBe(2);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({
      phase: 'hydrate',
      key: 'broken',
      slot: 'diagnostic-slot',
    });
    expect(diagnostics[0]?.error).toBeInstanceOf(Error);
  });
});
