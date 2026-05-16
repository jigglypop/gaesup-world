import type { EventBus, EventHandler, EventUnsubscribe } from './types';
export declare class InMemoryEventBus implements EventBus {
    private readonly handlers;
    on<TPayload = unknown>(eventName: string, handler: EventHandler<TPayload>): EventUnsubscribe;
    once<TPayload = unknown>(eventName: string, handler: EventHandler<TPayload>): EventUnsubscribe;
    off<TPayload = unknown>(eventName: string, handler: EventHandler<TPayload>): void;
    emit<TPayload = unknown>(eventName: string, payload: TPayload): void;
    clear(eventName?: string): void;
}
