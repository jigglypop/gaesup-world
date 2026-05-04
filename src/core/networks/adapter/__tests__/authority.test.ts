import {
  createCommandAcceptedResult,
  createCommandAuthorityRouter,
  createGameCommand,
  createServerEvent,
  createStateDelta,
} from '../index';

describe('command authority router', () => {
  test('routes client commands to server-confirmed events and deltas', async () => {
    const command = createGameCommand({
      commandId: 'cmd-1',
      domain: 'inventory',
      action: 'move-item',
      actorId: 'player-1',
      submittedAt: 100,
      payload: { from: 0, to: 1 },
    });
    const event = createServerEvent({
      eventId: 'evt-1',
      domain: 'inventory',
      type: 'item-moved',
      occurredAt: 110,
      payload: { itemId: 'apple' },
      commandId: command.commandId,
      actorId: command.actorId,
      serverRevision: 2,
    });
    const delta = createStateDelta({
      deltaId: 'delta-1',
      domain: 'inventory',
      path: ['slots', '1'],
      op: 'set',
      value: { itemId: 'apple', count: 1 },
      commandId: command.commandId,
      serverRevision: 2,
      changedAt: 111,
    });
    const router = createCommandAuthorityRouter();

    router.register({ domain: 'inventory', action: 'move-item' }, (incoming) => {
      expect(incoming).toBe(command);
      return createCommandAcceptedResult(incoming, {
        events: [event],
        deltas: [delta],
        serverRevision: 2,
      });
    });

    await expect(router.handle(command)).resolves.toEqual({
      accepted: true,
      command,
      events: [event],
      deltas: [delta],
      serverRevision: 2,
    });
  });

  test('falls back to wildcard domain handlers', async () => {
    const command = createGameCommand({
      commandId: 'cmd-2',
      domain: 'interaction',
      action: 'open-door',
      actorId: 'player-1',
      submittedAt: 100,
      payload: { targetId: 'door-1' },
    });
    const router = createCommandAuthorityRouter();

    router.register({ domain: 'interaction' }, (incoming, context) => createCommandAcceptedResult(incoming, {
      events: [createServerEvent({
        eventId: context.createId('evt', incoming),
        domain: incoming.domain,
        type: `${incoming.action}.accepted`,
        occurredAt: context.now(),
        payload: incoming.payload,
        commandId: incoming.commandId,
        actorId: incoming.actorId,
      })],
    }));

    const result = await router.handle(command);

    expect(result.accepted).toBe(true);
    expect(result.events[0]).toEqual(expect.objectContaining({
      eventId: 'evt-cmd-2',
      type: 'open-door.accepted',
    }));
  });

  test('rejects commands without a registered authority handler', async () => {
    const command = createGameCommand({
      commandId: 'cmd-3',
      domain: 'quests',
      action: 'claim',
      actorId: 'player-1',
      submittedAt: 100,
      payload: { questId: 'quest-1' },
    });
    const router = createCommandAuthorityRouter({
      now: () => 123,
      createId: (prefix, incoming) => `${prefix}-${incoming.commandId}`,
    });

    const result = await router.handle(command);

    expect(result).toEqual({
      accepted: false,
      command,
      reason: 'No authority handler registered for quests:claim.',
      events: [{
        version: 1,
        eventId: 'rejected-cmd-3',
        domain: 'quests',
        type: 'command.rejected',
        occurredAt: 123,
        payload: {
          action: 'claim',
          reason: 'No authority handler registered for quests:claim.',
        },
        commandId: 'cmd-3',
        actorId: 'player-1',
      }],
      deltas: [],
    });
  });

  test('unregisters handlers and clears routes', async () => {
    const command = createGameCommand({
      commandId: 'cmd-4',
      domain: 'inventory',
      action: 'drop',
      actorId: 'player-1',
      submittedAt: 100,
      payload: {},
    });
    const router = createCommandAuthorityRouter({ now: () => 1 });
    const unregister = router.register(
      { domain: 'inventory', action: 'drop' },
      (incoming) => createCommandAcceptedResult(incoming),
    );

    expect(router.has({ domain: 'inventory', action: 'drop' })).toBe(true);
    unregister();
    expect(router.has({ domain: 'inventory', action: 'drop' })).toBe(false);

    router.register(
      { domain: 'inventory', action: 'drop' },
      (incoming) => createCommandAcceptedResult(incoming),
    );
    router.clear();

    await expect(router.handle(command)).resolves.toEqual(expect.objectContaining({
      accepted: false,
    }));
  });
});
