import type { DomainBinding } from '../../../save/types';
import { createLocalVisitChannel } from '../channel';
import {
  applyVisitSnapshot,
  serializeVisit,
  visitProviderFromSaveSystem,
} from '../serializer';
import type { VisitChannelEvent } from '../types';

function bindingFor<T>(key: string, get: () => T, set: (v: T | null | undefined) => void): DomainBinding<T> {
  return { key, serialize: get, hydrate: (data) => set(data) };
}

describe('visit-room serializer', () => {
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
    expect(snapshot.domains).toHaveProperty('building');
    expect(snapshot.domains).not.toHaveProperty('mail');
  });

  it('apply restores domain values via hydrate', () => {
    let captured: { tiles: number[] } | null = null;
    const provider = () => [
      bindingFor<{ tiles: number[] }>(
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
  it('replays the latest snapshot to new subscribers', () => {
    const channel = createLocalVisitChannel();
    const snapshot = {
      version: 1,
      hostId: 'host-1',
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
