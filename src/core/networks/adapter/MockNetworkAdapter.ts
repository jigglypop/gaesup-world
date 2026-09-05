import type {
  NetworkAdapter,
  NetworkAdapterEventName,
  NetworkAdapterEvents,
  NetworkAdapterUnsubscribe,
  NetworkMessageEnvelope,
  NetworkRoomSession,
} from './types';

export class MockNetworkAdapter implements NetworkAdapter {
  private session: NetworkRoomSession | null = null;
  private readonly handlers = new Map<NetworkAdapterEventName, Set<(event: never) => void>>();

  async connect(session: NetworkRoomSession): Promise<void> {
    this.session = session;
    this.emit('connected', session);
  }

  async disconnect(): Promise<void> {
    if (!this.session) return;
    const session = this.session;
    this.session = null;
    this.emit('disconnected', session);
  }

  async send<TPayload>(message: NetworkMessageEnvelope<TPayload>): Promise<void> {
    this.emit('message', message);
  }

  on<TEvent extends NetworkAdapterEventName>(
    eventName: TEvent,
    handler: (event: NetworkAdapterEvents[TEvent]) => void,
  ): NetworkAdapterUnsubscribe {
    const handlers = this.handlers.get(eventName) ?? new Set<(event: never) => void>();
    handlers.add(handler as (event: never) => void);
    this.handlers.set(eventName, handlers);
    return () => {
      handlers.delete(handler as (event: never) => void);
    };
  }

  private emit<TEvent extends NetworkAdapterEventName>(
    eventName: TEvent,
    event: NetworkAdapterEvents[TEvent],
  ): void {
    for (const handler of this.handlers.get(eventName) ?? []) {
      handler(event as never);
    }
  }
}
