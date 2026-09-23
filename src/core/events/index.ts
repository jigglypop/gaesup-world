export type {
  EventId,
  EventTrigger,
  EventDef,
  EventState,
  EventsSerialized,
} from './types';
export {
  createEventsPlugin,
  eventsPlugin,
  hydrateEventsState,
  serializeEventsState,
} from './plugin';
export type { EventsPluginOptions } from './plugin';
export { getEventRegistry, isEventActive } from './registry/EventRegistry';
export type { EventRegistry } from './registry/EventRegistry';
export { useEventsStore, useEventsStoreApi, createEventsStore } from './stores/eventsStore';
export { useEventsTicker } from './hooks/useEventsTicker';
export type { EventsTickerOptions } from './hooks/useEventsTicker';
export { EventsHUD } from './components/EventsHUD';
export type { EventsHUDProps } from './components/EventsHUD';
export { SEED_EVENTS, registerSeedEvents } from './data/events';

export type { EventsStore } from './stores/eventsStore';
