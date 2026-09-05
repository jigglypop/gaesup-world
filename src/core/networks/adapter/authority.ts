import {
  createServerEvent,
  type GameCommand,
  type ServerEvent,
  type StateDelta,
} from './contracts';

export type CommandAuthorityContext = {
  now: () => number;
  createId: (prefix: string, command: GameCommand) => string;
};

export type CommandAuthorityResult = {
  accepted: boolean;
  command: GameCommand;
  events: ServerEvent[];
  deltas: StateDelta[];
  serverRevision?: number;
  reason?: string;
};

export type CommandAuthorityHandler<TPayload = unknown> = (
  command: GameCommand<TPayload>,
  context: CommandAuthorityContext,
) => CommandAuthorityResult | Promise<CommandAuthorityResult>;

export type CommandAuthorityRoute = {
  domain: string;
  action?: string | '*';
};

export type CommandAuthorityRouter = {
  register: <TPayload = unknown>(
    route: CommandAuthorityRoute,
    handler: CommandAuthorityHandler<TPayload>,
  ) => () => void;
  handle: (command: GameCommand) => Promise<CommandAuthorityResult>;
  has: (route: CommandAuthorityRoute) => boolean;
  clear: () => void;
};

export type CommandAuthorityRouterOptions = {
  now?: () => number;
  createId?: (prefix: string, command: GameCommand) => string;
};

export type CreateCommandAcceptedResultOptions = {
  events?: ServerEvent[];
  deltas?: StateDelta[];
  serverRevision?: number;
};

export type CreateCommandRejectedResultOptions = {
  eventId?: string;
  occurredAt?: number;
  serverRevision?: number;
};

type CommandAuthorityRegistration = {
  handler: CommandAuthorityHandler;
};

function routeKey(route: CommandAuthorityRoute): string {
  return `${route.domain}:${route.action ?? '*'}`;
}

function defaultCreateAuthorityId(prefix: string, command: GameCommand): string {
  return `${prefix}-${command.commandId}`;
}

export function createCommandAcceptedResult(
  command: GameCommand,
  options: CreateCommandAcceptedResultOptions = {},
): CommandAuthorityResult {
  return {
    accepted: true,
    command,
    events: options.events ?? [],
    deltas: options.deltas ?? [],
    ...(options.serverRevision !== undefined ? { serverRevision: options.serverRevision } : {}),
  };
}

export function createCommandRejectedResult(
  command: GameCommand,
  reason: string,
  options: CreateCommandRejectedResultOptions = {},
): CommandAuthorityResult {
  const event = createServerEvent({
    eventId: options.eventId ?? `rejected-${command.commandId}`,
    domain: command.domain,
    type: 'command.rejected',
    occurredAt: options.occurredAt ?? Date.now(),
    commandId: command.commandId,
    actorId: command.actorId,
    payload: {
      action: command.action,
      reason,
    },
    ...(options.serverRevision !== undefined ? { serverRevision: options.serverRevision } : {}),
    ...(command.traceId ? { traceId: command.traceId } : {}),
  });

  return {
    accepted: false,
    command,
    reason,
    events: [event],
    deltas: [],
    ...(options.serverRevision !== undefined ? { serverRevision: options.serverRevision } : {}),
  };
}

export function createCommandAuthorityRouter(
  options: CommandAuthorityRouterOptions = {},
): CommandAuthorityRouter {
  const registrations = new Map<string, CommandAuthorityRegistration>();
  const now = options.now ?? Date.now;
  const createId = options.createId ?? defaultCreateAuthorityId;
  const context: CommandAuthorityContext = { now, createId };

  return {
    register: (route, handler) => {
      const key = routeKey(route);
      const registration: CommandAuthorityRegistration = {
        handler: handler as CommandAuthorityHandler,
      };
      registrations.set(key, registration);
      return () => {
        if (registrations.get(key) === registration) {
          registrations.delete(key);
        }
      };
    },
    handle: async (command) => {
      const registration =
        registrations.get(routeKey({ domain: command.domain, action: command.action })) ??
        registrations.get(routeKey({ domain: command.domain, action: '*' }));

      if (!registration) {
        return createCommandRejectedResult(
          command,
          `No authority handler registered for ${command.domain}:${command.action}.`,
          {
            eventId: createId('rejected', command),
            occurredAt: now(),
          },
        );
      }

      const handler = registration.handler;
      return handler(command, context);
    },
    has: (route) => registrations.has(routeKey(route)),
    clear: () => {
      registrations.clear();
    },
  };
}
