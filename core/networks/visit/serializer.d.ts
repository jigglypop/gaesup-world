import { type VisitBindingProvider, type VisitSnapshot } from './types';
import type { DomainBinding, SerializedDomainValue } from '../../save/types';
export type SerializeVisitOptions = {
    hostId: string;
    hostName?: string;
    /** World snapshot id. Defaults to `hostId` for backward-compatible visit rooms. */
    worldId?: string;
    /** Domain keys to include. Defaults to `DEFAULT_VISIT_DOMAINS`. */
    domains?: readonly string[];
    /** Snapshot schema version. Defaults to `1`. */
    version?: number;
    /** Capture time. Defaults to `Date.now()`. */
    savedAt?: number;
};
export type ApplyVisitOptions = {
    /** Restrict which domains in the snapshot are applied locally. */
    allowedDomains?: readonly string[];
    /**
     * Called for each domain right before its hydrate is invoked. Return
     * `false` to skip applying that domain.
     */
    filter?: (key: string, value: SerializedDomainValue) => boolean;
};
export declare function serializeVisit(provider: VisitBindingProvider, options: SerializeVisitOptions): VisitSnapshot;
export declare function applyVisitSnapshot(provider: VisitBindingProvider, snapshot: VisitSnapshot, options?: ApplyVisitOptions): {
    applied: string[];
    skipped: string[];
};
/**
 * Returns a `VisitBindingProvider` backed by a save system instance. Lets
 * visit-room piggyback on the same serializers used for autosave without
 * duplicating wiring.
 */
export declare function visitProviderFromSaveSystem(saveSystem: {
    getBindings: () => Iterable<DomainBinding>;
}): VisitBindingProvider;
