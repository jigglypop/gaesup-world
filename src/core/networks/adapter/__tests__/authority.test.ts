import { COMMAND_HANDLER_FAILURE_REASON } from '../authority';
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

  describe('hardening', () => {
    const buy = (commandId: string, extra: { actorId?: string; expectedRevision?: number } = {}) =>
      createGameCommand({
        commandId,
        domain: 'economy',
        action: 'buy',
        actorId: extra.actorId ?? 'player-1',
        submittedAt: 1,
        payload: { itemId: 'apple' },
        ...(extra.expectedRevision !== undefined ? { expectedRevision: extra.expectedRevision } : {}),
      });

    test('replays a repeated commandId from cache without running the handler again', async () => {
      const handler = jest.fn((incoming) => createCommandAcceptedResult(incoming));
      const router = createCommandAuthorityRouter({ now: () => 10 });
      router.register({ domain: 'economy', action: 'buy' }, handler);
      const first = await router.handle(buy('cmd-replay'));
      const second = await router.handle(buy('cmd-replay'));
      expect(second).toBe(first);
      expect(handler).toHaveBeenCalledTimes(1);
      await router.handle(buy('cmd-replay', { actorId: 'player-2' }));
      expect(handler).toHaveBeenCalledTimes(2);
    });

    test('runs the handler again after the replay window expires', async () => {
      let time = 0;
      const handler = jest.fn((incoming) => createCommandAcceptedResult(incoming));
      const router = createCommandAuthorityRouter({ now: () => time, replayWindowMs: 100 });
      router.register({ domain: 'economy', action: 'buy' }, handler);
      await router.handle(buy('cmd-window'));
      time = 150;
      await router.handle(buy('cmd-window'));
      expect(handler).toHaveBeenCalledTimes(2);
    });

    test('rejects actors that are not bound to the session', async () => {
      const handler = jest.fn((incoming) => createCommandAcceptedResult(incoming));
      const router = createCommandAuthorityRouter({ verifyActor: (incoming) => incoming.actorId === 'player-1' });
      router.register({ domain: 'economy', action: 'buy' }, handler);
      const result = await router.handle(buy('cmd-forged', { actorId: 'player-9' }));
      expect(result.accepted).toBe(false);
      expect(result.reason).toContain('player-9');
      expect(handler).not.toHaveBeenCalled();
    });

    test('rejects stale expected revisions with the current server revision', async () => {
      const handler = jest.fn((incoming) => createCommandAcceptedResult(incoming));
      const router = createCommandAuthorityRouter({ getRevision: () => 7 });
      router.register({ domain: 'economy', action: 'buy' }, handler);
      const stale = await router.handle(buy('cmd-stale', { expectedRevision: 6 }));
      expect(stale.accepted).toBe(false);
      expect(stale.serverRevision).toBe(7);
      expect((await router.handle(buy('cmd-fresh', { expectedRevision: 7 }))).accepted).toBe(true);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    test('핸들러 예외는 내부 메시지를 숨긴 거절 결과로 바꾸고 원본 오류는 onHandlerError로 넘긴다', async () => {
      const onHandlerError = jest.fn();
      const router = createCommandAuthorityRouter({ onHandlerError });
      const failure = new Error('ledger offline');
      router.register({ domain: 'economy', action: 'buy' }, () => {
        throw failure;
      });
      const result = await router.handle(buy('cmd-throw'));
      expect(result.accepted).toBe(false);
      expect(result.reason).toBe(COMMAND_HANDLER_FAILURE_REASON);
      expect(JSON.stringify(result.events)).not.toContain('ledger offline');
      expect(result.events[0]?.type).toBe('command.rejected');
      expect(onHandlerError).toHaveBeenCalledWith(failure, expect.objectContaining({ commandId: 'cmd-throw' }));
    });

    test('serializes a domain so concurrent commands cannot pass the same revision check', async () => {
      let revision = 0;
      let release: () => void = () => undefined;
      const gate = new Promise<void>((resolve) => { release = resolve; });
      const handler = jest.fn(async (incoming: Parameters<typeof createCommandAcceptedResult>[0]) => {
        await gate;
        revision += 1;
        return createCommandAcceptedResult(incoming, { serverRevision: revision });
      });
      const router = createCommandAuthorityRouter({ getRevision: () => revision });
      router.register({ domain: 'economy', action: 'buy' }, handler);
      const first = router.handle(buy('cmd-first', { expectedRevision: 0 }));
      const second = router.handle(buy('cmd-second', { expectedRevision: 0 }));
      release();
      const results = await Promise.all([first, second]);
      expect(results.map((result) => result.accepted)).toEqual([true, false]);
      expect(results[1]?.serverRevision).toBe(1);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    test('does not replay a rejection when the same command is retried', async () => {
      const handler = jest
        .fn<ReturnType<typeof createCommandAcceptedResult>, [Parameters<typeof createCommandAcceptedResult>[0]]>()
        .mockImplementationOnce(() => { throw new Error('ledger offline'); })
        .mockImplementation((incoming) => createCommandAcceptedResult(incoming));
      const router = createCommandAuthorityRouter({ onHandlerError: jest.fn() });
      router.register({ domain: 'economy', action: 'buy' }, handler);
      expect((await router.handle(buy('cmd-retry'))).accepted).toBe(false);
      expect((await router.handle(buy('cmd-retry'))).accepted).toBe(true);
      expect(handler).toHaveBeenCalledTimes(2);
    });

    test('replay 기록은 상한을 넘으면 가장 오래된 것부터 버린다', async () => {
      const handler = jest.fn((command: Parameters<typeof createCommandAcceptedResult>[0]) => createCommandAcceptedResult(command));
      const router = createCommandAuthorityRouter({ now: () => 1, maxReplayEntries: 2 });
      router.register({ domain: 'economy', action: 'buy' }, handler);
      for (const id of ['cmd-1', 'cmd-2', 'cmd-3']) await router.handle(buy(id));
      await router.handle(buy('cmd-3'));
      expect(handler).toHaveBeenCalledTimes(3);
      await router.handle(buy('cmd-1'));
      expect(handler).toHaveBeenCalledTimes(4);
      expect(() => createCommandAuthorityRouter({ maxReplayEntries: 0 })).toThrow(RangeError);
    });
  });
});
