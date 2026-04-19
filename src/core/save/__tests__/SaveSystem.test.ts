import { SaveSystem } from '../core/SaveSystem';
import type { SaveAdapter, SaveBlob } from '../types';

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
});
