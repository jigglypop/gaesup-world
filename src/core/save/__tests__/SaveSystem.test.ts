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

  test('reports serialize failures without blocking other domains', async () => {
    const adapter = new MemoryAdapter();
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

    await sys.save('diagnostic-slot');

    const saved = await adapter.read('diagnostic-slot');
    expect(saved?.domains).toEqual({
      broken: null,
      healthy: { ok: true },
    });
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

    await sys.save('diagnostic-slot');
    unsubscribe();
    await sys.save('diagnostic-slot');

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

    const ok = await sys.load('diagnostic-slot');

    expect(ok).toBe(true);
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
