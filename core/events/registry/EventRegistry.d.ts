import type { GameTime } from '../../time/types';
import type { EventDef, EventId } from '../types';
export declare function isEventActive(def: EventDef, time: GameTime): boolean;
declare class EventRegistry {
    private defs;
    register(def: EventDef): void;
    registerAll(defs: EventDef[]): void;
    get(id: EventId): EventDef | undefined;
    has(id: EventId): boolean;
    all(): EventDef[];
    clear(): void;
    resolveActive(time: GameTime): EventId[];
    resolveTags(time: GameTime): Set<string>;
}
export declare function getEventRegistry(): EventRegistry;
export type { EventRegistry };
