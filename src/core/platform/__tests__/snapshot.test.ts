import {
  WORLD_SNAPSHOT_DOMAINS,
  collectSaveDomains,
  createPlayerProgressFromSaveSystem,
  createWorldSnapshotFromSaveSystem,
} from '../snapshot';
import { SaveSystem } from '../../save';
import type { SaveAdapter, SaveBlob } from '../../save';
import { createContentBundleFromSaveSystem } from '../../content';
import { applyVisitSnapshot, serializeVisit } from '../../networks/visit/serializer';
import { createSceneDocument, createSceneDocumentController, createSceneDocumentSaveBinding } from '../../scene-object';

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
  it.each(['world', 'player'] as const)('does not serialize excluded domains during %s capture', (kind) => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const includedKey = kind === 'world' ? 'building' : 'wallet';
    const excludedKey = kind === 'world' ? 'wallet' : 'building';
    const included = jest.fn(() => ({ value: 1 }));
    const excluded = jest.fn(() => { throw new Error('Unrelated domain unavailable'); });
    save.register({ key: excludedKey, serialize: excluded, hydrate: () => undefined });
    save.register({ key: includedKey, serialize: included, hydrate: () => undefined });
    const snapshot = kind === 'world'
      ? createWorldSnapshotFromSaveSystem(save, 'world')
      : createPlayerProgressFromSaveSystem(save, 'player');
    expect(snapshot.domains).toEqual({ [includedKey]: { value: 1 } });
    expect(included).toHaveBeenCalledTimes(1);
    expect(excluded).not.toHaveBeenCalled();
    expect(() => collectSaveDomains(save)).toThrow('Unrelated domain unavailable');
  });

  it.each(['world', 'player'] as const)('propagates %s capture failures and permits retry', (kind) => {
    const failure = new Error('Capture failed');
    const serialize = jest.fn(() => ({ value: 1 }));
    serialize.mockImplementationOnce(() => { throw failure; });
    const provider = { getBindings: () => [{
      key: kind === 'world' ? 'building' : 'inventory',
      serialize,
      hydrate: () => undefined,
    }] };
    const capture = () => kind === 'world'
      ? createWorldSnapshotFromSaveSystem(provider, 'world')
      : createPlayerProgressFromSaveSystem(provider, 'player');
    expect(capture).toThrow(failure);
    expect(capture().domains).toEqual({ [kind === 'world' ? 'building' : 'inventory']: { value: 1 } });
  });

  it('shares scene documents through bundles, world snapshots and accepted visits', () => {
    const source = createSceneDocumentController(createSceneDocument({
      id: 'created-world',
      objects: [{ id: 'created-object', name: '제작한 오브젝트', transform: { position: [3, 2, 1] } }],
    }));
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    save.register(createSceneDocumentSaveBinding(source));
    save.register({ key: 'scene', serialize: () => ({ legacy: true }), hydrate: () => undefined });
    save.register({ key: 'inventory', serialize: () => ({ private: true }), hydrate: () => undefined });
    const bundle = createContentBundleFromSaveSystem(save, [], { id: 'world', name: '월드', version: '1.0.0' });
    const snapshot = createWorldSnapshotFromSaveSystem(save, 'world');
    for (const domains of [bundle.world.domains, snapshot.domains]) {
      expect(domains['scene-document']).toEqual(source.getSnapshot());
      expect(domains['scene']).toEqual({ legacy: true });
      expect(domains).not.toHaveProperty('inventory');
    }
    expect(createPlayerProgressFromSaveSystem(save, 'player').domains).not.toHaveProperty('scene-document');
    const target = createSceneDocumentController(createSceneDocument({ id: 'visitor-world' }));
    const targetBinding = createSceneDocumentSaveBinding(target);
    const visit = serializeVisit(() => save.getBindings(), { hostId: 'host' });
    expect(applyVisitSnapshot(() => [targetBinding], visit, { allowedDomains: [] }).applied).toEqual([]);
    expect(target.getSnapshot().id).toBe('visitor-world');
    expect(applyVisitSnapshot(() => [targetBinding], visit).applied).toEqual(['scene-document']);
    expect(target.getSnapshot()).toEqual(source.getSnapshot());
    expect(target.getSnapshot()).not.toBe(source.getSnapshot());
  });

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
