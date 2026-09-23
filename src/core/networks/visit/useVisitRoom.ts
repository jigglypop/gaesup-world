import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  applyVisitSnapshot,
  captureVisitRestorePoint,
  serializeVisit,
  type VisitRestorePoint,
} from './serializer';
import {
  DEFAULT_VISIT_DOMAINS,
  type VisitBindingProvider,
  type VisitChannel,
  type VisitSnapshot,
} from './types';
import { suspendAutoSave } from '../../save/core/autoSaveSuspension';

type VisitIsolation = {
  hostId: string;
  restorePoint: VisitRestorePoint;
  releaseAutoSave: () => void;
};

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
  /**
   * Back up local domains and suspend autosave while a remote world is applied,
   * then restore them when the visit ends. Defaults to `true`.
   */
  isolateLocalWorld?: boolean;
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
  /** Restore the local world captured before the first remote apply. */
  leaveVisit: () => boolean;
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
    isolateLocalWorld = true,
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
  const isolateRef = useRef(isolateLocalWorld);
  isolateRef.current = isolateLocalWorld;
  const isolationRef = useRef<VisitIsolation | null>(null);

  const endIsolation = useCallback((): boolean => {
    const isolation = isolationRef.current;
    if (!isolation) return false;
    isolationRef.current = null;
    try {
      isolation.restorePoint.restore();
    } finally {
      isolation.releaseAutoSave();
    }
    return true;
  }, []);

  const applyRemote = useCallback((snapshot: VisitSnapshot): boolean => {
    const allowed = allowedRef.current;
    let startedIsolation = false;
    if (isolateRef.current && !isolationRef.current) {
      isolationRef.current = {
        hostId: snapshot.hostId,
        restorePoint: captureVisitRestorePoint(bindingsRef.current, allowed ?? DEFAULT_VISIT_DOMAINS),
        releaseAutoSave: suspendAutoSave(),
      };
      startedIsolation = true;
    }
    const result = applyVisitSnapshot(bindingsRef.current, snapshot, {
      ...(allowed ? { allowedDomains: allowed } : {}),
      atomic: true,
    });
    if (result.applied.length === 0 && startedIsolation) {
      const isolation = isolationRef.current;
      isolationRef.current = null;
      isolation?.releaseAutoSave();
    } else if (isolationRef.current) {
      isolationRef.current.hostId = snapshot.hostId;
    }
    return result.applied.length > 0;
  }, []);

  useEffect(() => {
    activeSession.current = session;
    let active = true;
    const unsubscribe = channel.subscribe((event) => {
      if (!active) return;
      if (event.type === 'snapshot') {
        if (event.snapshot.hostId === hostId) return;
        setReceived({ session, snapshot: event.snapshot });
        if (autoApplyRef.current) applyRemote(event.snapshot);
      } else if (event.type === 'leave') {
        if (isolationRef.current?.hostId === event.hostId) endIsolation();
        setReceived((prev) =>
          prev?.session === session && prev.snapshot.hostId === event.hostId ? null : prev,
        );
      }
    });
    return () => {
      active = false;
      activeSession.current = null;
      unsubscribe();
      endIsolation();
    };
  }, [applyRemote, channel, endIsolation, hostId, session]);

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
    return applyRemote(snapshot);
  }, [applyRemote, remoteSnapshot, session]);

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
      leaveVisit: endIsolation,
    }),
    [remoteSnapshot, lastPublished, publishNow, acceptRemote, dismissRemote, announceLeave, endIsolation],
  );
}
