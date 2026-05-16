import type { VisitBindingProvider, VisitChannel, VisitSnapshot } from './types';
export type UseVisitRoomOptions = {
    /** Stable identifier for the local player (used as `hostId`). */
    hostId: string;
    /** Optional display name shipped with each published snapshot. */
    hostName?: string;
    /** Backing transport. Use `createLocalVisitChannel()` for tests. */
    channel: VisitChannel;
    /** Returns the active set of save bindings to capture. */
    bindings: VisitBindingProvider;
    /**
     * If `true`, this peer will publish its own snapshot whenever
     * `publishNow()` is called. Defaults to `true`.
     */
    hostMode?: boolean;
    /**
     * If `true`, snapshots received for other hosts are immediately
     * applied to local stores. Defaults to `false` so visitors must
     * explicitly accept a visit before stores are mutated.
     */
    autoApply?: boolean;
    /** Domain keys to allow when applying remote snapshots. */
    allowedDomains?: readonly string[];
};
export type VisitRoomController = {
    /** Most recent snapshot received from another host, when present. */
    remoteSnapshot: VisitSnapshot | null;
    /** Last snapshot we published locally, useful for diagnostics. */
    lastPublished: VisitSnapshot | null;
    /** Capture the local world state and broadcast it via the channel. */
    publishNow: () => VisitSnapshot;
    /** Apply the most recently received snapshot to local stores. */
    acceptRemote: () => boolean;
    /** Drop the buffered remote snapshot without applying it. */
    dismissRemote: () => void;
    /** Notify other peers that we are leaving the room. */
    announceLeave: () => void;
};
/**
 * Lightweight hook that wires `serializeVisit` / `applyVisitSnapshot` to
 * a `VisitChannel`. The transport is intentionally pluggable so the
 * same coordinator works with the in-memory channel during tests, a
 * WebSocket bridge in production, or a future peer-to-peer transport.
 */
export declare function useVisitRoom(options: UseVisitRoomOptions): VisitRoomController;
