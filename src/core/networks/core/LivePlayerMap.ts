import type { PlayerState } from '../types';

type Listener = () => void;

type Channel = {
  latest: Map<string, PlayerState>;
  listeners: Map<string, Set<Listener>>;
};

/**
 * Remote players keyed by id. The map identity changes only when players join or leave;
 * transform updates replace the entry in place and notify that player's subscribers only,
 * so a 20 Hz network stream re-renders one remote avatar instead of the whole scene tree.
 * Copies made for membership changes share subscriptions and the latest published states.
 */
export class LivePlayerMap extends Map<string, PlayerState> {
  private readonly channel: Channel;

  constructor(source?: LivePlayerMap | Iterable<readonly [string, PlayerState]>) {
    super(source ?? []);
    this.channel = source instanceof LivePlayerMap
      ? source.channel
      : { latest: new Map(this), listeners: new Map() };
  }

  override get(id: string): PlayerState | undefined {
    if (!super.has(id)) return undefined;
    return this.channel.latest.get(id) ?? super.get(id);
  }

  override set(id: string, state: PlayerState): this {
    super.set(id, state);
    // Map's constructor calls set() before the channel exists.
    this.channel?.latest.set(id, state);
    return this;
  }

  override delete(id: string): boolean {
    const removed = super.delete(id);
    if (removed) this.channel.latest.delete(id);
    return removed;
  }

  override clear(): void {
    for (const id of super.keys()) this.channel.latest.delete(id);
    super.clear();
  }

  /** Replace a member's state without changing map identity. Returns false for non-members. */
  publish(id: string, state: PlayerState): boolean {
    if (!super.has(id)) return false;
    this.set(id, state);
    this.notify(id);
    return true;
  }

  subscribePlayer(id: string, listener: Listener): () => void {
    let listeners = this.channel.listeners.get(id);
    if (!listeners) {
      listeners = new Set();
      this.channel.listeners.set(id, listeners);
    }
    listeners.add(listener);
    return () => {
      const current = this.channel.listeners.get(id);
      if (!current) return;
      current.delete(listener);
      if (current.size === 0) this.channel.listeners.delete(id);
    };
  }

  notify(id: string): void {
    const listeners = this.channel.listeners.get(id);
    if (!listeners) return;
    for (const listener of [...listeners]) listener();
  }
}

export function isLivePlayerMap(value: ReadonlyMap<string, PlayerState>): value is LivePlayerMap {
  return value instanceof LivePlayerMap;
}
