import type { EventBus, EventHandler, EventUnsubscribe } from './types';
import { reportError, type ErrorReporter } from '../utils/reportError';

/** An `InMemoryEventBus` whose event names and payloads come from one event map. */
export type TypedEventBus<Events extends Record<string, unknown>> = {
  on<K extends keyof Events & string>(eventName: K, handler: EventHandler<Events[K]>): EventUnsubscribe;
  once<K extends keyof Events & string>(eventName: K, handler: EventHandler<Events[K]>): EventUnsubscribe;
  off<K extends keyof Events & string>(eventName: K, handler: EventHandler<Events[K]>): void;
  emit<K extends keyof Events & string>(eventName: K, payload: Events[K]): void;
  clear(eventName?: keyof Events & string): void;
};

export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();

  /** `report` receives what a handler throws; a runtime's bus reports to that runtime. */
  constructor(private readonly report: ErrorReporter = reportError) {}

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

  /** Each handler runs isolated: one that throws is reported and the rest still receive the event. */
  emit<TPayload = unknown>(eventName: string, payload: TPayload): void {
    const handlers = this.handlers.get(eventName);
    if (!handlers) return;

    for (const handler of Array.from(handlers)) {
      try {
        (handler as EventHandler<TPayload>)(payload);
      } catch (error) {
        this.report(error, { source: 'event-bus', label: eventName });
      }
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

