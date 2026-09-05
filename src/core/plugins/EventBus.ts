import type { EventBus, EventHandler, EventUnsubscribe } from './types';

export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();

  on<TPayload = unknown>(eventName: string, handler: EventHandler<TPayload>): EventUnsubscribe {
    const handlers = this.handlers.get(eventName) ?? new Set<EventHandler>();
    handlers.add(handler as EventHandler);
    this.handlers.set(eventName, handlers);
    return () => this.off(eventName, handler);
  }

  once<TPayload = unknown>(eventName: string, handler: EventHandler<TPayload>): EventUnsubscribe {
    const wrapped: EventHandler<TPayload> = (payload) => {
      this.off(eventName, wrapped);
      handler(payload);
    };
    return this.on(eventName, wrapped);
  }

  off<TPayload = unknown>(eventName: string, handler: EventHandler<TPayload>): void {
    const handlers = this.handlers.get(eventName);
    if (!handlers) return;
    handlers.delete(handler as EventHandler);
    if (handlers.size === 0) {
      this.handlers.delete(eventName);
    }
  }

  emit<TPayload = unknown>(eventName: string, payload: TPayload): void {
    const handlers = this.handlers.get(eventName);
    if (!handlers) return;

    for (const handler of Array.from(handlers)) {
      (handler as EventHandler<TPayload>)(payload);
    }
  }

  clear(eventName?: string): void {
    if (eventName === undefined) {
      this.handlers.clear();
      return;
    }
    this.handlers.delete(eventName);
  }
}

