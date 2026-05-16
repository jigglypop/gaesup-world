import type { GameTime } from '../../time/types';
import type { EventId, EventsSerialized } from '../types';
type State = {
    active: EventId[];
    startedAt: Record<EventId, number>;
    tags: Set<string>;
    refresh: (time: GameTime) => {
        started: EventId[];
        ended: EventId[];
    };
    isActive: (id: EventId) => boolean;
    hasTag: (tag: string) => boolean;
    serialize: () => EventsSerialized;
    hydrate: (data: EventsSerialized | null | undefined) => void;
};
export declare const useEventsStore: import("zustand").UseBoundStore<import("zustand").StoreApi<State>>;
export {};
