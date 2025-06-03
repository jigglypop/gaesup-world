import { useEffect, useRef } from 'react';
import { AnyEventCallback, EventCallback, EventPayload, EventType } from './type';

class EventBusManager {
  private element: EventTarget;
  private listeners: Map<string, AnyEventCallback> = new Map();
  constructor() {
    this.element = new EventTarget();
  }
  on<T extends EventType>(eventType: T, callback: EventCallback<T>): () => void {
    const wrappedCallback = (event: Event) => {
      const customEvent = event as CustomEvent<EventPayload[T]>;
      callback(customEvent.detail);
    };
    const listenerId = `${eventType}_${Date.now()}_${Math.random()}`;
    this.listeners.set(listenerId, wrappedCallback);
    this.element.addEventListener(eventType, wrappedCallback);
    return () => {
      this.element.removeEventListener(eventType, wrappedCallback);
      this.listeners.delete(listenerId);
    };
  }
  dispatch<T extends EventType>(eventType: T, payload: EventPayload[T]): void {
    const event = new CustomEvent(eventType, {
      detail: payload,
      bubbles: false,
      cancelable: false,
    });

    this.element.dispatchEvent(event);
  }
  once<T extends EventType>(eventType: T, callback: EventCallback<T>): void {
    const unsubscribe = this.on(eventType, (payload) => {
      callback(payload);
      unsubscribe();
    });
  }
  clear(): void {
    this.listeners.forEach((callback, listenerId) => {
      const [eventType] = listenerId.split('_');
      this.element.removeEventListener(eventType, callback);
    });
    this.listeners.clear();
  }
  getStats() {
    return {
      totalListeners: this.listeners.size,
      listeners: Array.from(this.listeners.keys()),
    };
  }
}

export const EventBus = new EventBusManager();
export function useEventBus<T extends EventType>(
  eventType: T,
  callback: EventCallback<T>,
  deps: React.DependencyList = [],
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const unsubscribe = EventBus.on(eventType, (payload) => {
      callbackRef.current(payload);
    });

    return unsubscribe;
  }, [eventType, ...deps]);
}

export default EventBus;
