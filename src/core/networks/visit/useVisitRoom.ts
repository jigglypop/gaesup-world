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
  /** Remote domain keys to apply locally. Defaults to `DEFAULT_VISIT_DOMAINS`. */
  allowedDomains?: readonly string[];
};

export type VisitRoomController = {
  /** Most recent snapshot received from another host, when present. */
  remoteSnapshot: VisitSnapshot | null;
  /** Last snapshot we published locally, useful for diagnostics. */
  lastPublished: VisitSnapshot | null;
  /** Capture and broadcast local state. Capture or send failures throw without updating lastPublished. */
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

  const session = useMemo(() => ({ channel, hostId }), [channel, hostId]);
  const activeSession = useRef<typeof session | null>(null);
  const [received, setReceived] = useState<{
    session: typeof session;
    snapshot: VisitSnapshot;
  } | null>(null);
  const [published, setPublished] = useState<{
    session: typeof session;
    snapshot: VisitSnapshot;
  } | null>(null);
  const remoteSnapshot = received?.session === session ? received.snapshot : null;
  const lastPublished = published?.session === session ? published.snapshot : null;

  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;
  const allowedRef = useRef(allowedDomains);
  allowedRef.current = allowedDomains;
  const autoApplyRef = useRef(autoApply);
  autoApplyRef.current = autoApply;

  useEffect(() => {
    activeSession.current = session;
    let active = true;
    const unsubscribe = channel.subscribe((event) => {
      if (!active) return;
      if (event.type === 'snapshot') {
        if (event.snapshot.hostId === hostId) return;
        setReceived({ session, snapshot: event.snapshot });
        if (autoApplyRef.current) {
          applyVisitSnapshot(bindingsRef.current, event.snapshot, {
            ...(allowedRef.current ? { allowedDomains: allowedRef.current } : {}),
          });
        }
      } else if (event.type === 'leave') {
        setReceived((prev) =>
          prev?.session === session && prev.snapshot.hostId === event.hostId ? null : prev,
        );
      }
    });
    return () => {
      active = false;
      activeSession.current = null;
      unsubscribe();
    };
  }, [channel, hostId, session]);

  const publishNow = useCallback((): VisitSnapshot => {
    const snapshot = serializeVisit(bindingsRef.current, {
      hostId,
      ...(hostName ? { hostName } : {}),
    });
    if (hostMode) channel.publish(snapshot);
    setPublished({ session, snapshot });
    return snapshot;
  }, [channel, hostId, hostName, hostMode, session]);

  const acceptRemote = useCallback((): boolean => {
    const snapshot = remoteSnapshot;
    if (!snapshot || activeSession.current !== session) return false;
    const result = applyVisitSnapshot(bindingsRef.current, snapshot, {
      ...(allowedRef.current ? { allowedDomains: allowedRef.current } : {}),
    });
    return result.applied.length > 0;
  }, [remoteSnapshot, session]);

  const dismissRemote = useCallback(() => {
    setReceived((prev) => (prev?.session === session ? null : prev));
  }, [session]);

  const announceLeave = useCallback(() => {
    channel.leave(hostId);
  }, [channel, hostId]);

  return useMemo<VisitRoomController>(
    () => ({
      remoteSnapshot,
      lastPublished,
      publishNow,
      acceptRemote,
      dismissRemote,
      announceLeave,
    }),
    [remoteSnapshot, lastPublished, publishNow, acceptRemote, dismissRemote, announceLeave],
  );
}
