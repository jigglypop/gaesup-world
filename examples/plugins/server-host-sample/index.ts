import {
  createCommandAcceptedResult,
  createGameCommand,
  createServerEvent,
  createServerPluginHost,
  type CommandAuthorityResult,
  type PlatformServerPluginHost,
} from 'gaesup-world/server-contracts';

export const EXAMPLE_SERVER_HOST_DOMAIN = 'example.demo';
export const EXAMPLE_SERVER_HOST_PING_ACTION = 'ping';
export const EXAMPLE_SERVER_HOST_PONG_EVENT = 'example.pong';

export function createExampleServerHost(): PlatformServerPluginHost {
  const host = createServerPluginHost();
  host.commandAuthority.register(
    { domain: EXAMPLE_SERVER_HOST_DOMAIN, action: EXAMPLE_SERVER_HOST_PING_ACTION },
    (command, context) =>
      createCommandAcceptedResult(command, {
        events: [
          createServerEvent({
            eventId: context.createId('pong', command),
            domain: command.domain,
            type: EXAMPLE_SERVER_HOST_PONG_EVENT,
            occurredAt: context.now(),
            commandId: command.commandId,
            actorId: command.actorId,
            payload: command.payload,
          }),
        ],
      }),
  );
  return host;
}

export async function runExampleServerHostPing(
  host: PlatformServerPluginHost,
  actorId: string,
): Promise<CommandAuthorityResult> {
  return host.handleCommand(
    createGameCommand({
      domain: EXAMPLE_SERVER_HOST_DOMAIN,
      action: EXAMPLE_SERVER_HOST_PING_ACTION,
      actorId,
      payload: { sentAt: Date.now() },
    }),
  );
}

export default createExampleServerHost;
