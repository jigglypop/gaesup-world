import {
  WORLD_SNAPSHOT_DOMAINS,
  createPlayerProgressFromSaveSystem,
  createWorldSnapshotFromSaveSystem,
} from '../snapshot';
import { SaveSystem } from '../../save';
import type { SaveAdapter, SaveBlob } from '../../save';

class MemoryAdapter implements SaveAdapter {
  async read(_slot: string) {
    return null;
  }

  async write(_slot: string, _blob: SaveBlob) {
    return undefined;
  }

  async list() {
    return [];
  }

  async remove(_slot: string) {
    return undefined;
  }
}

describe('platform snapshots', () => {
  it('treats camera as a world snapshot domain', () => {
    expect(WORLD_SNAPSHOT_DOMAINS).toContain('camera');
  });

  it('creates world snapshots from SaveSystem bindings', () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    save.register({
      key: 'building',
      serialize: () => ({ blocks: 2 }),
      hydrate: () => undefined,
    });
    save.register({
      key: 'camera',
      serialize: () => ({ mode: 'topDown' }),
      hydrate: () => undefined,
    });
    save.register({
      key: 'inventory',
      serialize: () => ({ apples: 3 }),
      hydrate: () => undefined,
    });

    const snapshot = createWorldSnapshotFromSaveSystem(save, 'world-1', {
      version: 7,
      savedAt: 100,
    });

    expect(snapshot).toEqual({
      kind: 'world',
      worldId: 'world-1',
      version: 7,
      savedAt: 100,
      domains: {
        building: { blocks: 2 },
        camera: { mode: 'topDown' },
      },
    });
  });

  it('creates player progress snapshots from SaveSystem bindings', () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    save.register({
      key: 'building',
      serialize: () => ({ blocks: 2 }),
      hydrate: () => undefined,
    });
    save.register({
      key: 'inventory',
      serialize: () => ({ apples: 3 }),
      hydrate: () => undefined,
    });
    save.register({
      key: 'quests',
      serialize: () => ({ active: ['quest-1'] }),
      hydrate: () => undefined,
    });

    const snapshot = createPlayerProgressFromSaveSystem(save, 'player-1', {
      worldId: 'world-1',
      version: 3,
      savedAt: 200,
    });

    expect(snapshot).toEqual({
      kind: 'player',
      playerId: 'player-1',
      worldId: 'world-1',
      version: 3,
      savedAt: 200,
      domains: {
        inventory: { apples: 3 },
        quests: { active: ['quest-1'] },
      },
    });
  });
});
