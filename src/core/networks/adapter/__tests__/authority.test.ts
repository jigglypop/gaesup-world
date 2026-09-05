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

    router.register({ domain: 'interaction' }, (incoming, context) =>
      createCommandAcceptedResult(incoming, {
        events: [
          createServerEvent({
            eventId: context.createId('evt', incoming),
            domain: incoming.domain,
            type: `${incoming.action}.accepted`,
            occurredAt: context.now(),
            payload: incoming.payload,
            commandId: incoming.commandId,
            actorId: incoming.actorId,
          }),
        ],
      }),
    );

    const result = await router.handle(command);

    expect(result.accepted).toBe(true);
    expect(result.events[0]).toEqual(
      expect.objectContaining({
        eventId: 'evt-cmd-2',
        type: 'open-door.accepted',
      }),
    );
  });

  test('prefers exact routes and preserves the handler result identity', async () => {
    const command = createGameCommand({
      commandId: 'cmd-exact-route',
      domain: 'interaction',
      action: 'open-door',
      actorId: 'player-1',
      submittedAt: 100,
      payload: { targetId: 'door-1' },
    });
    const wildcardResult = createCommandAcceptedResult(command, { serverRevision: 1 });
    const exactResult = createCommandAcceptedResult(command, { serverRevision: 2 });
    const wildcardHandler = jest.fn(() => wildcardResult);
    const exactHandler = jest.fn(() => exactResult);
    const router = createCommandAuthorityRouter();
    router.register({ domain: 'interaction' }, wildcardHandler);
    router.register({ domain: 'interaction', action: 'open-door' }, exactHandler);

    const result = await router.handle(command);

    expect(result).toBe(exactResult);
    expect(exactHandler).toHaveBeenCalledTimes(1);
    expect(wildcardHandler).not.toHaveBeenCalled();
  });

  test('invokes registered handlers without exposing the registration record as this', async () => {
    const command = createGameCommand({
      commandId: 'cmd-handler-this',
      domain: 'inventory',
      action: 'drop',
      actorId: 'player-1',
      submittedAt: 100,
      payload: {},
    });
    const router = createCommandAuthorityRouter();

    router.register({ domain: 'inventory', action: 'drop' }, function (this: unknown, incoming) {
      expect(this).toBeUndefined();
      return createCommandAcceptedResult(incoming);
    });

    await router.handle(command);
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
      events: [
        {
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
        },
      ],
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
    const unregister = router.register({ domain: 'inventory', action: 'drop' }, (incoming) =>
      createCommandAcceptedResult(incoming),
    );

    expect(router.has({ domain: 'inventory', action: 'drop' })).toBe(true);
    unregister();
    expect(router.has({ domain: 'inventory', action: 'drop' })).toBe(false);

    router.register({ domain: 'inventory', action: 'drop' }, (incoming) =>
      createCommandAcceptedResult(incoming),
    );
    router.clear();

    await expect(router.handle(command)).resolves.toEqual(
      expect.objectContaining({
        accepted: false,
      }),
    );
  });

  test('keeps a replacement route when the previous owner unregisters late', async () => {
    const command = createGameCommand({
      commandId: 'cmd-replacement',
      domain: 'inventory',
      action: 'drop',
      actorId: 'player-1',
      submittedAt: 100,
      payload: {},
    });
    const route = { domain: 'inventory', action: 'drop' } as const;
    const firstHandler = jest.fn((incoming) =>
      createCommandAcceptedResult(incoming, {
        serverRevision: 1,
      }),
    );
    const replacementHandler = jest.fn((incoming) =>
      createCommandAcceptedResult(incoming, {
        serverRevision: 2,
      }),
    );
    const router = createCommandAuthorityRouter();
    const unregisterFirst = router.register(route, firstHandler);
    const unregisterReplacement = router.register(route, replacementHandler);

    unregisterFirst();

    await expect(router.handle(command)).resolves.toEqual(
      expect.objectContaining({
        accepted: true,
        serverRevision: 2,
      }),
    );
    expect(firstHandler).not.toHaveBeenCalled();
    expect(replacementHandler).toHaveBeenCalledWith(command, expect.any(Object));

    unregisterReplacement();
    expect(router.has(route)).toBe(false);
  });

  test('treats repeated registration of the same handler as distinct ownership generations', async () => {
    const command = createGameCommand({
      commandId: 'cmd-same-handler',
      domain: 'inventory',
      action: 'drop',
      actorId: 'player-1',
      submittedAt: 100,
      payload: {},
    });
    const route = { domain: 'inventory', action: 'drop' } as const;
    const handler = jest.fn((incoming) => createCommandAcceptedResult(incoming));
    const router = createCommandAuthorityRouter();
    const unregisterFirst = router.register(route, handler);
    const unregisterSecond = router.register(route, handler);

    unregisterFirst();

    expect(router.has(route)).toBe(true);
    await expect(router.handle(command)).resolves.toEqual(
      expect.objectContaining({
        accepted: true,
      }),
    );
    expect(handler).toHaveBeenCalledTimes(1);

    unregisterSecond();
    expect(router.has(route)).toBe(false);
  });

  test('keeps a post-clear owner when a cleared registration unregisters late', async () => {
    const command = createGameCommand({
      commandId: 'cmd-post-clear',
      domain: 'inventory',
      action: 'drop',
      actorId: 'player-1',
      submittedAt: 100,
      payload: {},
    });
    const route = { domain: 'inventory', action: 'drop' } as const;
    const router = createCommandAuthorityRouter();
    const unregisterCleared = router.register(route, (incoming) =>
      createCommandAcceptedResult(incoming, { serverRevision: 1 }),
    );
    router.clear();
    const unregisterCurrent = router.register(route, (incoming) =>
      createCommandAcceptedResult(incoming, { serverRevision: 2 }),
    );

    unregisterCleared();

    await expect(router.handle(command)).resolves.toEqual(
      expect.objectContaining({
        accepted: true,
        serverRevision: 2,
      }),
    );

    unregisterCurrent();
    expect(router.has(route)).toBe(false);
  });
});
