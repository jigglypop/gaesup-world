import type { NetworkAdapter, NetworkAdapterEventName, NetworkAdapterEvents, NetworkAdapterUnsubscribe, NetworkMessageEnvelope, NetworkRoomSession } from './types';
export declare class MockNetworkAdapter implements NetworkAdapter {
    private session;
    private readonly handlers;
    connect(session: NetworkRoomSession): Promise<void>;
    disconnect(): Promise<void>;
    send<TPayload>(message: NetworkMessageEnvelope<TPayload>): Promise<void>;
    on<TEvent extends NetworkAdapterEventName>(eventName: TEvent, handler: (event: NetworkAdapterEvents[TEvent]) => void): NetworkAdapterUnsubscribe;
    private emit;
}
