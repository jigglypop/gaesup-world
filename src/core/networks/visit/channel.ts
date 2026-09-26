import type { VisitChannel, VisitChannelEvent, VisitSnapshot } from './types';
import { isRecord } from '../../utils/guards';
import { MAX_REMOTE_WIRE_MESSAGE_LENGTH, MAX_VISIT_SNAPSHOT_DOMAINS } from '../core/remoteInputLimits';

class LocalVisitChannelImpl implements VisitChannel {
  private listeners = new Set<(event: VisitChannelEvent) => void>();
  private latest: VisitSnapshot | null = null;

  publish(snapshot: VisitSnapshot): void {
    this.latest = snapshot;
    this.emit({ type: 'snapshot', snapshot });
  }

  leave(hostId: string): void {
    if (this.latest?.hostId === hostId) this.latest = null;
    this.emit({ type: 'leave', hostId });
  }

  subscribe(listener: (event: VisitChannelEvent) => void): () => void {
    this.listeners.add(listener);
    if (this.latest) {
      try { listener({ type: 'snapshot', snapshot: this.latest }); }
      catch { /* swallow listener errors */ }
    }
    return () => { this.listeners.delete(listener); };
  }

  close(): void {
    this.listeners.clear();
    this.latest = null;
  }

  private emit(event: VisitChannelEvent): void {
    for (const listener of this.listeners) {
      try { listener(event); } catch { /* keep iterating */ }
    }
  }
}

/**
 * In-memory `VisitChannel` suitable for unit tests, single-tab demos,
 * and as a fallback when no network transport is available. Snapshots
 * are not persisted across reloads.
 */
export function createLocalVisitChannel(): VisitChannel {
  return new LocalVisitChannelImpl();
}

export type WebSocketTransport = {
  send: (data: string) => void;
  /**
   * Register a listener for raw incoming text frames. Should return an
   * unsubscribe function. Implementations are expected to filter to the
   * relevant message types upstream. Pass `senderId`, the peer the relay
   * authenticated as the frame's sender, so only a room's host can publish
   * or close it; without it the channel cannot tell a host from an impostor.
   */
  onMessage: (cb: (raw: string, senderId?: string) => void) => () => void;
};

const WIRE_VERSION = 1;
const SNAPSHOT_TYPE = 'VisitSnapshot';
const LEAVE_TYPE = 'VisitLeave';

type WireSnapshot = { type: typeof SNAPSHOT_TYPE; v: number; snapshot: VisitSnapshot };
type WireLeave = { type: typeof LEAVE_TYPE; v: number; hostId: string };
type WireMessage = WireSnapshot | WireLeave;

function isIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isVisitSnapshot(value: unknown): value is VisitSnapshot {
  return isRecord(value)
    && value['kind'] === 'world'
    && isIdentifier(value['worldId'])
    && isIdentifier(value['hostId'])
    && (value['hostName'] === undefined || typeof value['hostName'] === 'string')
    && typeof value['version'] === 'number'
    && Number.isInteger(value['version'])
    && value['version'] >= 1
    && isTimestamp(value['savedAt'])
    && isTimestamp(value['capturedAt'])
    && isRecord(value['domains'])
    && Object.keys(value['domains']).length <= MAX_VISIT_SNAPSHOT_DOMAINS;
}

function tryParseWire(raw: string): WireMessage | null {
  if (raw.length > MAX_REMOTE_WIRE_MESSAGE_LENGTH) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed['v'] !== WIRE_VERSION) return null;
    if (parsed['type'] === SNAPSHOT_TYPE && isVisitSnapshot(parsed['snapshot'])) {
      return { type: SNAPSHOT_TYPE, v: WIRE_VERSION, snapshot: parsed['snapshot'] };
    }
    if (parsed['type'] === LEAVE_TYPE && isIdentifier(parsed['hostId'])) {
      return { type: LEAVE_TYPE, v: WIRE_VERSION, hostId: parsed['hostId'] };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Wraps text-based transports (typically a WebSocket) so visit-room
 * snapshots can be exchanged across the network using a stable wire
 * format. Listeners receive parsed events identical to the local
 * channel implementation.
 */
export function createWebSocketVisitChannel(transport: WebSocketTransport): VisitChannel {
  const listeners = new Set<(event: VisitChannelEvent) => void>();
  let unsubscribe: (() => void) | null = transport.onMessage((raw, senderId) => {
    const msg = tryParseWire(raw);
    if (!msg) return;
    const hostId = msg.type === SNAPSHOT_TYPE ? msg.snapshot.hostId : msg.hostId;
    if (senderId !== undefined && senderId !== hostId) return;
    if (msg.type === SNAPSHOT_TYPE) {
      emit({ type: 'snapshot', snapshot: msg.snapshot });
    } else if (msg.type === LEAVE_TYPE) {
      emit({ type: 'leave', hostId: msg.hostId });
    }
  });

  function emit(event: VisitChannelEvent): void {
    for (const listener of listeners) {
      try { listener(event); } catch { /* keep iterating */ }
    }
  }

  return {
    publish(snapshot) {
      const wire: WireSnapshot = { type: SNAPSHOT_TYPE, v: WIRE_VERSION, snapshot };
      transport.send(JSON.stringify(wire));
    },
    leave(hostId) {
      const wire: WireLeave = { type: LEAVE_TYPE, v: WIRE_VERSION, hostId };
      transport.send(JSON.stringify(wire));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    close() {
      if (unsubscribe) {
        try { unsubscribe(); } catch { /* ignore */ }
        unsubscribe = null;
      }
      listeners.clear();
    },
  };
}
