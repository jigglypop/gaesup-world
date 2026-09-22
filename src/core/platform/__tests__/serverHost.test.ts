import {
  createCommandAcceptedResult,
  createGameCommand,
  createServerEvent,
  createStateDelta,
  type CommandAuthorityRouter,
} from '../../networks/adapter';
import type { GaesupPlugin, PluginRuntime, SaveExtensionMap } from '../../plugins';
import { SaveSystem } from '../../save';
import type { SaveAdapter } from '../../save';
import {
  DEFAULT_SERVER_COMMAND_AUTHORITY_SERVICE_ID,
  createServerPluginHost,
} from '../serverHost';

class MemoryAdapter implements SaveAdapter {
  async read() {
    return null;
  }

  async write() {
    return undefined;
  }

  async list() {
    return [];
  }

  async remove() {
    return undefined;
  }
}

const markerPlugin = (
  id: string,
  runtime: PluginRuntime,
  calls: string[],
): GaesupPlugin => ({
  id,
  name: id,
  version: '1.0.0',
  runtime,
  setup: () => { calls.push(id); },
});

describe('createServerPluginHost', () => {
  test('sets up only server-compatible plugins', async () => {
    const calls: string[] = [];
    const host = createServerPluginHost({
      plugins: [
        markerPlugin('client-only', 'client', calls),
        markerPlugin('server-only', 'server', calls),
        markerPlugin('shared', 'both', calls),
        markerPlugin('editor-only', 'editor', calls),
      ],
    });

    await host.setup();

    expect(host.pluginRuntime).toBe('server');
    expect(host.plugins.has('client-only')).toBe(false);
    expect(host.plugins.has('editor-only')).toBe(false);
    expect(host.plugins.has('server-only')).toBe(true);
    expect(host.plugins.has('shared')).toBe(true);
    expect(calls).toEqual(['server-only', 'shared']);

    await host.dispose();
  });

  test('registers plugin save bindings and creates platform snapshots', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    // 서버 호스트는 저장 바인딩을 불투명하게 다루므로 building 페이로드는 단순화한 스텁을 쓴다
    const buildingBinding = {
      key: 'building',
      serialize: () => ({ blocks: 2 }),
      hydrate: () => undefined,
    } as unknown as SaveExtensionMap['building'];
    const host = createServerPluginHost({
      saveSystem: save,
      plugins: [{
        id: 'server.snapshot',
        name: 'Server Snapshot',
        version: '1.0.0',
        runtime: 'server',
        setup(ctx) {
          ctx.save.register('building', buildingBinding, 'server.snapshot');
          ctx.save.register('inventory', {
            key: 'inventory',
            serialize: () => ({ apples: 3 }),
            hydrate: () => undefined,
          }, 'server.snapshot');
          ctx.services.register('authority.clock', { now: () => 123 }, 'server.snapshot');
        },
      }],
    });

    await host.setup();

    expect(Array.from(host.getSaveBindings()).map((binding) => binding.key).sort()).toEqual([
      'building',
      'inventory',
    ]);
    expect(host.requireService<{ now: () => number }>('authority.clock').now()).toBe(123);
    expect(host.createWorldSnapshot('world-1', { savedAt: 10 })).toEqual({
      kind: 'world',
      worldId: 'world-1',
      version: 1,
      savedAt: 10,
      domains: {
        building: { blocks: 2 },
      },
    });
    expect(host.createPlayerProgress('player-1', {
      worldId: 'world-1',
      savedAt: 20,
    })).toEqual({
      kind: 'player',
      playerId: 'player-1',
      worldId: 'world-1',
      version: 1,
      savedAt: 20,
      domains: {
        inventory: { apples: 3 },
      },
    });

    await host.dispose();

    expect(Array.from(host.getSaveBindings())).toEqual([]);
    expect(host.plugins.context.save.has('building')).toBe(false);
  });

  test('exposes command authority to server plugins', async () => {
    const host = createServerPluginHost({
      commandAuthority: {
        now: () => 500,
        createId: (prefix, command) => `${prefix}-${command.commandId}`,
      },
      plugins: [{
        id: 'server.authority',
        name: 'Server Authority',
        version: '1.0.0',
        runtime: 'server',
        setup(ctx) {
          const authority = ctx.services.require<CommandAuthorityRouter>(
            DEFAULT_SERVER_COMMAND_AUTHORITY_SERVICE_ID,
          );
          authority.register({ domain: 'inventory', action: 'drop' }, (command, context) => {
            const event = createServerEvent({
              eventId: context.createId('evt', command),
              domain: command.domain,
              type: 'item-dropped',
              occurredAt: context.now(),
              payload: command.payload,
              commandId: command.commandId,
              actorId: command.actorId,
              serverRevision: 4,
            });
            const delta = createStateDelta({
              deltaId: context.createId('delta', command),
              domain: command.domain,
              path: ['slots', '0'],
              op: 'delete',
              commandId: command.commandId,
              serverRevision: 4,
              changedAt: context.now(),
            });
            return createCommandAcceptedResult(command, {
              events: [event],
              deltas: [delta],
              serverRevision: 4,
            });
          });
        },
      }],
    });
    const command = createGameCommand({
      commandId: 'cmd-drop',
      domain: 'inventory',
      action: 'drop',
      actorId: 'player-1',
      submittedAt: 100,
      payload: { itemId: 'apple' },
    });

    await host.setup();

    await expect(host.handleCommand(command)).resolves.toEqual({
      accepted: true,
      command,
      events: [expect.objectContaining({
        eventId: 'evt-cmd-drop',
        type: 'item-dropped',
        serverRevision: 4,
      })],
      deltas: [expect.objectContaining({
        deltaId: 'delta-cmd-drop',
        op: 'delete',
        serverRevision: 4,
      })],
      serverRevision: 4,
    });

    await host.dispose();

    expect(host.plugins.context.services.has(DEFAULT_SERVER_COMMAND_AUTHORITY_SERVICE_ID)).toBe(false);
    await expect(host.handleCommand(command)).resolves.toEqual(expect.objectContaining({
      accepted: false,
    }));
  });
});
