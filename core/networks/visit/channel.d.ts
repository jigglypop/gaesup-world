import type { VisitChannel } from './types';
/**
 * In-memory `VisitChannel` suitable for unit tests, single-tab demos,
 * and as a fallback when no network transport is available. Snapshots
 * are not persisted across reloads.
 */
export declare function createLocalVisitChannel(): VisitChannel;
export type WebSocketTransport = {
    send: (data: string) => void;
    /**
     * Register a listener for raw incoming text frames. Should return an
     * unsubscribe function. Implementations are expected to filter to the
     * relevant message types upstream.
     */
    onMessage: (cb: (raw: string) => void) => () => void;
};
/**
 * Wraps text-based transports (typically a WebSocket) so visit-room
 * snapshots can be exchanged across the network using a stable wire
 * format. Listeners receive parsed events identical to the local
 * channel implementation.
 */
export declare function createWebSocketVisitChannel(transport: WebSocketTransport): VisitChannel;
