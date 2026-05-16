import { BridgeEvent } from './types';
export declare class EventManager<TState> {
    private subscribers;
    private eventQueue;
    private readonly maxQueueSize;
    constructor(maxQueueSize?: number);
    subscribe(callback: (state: TState) => void): () => void;
    notify(state: TState): void;
    queueEvent(event: BridgeEvent): void;
    getEvents(): BridgeEvent[];
    clearEvents(): void;
    dispose(): void;
}
