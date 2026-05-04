import { WORLD_SNAPSHOT_DOMAINS } from '../../platform';
import type { WorldSnapshot } from '../../platform';
import type { DomainBinding, SerializedDomainValue } from '../../save/types';

/**
 * Set of save-domain keys that are considered "shareable" when another
 * player visits this world. Building layouts, scene, character look,
 * farming plots, and audio settings are intentionally included; private
 * progression (mail, friendship, quests, wallet, inventory) is not.
 */
export const DEFAULT_VISIT_DOMAINS: readonly string[] = WORLD_SNAPSHOT_DOMAINS;

export type VisitDomainKey = (typeof DEFAULT_VISIT_DOMAINS)[number] | (string & {});

export type VisitSnapshot = Omit<WorldSnapshot, 'domains'> & {
  hostId: string;
  hostName?: string;
  /** Compatibility alias for `savedAt`. */
  capturedAt: number;
  domains: Record<string, SerializedDomainValue>;
};

export type VisitChannelEvent =
  | { type: 'snapshot'; snapshot: VisitSnapshot }
  | { type: 'leave'; hostId: string };

export type VisitChannel = {
  /** Publish a snapshot to all connected listeners. */
  publish(snapshot: VisitSnapshot): void;
  /** Notify listeners that the host left their room. */
  leave(hostId: string): void;
  /** Subscribe to channel events. Returns an unsubscribe function. */
  subscribe(listener: (event: VisitChannelEvent) => void): () => void;
  /** Tear down channel resources. */
  close(): void;
};

export type VisitBindingProvider = () => Iterable<DomainBinding>;
