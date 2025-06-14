import { atom } from 'jotai';
import { EventPayload, EventType } from './types';

export const eventBusAtom = atom<EventPayload[]>([]);
export const publishEventAtom = atom(null, (get, set, event: Omit<EventPayload, 'timestamp'>) => {
  const currentEvents = get(eventBusAtom);
  const newEvent: EventPayload = {
    ...event,
    timestamp: Date.now(),
  };
  const updatedEvents = [...currentEvents, newEvent].slice(-100);
  set(eventBusAtom, updatedEvents as any);
});

export const createEventSubscriptionAtom = (eventType: EventType) =>
  atom((get) => {
    const events = get(eventBusAtom);
    return events.filter((event) => event.type === eventType);
  });
