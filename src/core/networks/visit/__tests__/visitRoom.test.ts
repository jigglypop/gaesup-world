import type { DomainBinding, SerializedDomainValue } from '../../../save/types';
import { createLocalVisitChannel } from '../channel';
import {
  applyVisitSnapshot,
  captureVisitRestorePoint,
  serializeVisit,
  visitProviderFromSaveSystem,
} from '../serializer';
import type { VisitChannelEvent } from '../types';

function bindingFor(
  key: string,
  get: () => SerializedDomainValue,
  set: (v: SerializedDomainValue) => void,
): DomainBinding {
  return { key, serialize: get, hydrate: (data) => set(data) };
}

/** A local world whose domains start at 'home'; `failing[key](value)` makes that hydrate throw. */
function worldOf(keys: string[], failing: Record<string, (value: SerializedDomainValue) => boolean> = {}) {
  const state: Record<string, SerializedDomainValue> = Object.fromEntries(keys.map((key) => [key, 'home']));
  const hydrate = jest.fn((key: string, value: SerializedDomainValue) => {
    if (failing[key]?.(value)) throw new Error(`${key} failed`);
    state[key] = value;
  });
  const provider = () => keys.map((key) => bindingFor(key, () => state[key], (value) => hydrate(key, value)));
  return { state, hydrate, provider };
}

const remoteOf = (keys: string[]) =>
  serializeVisit(() => keys.map((key) => bindingFor(key, () => 'remote', () => {})), { hostId: 'remote', domains: keys });

describe('visit-room serializer', () => {
  it.each([-1, 0, 1.5, 2, 999, NaN, Infinity])('skips unsupported version %s without accessing bindings', (version) => {
    const provider = jest.fn(() => []);
    const filter = jest.fn(() => true);
    const snapshot = serializeVisit(() => [], { hostId: 'host', version });
    snapshot.domains = { building: { tiles: [] }, custom: 7 };

    expect(applyVisitSnapshot(provider, snapshot, {
      allowedDomains: ['building', 'custom'], filter,
    })).toEqual({ applied: [], skipped: ['building', 'custom'] });
    expect(provider).not.toHaveBeenCalled();
    expect(filter).not.toHaveBeenCalled();
  });

  it('propagates capture failures while preserving explicit null domain values', () => {
    const failure = new Error('World capture failed');
    const serialize = jest.fn(() => { throw failure; });
    const provider = () => [bindingFor('building', serialize, () => {})];
    expect(() => serializeVisit(provider, { hostId: 'host' })).toThrow(failure);
    expect(serializeVisit(
      () => [bindingFor('building', () => null, () => {})],
      { hostId: 'host' },
    ).domains).toEqual({ building: null });
    serialize.mockClear();
    expect(serializeVisit(provider, { hostId: 'host', domains: [] }).domains).toEqual({});
    expect(serialize).not.toHaveBeenCalled();
  });

  it.each([undefined, []])('protects private domains with allowedDomains=%s', (allowedDomains) => {
    const hydrateBuilding = jest.fn();
    const hydrateWallet = jest.fn();
    const provider = () => [
      bindingFor('building', () => null, hydrateBuilding),
      bindingFor('wallet', () => 100, hydrateWallet),
    ];
    const snapshot = serializeVisit(() => [
      bindingFor('building', () => ({ tiles: [1] }), () => {}),
      bindingFor('wallet', () => 0, () => {}),
    ], { hostId: 'host-1', domains: ['building', 'wallet'] });

    const result = applyVisitSnapshot(provider, snapshot,
      allowedDomains === undefined ? {} : { allowedDomains });

    expect(hydrateWallet).not.toHaveBeenCalled();
    expect(hydrateBuilding).toHaveBeenCalledTimes(allowedDomains === undefined ? 1 : 0);
    expect(result.skipped).toContain('wallet');
  });

  it('allows explicitly selected custom domains', () => {
    const hydrate = jest.fn();
    const provider = () => [bindingFor('custom', () => 7, hydrate)];
    const snapshot = serializeVisit(provider, { hostId: 'host-1', domains: ['custom'] });

    expect(applyVisitSnapshot(provider, snapshot, { allowedDomains: ['custom'] }).applied)
      .toEqual(['custom']);
    expect(hydrate).toHaveBeenCalledWith(7);
  });

  it('captures only the requested domains', () => {
    const state = { building: { tiles: [1, 2, 3] }, mail: { unread: 4 } };
    const provider = () => [
      bindingFor('building', () => state.building, (v) => { state.building = (v as typeof state.building) ?? state.building; }),
      bindingFor('mail', () => state.mail, (v) => { state.mail = (v as typeof state.mail) ?? state.mail; }),
    ];

    const snapshot = serializeVisit(provider, {
      hostId: 'host-1',
      domains: ['building'],
    });

    expect(snapshot.hostId).toBe('host-1');
    expect(snapshot.kind).toBe('world');
    expect(snapshot.worldId).toBe('host-1');
    expect(snapshot.savedAt).toBe(snapshot.capturedAt);
    expect(snapshot.domains).toHaveProperty('building');
    expect(snapshot.domains).not.toHaveProperty('mail');
  });

  it('can align visit captures to a world snapshot id and timestamp', () => {
    const snapshot = serializeVisit(
      () => [bindingFor('building', () => ({ tiles: [] }), () => {})],
      {
        hostId: 'host-1',
        worldId: 'world-1',
        savedAt: 123,
        domains: ['building'],
      },
    );

    expect(snapshot).toEqual(expect.objectContaining({
      kind: 'world',
      worldId: 'world-1',
      hostId: 'host-1',
      savedAt: 123,
      capturedAt: 123,
    }));
  });

  it('apply restores domain values via hydrate', () => {
    let captured: { tiles: number[] } | null = null;
    const provider = () => [
      bindingFor(
        'building',
        () => ({ tiles: [] }),
        (v) => { captured = (v as { tiles: number[] }) ?? null; },
      ),
    ];

    const snapshot = serializeVisit(
      () => [bindingFor('building', () => ({ tiles: [9, 8, 7] }), () => {})],
      { hostId: 'host-1', domains: ['building'] },
    );

    const result = applyVisitSnapshot(provider, snapshot);
    expect(result.applied).toEqual(['building']);
    expect(captured).toEqual({ tiles: [9, 8, 7] });
  });

  it('respects allowedDomains and filter', () => {
    let buildingApplied = false;
    let sceneApplied = false;
    const provider = () => [
      bindingFor('building', () => null, () => { buildingApplied = true; }),
      bindingFor('scene', () => null, () => { sceneApplied = true; }),
    ];

    const snapshot = serializeVisit(
      () => [
        bindingFor('building', () => ({ x: 1 }), () => {}),
        bindingFor('scene', () => ({ y: 2 }), () => {}),
      ],
      { hostId: 'host-1', domains: ['building', 'scene'] },
    );

    const result = applyVisitSnapshot(provider, snapshot, {
      allowedDomains: ['building'],
      filter: (key) => key !== 'scene',
    });

    expect(result.applied).toEqual(['building']);
    expect(buildingApplied).toBe(true);
    expect(sceneApplied).toBe(false);
  });

  it('atomic apply returns every domain to its prior state when a later one throws', () => {
    const keys = ['building', 'npc', 'weather'];
    const world = worldOf(keys, { npc: (value) => value === 'remote' });
    const result = applyVisitSnapshot(world.provider, remoteOf(keys), { atomic: true });
    expect(result).toEqual({ applied: [], skipped: keys, failed: [{ key: 'npc', error: new Error('npc failed') }] });
    expect(world.state).toEqual({ building: 'home', npc: 'home', weather: 'home' });
    // The failing domain may be half applied, so it is restored first, then the applied ones in reverse.
    expect(world.hydrate.mock.calls.map(([key, value]) => `${key}=${String(value)}`))
      .toEqual(['building=remote', 'npc=remote', 'npc=home', 'building=home']);
  });

  it('atomic apply names the domains a failed rollback left in the visited state', () => {
    const keys = ['building', 'npc'];
    const world = worldOf(keys, { npc: (value) => value === 'remote', building: (value) => value === 'home' });
    const result = applyVisitSnapshot(world.provider, remoteOf(keys), { atomic: true });
    expect(result.failed?.map(({ key }) => key)).toEqual(['npc']);
    expect(result.unrestored).toEqual(['building']);
    expect(world.state).toEqual({ building: 'remote', npc: 'home' });
  });

  it('a restore point restores every domain it can instead of undoing the others', () => {
    const keys = ['building', 'npc'];
    const failing: Record<string, (value: SerializedDomainValue) => boolean> = {};
    const world = worldOf(keys, failing);
    const point = captureVisitRestorePoint(world.provider, keys);
    applyVisitSnapshot(world.provider, remoteOf(keys), { atomic: true });
    failing['building'] = () => true;
    expect(point.restore()).toEqual({ applied: ['npc'], skipped: ['building'], failed: [{ key: 'building', error: new Error('building failed') }] });
    expect(world.state).toEqual({ building: 'remote', npc: 'home' });
  });

  it('visitProviderFromSaveSystem proxies getBindings', () => {
    const fakeBinding = bindingFor('character', () => ({ hat: 1 }), () => {});
    const provider = visitProviderFromSaveSystem({
      getBindings: () => [fakeBinding],
    });
    const collected = Array.from(provider());
    expect(collected).toHaveLength(1);
    expect(collected[0]?.key).toBe('character');
  });
});

describe('local visit channel', () => {
  it.each(['host-1', 'other-host'])('keeps replay state consistent when %s leaves', (hostId) => {
    const channel = createLocalVisitChannel();
    const snapshot = serializeVisit(() => [], { hostId: 'host-1' });
    channel.publish(snapshot);
    const duringLeave = jest.fn();
    channel.subscribe((event) => {
      if (event.type === 'leave') channel.subscribe(duringLeave);
    });

    channel.leave(hostId);

    const afterLeave = jest.fn();
    channel.subscribe(afterLeave);
    const expected = hostId === 'host-1' ? 0 : 1;
    expect(afterLeave).toHaveBeenCalledTimes(expected);
    expect(duringLeave.mock.calls.filter(([event]) => event.type === 'snapshot')).toHaveLength(expected);
    channel.close();
  });

  it('replays the latest snapshot to new subscribers', () => {
    const channel = createLocalVisitChannel();
    const snapshot = {
      kind: 'world' as const,
      worldId: 'host-1',
      version: 1,
      hostId: 'host-1',
      savedAt: 1,
      capturedAt: 1,
      domains: { building: 'X' },
    };
    channel.publish(snapshot);

    const events: VisitChannelEvent[] = [];
    const off = channel.subscribe((e) => events.push(e));
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: 'snapshot' });
    off();
  });

  it('forwards leave events to live subscribers', () => {
    const channel = createLocalVisitChannel();
    const events: VisitChannelEvent[] = [];
    channel.subscribe((e) => events.push(e));

    channel.leave('host-1');

    const last = events.at(-1);
    expect(last?.type).toBe('leave');
    if (last && last.type === 'leave') {
      expect(last.hostId).toBe('host-1');
    }
  });
});
