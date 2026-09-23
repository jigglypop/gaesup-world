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
  verifyActor?: (command: GameCommand) => boolean;
  getRevision?: (command: GameCommand) => number | undefined;
  replayWindowMs?: number;
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

type ReplayEntry = {
  result: Promise<CommandAuthorityResult>;
  expiresAt: number;
};

const DEFAULT_REPLAY_WINDOW_MS = 60_000;

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
  const replays = new Map<string, ReplayEntry>();
  const now = options.now ?? Date.now;
  const createId = options.createId ?? defaultCreateAuthorityId;
  const replayWindowMs = options.replayWindowMs ?? DEFAULT_REPLAY_WINDOW_MS;
  const context: CommandAuthorityContext = { now, createId };

  const reject = (command: GameCommand, reason: string, serverRevision?: number): CommandAuthorityResult =>
    createCommandRejectedResult(command, reason, {
      eventId: createId('rejected', command),
      occurredAt: now(),
      ...(serverRevision !== undefined ? { serverRevision } : {}),
    });

  const pruneReplays = (time: number): void => {
    for (const [key, entry] of replays) {
      if (entry.expiresAt > time) return;
      replays.delete(key);
    }
  };

  const execute = async (command: GameCommand): Promise<CommandAuthorityResult> => {
    const registration =
      registrations.get(routeKey({ domain: command.domain, action: command.action })) ??
      registrations.get(routeKey({ domain: command.domain, action: '*' }));

    if (!registration) {
      return reject(command, `No authority handler registered for ${command.domain}:${command.action}.`);
    }
    if (command.expectedRevision !== undefined && options.getRevision) {
      const revision = options.getRevision(command);
      if (revision !== undefined && revision !== command.expectedRevision) {
        return reject(command, `Revision conflict: expected ${command.expectedRevision}, current ${revision}.`, revision);
      }
    }

    const handler = registration.handler;
    try {
      return await handler(command, context);
    } catch (error) {
      return reject(command, `Authority handler failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

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
      if (options.verifyActor && !options.verifyActor(command)) {
        return reject(command, `Actor "${command.actorId}" is not bound to this session.`);
      }
      if (replayWindowMs <= 0) return execute(command);
      const time = now();
      pruneReplays(time);
      const key = `${command.actorId}:${command.commandId}`;
      const replay = replays.get(key);
      if (replay) return replay.result;
      const result = execute(command);
      replays.set(key, { result, expiresAt: time + replayWindowMs });
      return result;
    },
    has: (route) => registrations.has(routeKey(route)),
    clear: () => {
      registrations.clear();
      replays.clear();
    },
  };
}
