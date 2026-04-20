import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { applyVisitSnapshot, serializeVisit } from './serializer';
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
  /** Most recent snapshot received from another host, if any. */
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
export function useVisitRoom(options: UseVisitRoomOptions): VisitRoomController {
  const {
    hostId,
    hostName,
    channel,
    bindings,
    hostMode = true,
    autoApply = false,
    allowedDomains,
  } = options;

  const [remoteSnapshot, setRemoteSnapshot] = useState<VisitSnapshot | null>(null);
  const [lastPublished, setLastPublished] = useState<VisitSnapshot | null>(null);

  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;
  const allowedRef = useRef(allowedDomains);
  allowedRef.current = allowedDomains;
  const autoApplyRef = useRef(autoApply);
  autoApplyRef.current = autoApply;

  useEffect(() => {
    const unsubscribe = channel.subscribe((event) => {
      if (event.type === 'snapshot') {
        if (event.snapshot.hostId === hostId) return;
        setRemoteSnapshot(event.snapshot);
        if (autoApplyRef.current) {
          applyVisitSnapshot(bindingsRef.current, event.snapshot, {
            allowedDomains: allowedRef.current,
          });
        }
      } else if (event.type === 'leave') {
        setRemoteSnapshot((prev) => (prev && prev.hostId === event.hostId ? null : prev));
      }
    });
    return () => { unsubscribe(); };
  }, [channel, hostId]);

  const publishNow = useCallback((): VisitSnapshot => {
    const snapshot = serializeVisit(bindingsRef.current, { hostId, hostName });
    if (hostMode) channel.publish(snapshot);
    setLastPublished(snapshot);
    return snapshot;
  }, [channel, hostId, hostName, hostMode]);

  const acceptRemote = useCallback((): boolean => {
    const snapshot = remoteSnapshot;
    if (!snapshot) return false;
    const result = applyVisitSnapshot(bindingsRef.current, snapshot, {
      allowedDomains: allowedRef.current,
    });
    return result.applied.length > 0;
  }, [remoteSnapshot]);

  const dismissRemote = useCallback(() => { setRemoteSnapshot(null); }, []);

  const announceLeave = useCallback(() => { channel.leave(hostId); }, [channel, hostId]);

  return useMemo<VisitRoomController>(() => ({
    remoteSnapshot,
    lastPublished,
    publishNow,
    acceptRemote,
    dismissRemote,
    announceLeave,
  }), [remoteSnapshot, lastPublished, publishNow, acceptRemote, dismissRemote, announceLeave]);
}
