import type { VisitChannel, VisitChannelEvent, VisitSnapshot } from './types';

class LocalVisitChannelImpl implements VisitChannel {
  private listeners = new Set<(event: VisitChannelEvent) => void>();
  private latest: VisitSnapshot | null = null;

  publish(snapshot: VisitSnapshot): void {
    this.latest = snapshot;
    this.emit({ type: 'snapshot', snapshot });
  }

  leave(hostId: string): void {
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
   * relevant message types upstream.
   */
  onMessage: (cb: (raw: string) => void) => () => void;
};

const WIRE_VERSION = 1;
const SNAPSHOT_TYPE = 'VisitSnapshot';
const LEAVE_TYPE = 'VisitLeave';

type WireSnapshot = { type: typeof SNAPSHOT_TYPE; v: number; snapshot: VisitSnapshot };
type WireLeave = { type: typeof LEAVE_TYPE; v: number; hostId: string };
type WireMessage = WireSnapshot | WireLeave;

function tryParseWire(raw: string): WireMessage | null {
  try {
    const parsed = JSON.parse(raw) as Partial<WireMessage> | null;
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.type !== SNAPSHOT_TYPE && parsed.type !== LEAVE_TYPE) return null;
    if (typeof parsed.v !== 'number' || parsed.v !== WIRE_VERSION) return null;
    return parsed as WireMessage;
  } catch {
    return null;
  }
}

/**
 * Wraps any text-based transport (typically a WebSocket) so visit-room
 * snapshots can be exchanged across the network using a stable wire
 * format. Listeners receive parsed events identical to the local
 * channel implementation.
 */
export function createWebSocketVisitChannel(transport: WebSocketTransport): VisitChannel {
  const listeners = new Set<(event: VisitChannelEvent) => void>();
  let unsubscribe: (() => void) | null = transport.onMessage((raw) => {
    const msg = tryParseWire(raw);
    if (!msg) return;
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
      try { transport.send(JSON.stringify(wire)); } catch { /* drop */ }
    },
    leave(hostId) {
      const wire: WireLeave = { type: LEAVE_TYPE, v: WIRE_VERSION, hostId };
      try { transport.send(JSON.stringify(wire)); } catch { /* drop */ }
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
