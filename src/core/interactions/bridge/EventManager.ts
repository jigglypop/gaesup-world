import { BridgeEvent } from './types';

export class EventManager<TState> {
  private subscribers: Set<(state: TState) => void> = new Set();
  private eventQueue: BridgeEvent[] = [];
  private readonly maxQueueSize: number;

  constructor(maxQueueSize: number = 500) {
    this.maxQueueSize = maxQueueSize;
  }

  subscribe(callback: (state: TState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(state: TState): void {
    this.subscribers.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Event notification error:', error);
      }
    });
  }

  queueEvent(event: BridgeEvent): void {
    this.eventQueue.push(event);
    if (this.eventQueue.length > this.maxQueueSize) {
      this.eventQueue.shift();
    }
  }

  getEvents(): BridgeEvent[] {
    return [...this.eventQueue];
  }

  clearEvents(): void {
    this.eventQueue = [];
  }

  dispose(): void {
    this.subscribers.clear();
    this.eventQueue = [];
  }
} 