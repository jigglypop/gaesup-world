import { StateCreator } from 'zustand';
import { EventPayload, EventType } from '../../types/core';
import { StoreState } from '../gaesupStore';

export interface EventSlice {
  events: EventPayload[];
  publishEvent: (event: Omit<EventPayload, 'timestamp'>) => void;
  subscribeEvent: (eventType: EventType) => EventPayload[];
}

export const createEventSlice: StateCreator<StoreState, [], [], EventSlice> = (set, get) => ({
  events: [],
  publishEvent: (event: Omit<EventPayload, 'timestamp'>) => {
    const newEvent: EventPayload = {
      ...event,
      timestamp: Date.now(),
    };
    set((state) => ({
      events: [...state.events, newEvent].slice(-100),
    }));
  },
  subscribeEvent: (eventType: EventType) => {
    return get().events.filter((event) => event.type === eventType);
  },
});
