import type { NetworkAuthorityMessageType } from './contracts';

export type NetworkMessageEnvelope<TPayload = unknown> = {
  version: number;
  type: string;
  roomId?: string;
  playerId?: string;
  traceId?: string;
  sentAt: number;
  payload: TPayload;
};

export type NetworkRoomSession = {
  roomId: string;
  playerId: string;
};

export type NetworkAdapterEvents = {
  message: NetworkMessageEnvelope;
  connected: NetworkRoomSession;
  disconnected: NetworkRoomSession;
  error: Error;
};

export type NetworkAdapterEventName = keyof NetworkAdapterEvents;

export type NetworkAdapterUnsubscribe = () => void;

export type NetworkAdapter = {
  connect: (session: NetworkRoomSession) => Promise<void>;
  disconnect: () => Promise<void>;
  send: <TPayload>(message: NetworkMessageEnvelope<TPayload>) => Promise<void>;
  on: <TEvent extends NetworkAdapterEventName>(
    eventName: TEvent,
    handler: (event: NetworkAdapterEvents[TEvent]) => void,
  ) => NetworkAdapterUnsubscribe;
};

export type NetworkMessageType =
  | 'room.join'
  | 'room.leave'
  | 'avatar.position'
  | 'chat.message'
  | 'emote.play'
  | 'interaction.trigger'
  | 'world.visitSnapshot'
  | 'ledger.command'
  | NetworkAuthorityMessageType;

export type AvatarPositionPayload = {
  position: [number, number, number];
  rotation?: [number, number, number];
  animation?: string;
};

export type ChatMessagePayload = {
  text: string;
  channel?: string;
};

export type NetworkInteractionPayload = {
  targetId: string;
  action: string;
  data?: Record<string, unknown>;
};

export type LedgerCommandPayload = {
  commandId: string;
  actorId: string;
  type: string;
  amount?: number;
  itemId?: string;
  metadata?: Record<string, unknown>;
};

export function createNetworkEnvelope<TPayload>(
  type: NetworkMessageType,
  payload: TPayload,
  options: Partial<Omit<NetworkMessageEnvelope<TPayload>, 'type' | 'payload' | 'sentAt'>> = {},
): NetworkMessageEnvelope<TPayload> {
  return {
    version: options.version ?? 1,
    type,
    sentAt: Date.now(),
    payload,
    ...(options.roomId ? { roomId: options.roomId } : {}),
    ...(options.playerId ? { playerId: options.playerId } : {}),
    ...(options.traceId ? { traceId: options.traceId } : {}),
  };
}
