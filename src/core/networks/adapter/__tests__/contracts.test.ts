import {
  createGameCommand,
  createNetworkEnvelope,
  createServerEvent,
  createSnapshotAck,
  createStateDelta,
} from '../index';

describe('authoritative network contracts', () => {
  test('separates client commands from server-confirmed events and deltas', () => {
    const command = createGameCommand({
      commandId: 'cmd-1',
      domain: 'inventory',
      action: 'move-item',
      actorId: 'player-1',
      submittedAt: 100,
      payload: { from: 0, to: 1 },
      clientSequence: 7,
      expectedRevision: 12,
    });
    const event = createServerEvent({
      eventId: 'evt-1',
      domain: 'inventory',
      type: 'item-moved',
      occurredAt: 120,
      payload: { itemId: 'apple' },
      commandId: command.commandId,
      actorId: command.actorId,
      serverRevision: 13,
    });
    const delta = createStateDelta({
      deltaId: 'delta-1',
      domain: 'inventory',
      path: ['slots', '1'],
      op: 'set',
      value: { itemId: 'apple', count: 1 },
      commandId: command.commandId,
      serverRevision: 13,
      changedAt: 121,
    });

    expect(command).toEqual(expect.objectContaining({
      commandId: 'cmd-1',
      action: 'move-item',
      clientSequence: 7,
      expectedRevision: 12,
    }));
    expect(event).toEqual(expect.objectContaining({
      eventId: 'evt-1',
      type: 'item-moved',
      commandId: 'cmd-1',
      serverRevision: 13,
    }));
    expect(delta).toEqual(expect.objectContaining({
      deltaId: 'delta-1',
      op: 'set',
      path: ['slots', '1'],
      serverRevision: 13,
    }));
  });

  test('supports authority message types in network envelopes', () => {
    const command = createGameCommand({
      commandId: 'cmd-2',
      domain: 'interaction',
      action: 'trigger',
      actorId: 'player-1',
      submittedAt: 200,
      payload: { targetId: 'door-1' },
    });

    const envelope = createNetworkEnvelope('game.command', command, {
      version: 2,
      roomId: 'room-1',
      playerId: 'player-1',
      traceId: 'trace-1',
    });

    expect(envelope).toEqual(expect.objectContaining({
      version: 2,
      type: 'game.command',
      roomId: 'room-1',
      playerId: 'player-1',
      traceId: 'trace-1',
      payload: command,
    }));
  });

  test('acknowledges authoritative snapshots without embedding transport details', () => {
    const ack = createSnapshotAck({
      ackId: 'ack-1',
      snapshotId: 'snapshot-1',
      kind: 'world',
      acceptedAt: 300,
      worldId: 'world-1',
      roomId: 'room-1',
      serverRevision: 20,
      domains: ['building', 'camera'],
    });

    expect(ack).toEqual({
      version: 1,
      ackId: 'ack-1',
      snapshotId: 'snapshot-1',
      kind: 'world',
      acceptedAt: 300,
      worldId: 'world-1',
      roomId: 'room-1',
      serverRevision: 20,
      domains: ['building', 'camera'],
    });
  });
});
