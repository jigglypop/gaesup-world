import type { PlayerProgress, WorldSnapshot } from '../../platform';

export type NetworkAuthorityMessageType =
  | 'game.command'
  | 'server.event'
  | 'state.delta'
  | 'snapshot.world'
  | 'snapshot.player'
  | 'snapshot.ack';

export type AuthoritativeSnapshot = WorldSnapshot | PlayerProgress;

export type GameCommand<TPayload = unknown> = {
  version: number;
  commandId: string;
  domain: string;
  action: string;
  actorId: string;
  submittedAt: number;
  payload: TPayload;
  targetId?: string;
  clientSequence?: number;
  expectedRevision?: number;
  traceId?: string;
};

export type ServerEvent<TPayload = unknown> = {
  version: number;
  eventId: string;
  domain: string;
  type: string;
  occurredAt: number;
  payload: TPayload;
  commandId?: string;
  actorId?: string;
  serverRevision?: number;
  traceId?: string;
};

export type StateDeltaOperation = 'set' | 'merge' | 'delete' | 'append' | 'remove';

export type StateDelta<TValue = unknown> = {
  version: number;
  deltaId: string;
  domain: string;
  path: string[];
  op: StateDeltaOperation;
  serverRevision: number;
  changedAt: number;
  entityId?: string;
  commandId?: string;
  value?: TValue;
};

export type SnapshotAck = {
  version: number;
  ackId: string;
  snapshotId: string;
  kind: AuthoritativeSnapshot['kind'];
  acceptedAt: number;
  worldId?: string;
  playerId?: string;
  roomId?: string;
  serverRevision?: number;
  domains?: string[];
};

export type AuthoritativeNetworkPayloadMap = {
  'game.command': GameCommand;
  'server.event': ServerEvent;
  'state.delta': StateDelta;
  'snapshot.world': WorldSnapshot;
  'snapshot.player': PlayerProgress;
  'snapshot.ack': SnapshotAck;
};

export type CreateGameCommandOptions<TPayload = unknown> = {
  domain: string;
  action: string;
  actorId: string;
  payload: TPayload;
  version?: number;
  commandId?: string;
  submittedAt?: number;
  targetId?: string;
  clientSequence?: number;
  expectedRevision?: number;
  traceId?: string;
};

export type CreateServerEventOptions<TPayload = unknown> = {
  domain: string;
  type: string;
  payload: TPayload;
  version?: number;
  eventId?: string;
  occurredAt?: number;
  commandId?: string;
  actorId?: string;
  serverRevision?: number;
  traceId?: string;
};

export type CreateStateDeltaOptions<TValue = unknown> = {
  domain: string;
  path: string[];
  op: StateDeltaOperation;
  serverRevision: number;
  version?: number;
  deltaId?: string;
  changedAt?: number;
  entityId?: string;
  commandId?: string;
  value?: TValue;
};

export type CreateSnapshotAckOptions = {
  snapshotId: string;
  kind: AuthoritativeSnapshot['kind'];
  version?: number;
  ackId?: string;
  acceptedAt?: number;
  worldId?: string;
  playerId?: string;
  roomId?: string;
  serverRevision?: number;
  domains?: string[];
};

function createContractId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createGameCommand<TPayload = unknown>(
  options: CreateGameCommandOptions<TPayload>,
): GameCommand<TPayload> {
  return {
    version: options.version ?? 1,
    commandId: options.commandId ?? createContractId('cmd'),
    domain: options.domain,
    action: options.action,
    actorId: options.actorId,
    submittedAt: options.submittedAt ?? Date.now(),
    payload: options.payload,
    ...(options.targetId ? { targetId: options.targetId } : {}),
    ...(options.clientSequence !== undefined ? { clientSequence: options.clientSequence } : {}),
    ...(options.expectedRevision !== undefined ? { expectedRevision: options.expectedRevision } : {}),
    ...(options.traceId ? { traceId: options.traceId } : {}),
  };
}

export function createServerEvent<TPayload = unknown>(
  options: CreateServerEventOptions<TPayload>,
): ServerEvent<TPayload> {
  return {
    version: options.version ?? 1,
    eventId: options.eventId ?? createContractId('evt'),
    domain: options.domain,
    type: options.type,
    occurredAt: options.occurredAt ?? Date.now(),
    payload: options.payload,
    ...(options.commandId ? { commandId: options.commandId } : {}),
    ...(options.actorId ? { actorId: options.actorId } : {}),
    ...(options.serverRevision !== undefined ? { serverRevision: options.serverRevision } : {}),
    ...(options.traceId ? { traceId: options.traceId } : {}),
  };
}

export function createStateDelta<TValue = unknown>(
  options: CreateStateDeltaOptions<TValue>,
): StateDelta<TValue> {
  return {
    version: options.version ?? 1,
    deltaId: options.deltaId ?? createContractId('delta'),
    domain: options.domain,
    path: options.path,
    op: options.op,
    serverRevision: options.serverRevision,
    changedAt: options.changedAt ?? Date.now(),
    ...(options.entityId ? { entityId: options.entityId } : {}),
    ...(options.commandId ? { commandId: options.commandId } : {}),
    ...('value' in options ? { value: options.value } : {}),
  };
}

export function createSnapshotAck(options: CreateSnapshotAckOptions): SnapshotAck {
  return {
    version: options.version ?? 1,
    ackId: options.ackId ?? createContractId('ack'),
    snapshotId: options.snapshotId,
    kind: options.kind,
    acceptedAt: options.acceptedAt ?? Date.now(),
    ...(options.worldId ? { worldId: options.worldId } : {}),
    ...(options.playerId ? { playerId: options.playerId } : {}),
    ...(options.roomId ? { roomId: options.roomId } : {}),
    ...(options.serverRevision !== undefined ? { serverRevision: options.serverRevision } : {}),
    ...(options.domains ? { domains: options.domains } : {}),
  };
}
