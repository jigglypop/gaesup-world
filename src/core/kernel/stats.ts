/** `cumulative` sources report the change since the last `reset`; `gauge` sources report the current value. */
export type StatKind = 'cumulative' | 'gauge';

/** Hot paths keep the handle and do `counter.value += n`; nothing allocates per increment. */
export type StatCounter = { value: number };

export type EngineStatsSnapshot = Readonly<Record<string, number>>;

type Source = { read: () => number; kind: StatKind; base: number };

/**
 * Integer engine counters for the acceptance runner, tests and debug HUDs. Values that already exist elsewhere
 * (a clock's tick count, a scheduler's frame number) are registered as sources and read only on `snapshot`.
 */
export class EngineStats {
  private readonly counters = new Map<string, StatCounter>();
  private readonly sources = new Map<string, Source>();

  counter(name: string): StatCounter {
    if (this.sources.has(name)) throw new Error(`Engine stat is already a source: ${name}`);
    let counter = this.counters.get(name);
    if (!counter) this.counters.set(name, (counter = { value: 0 }));
    return counter;
  }

  /** Registers a value read at snapshot time. A later registration under the same name replaces it. */
  source(name: string, read: () => number, kind: StatKind = 'cumulative'): () => void {
    if (this.counters.has(name)) throw new Error(`Engine stat is already a counter: ${name}`);
    const source: Source = { read, kind, base: kind === 'cumulative' ? read() : 0 };
    this.sources.set(name, source);
    return () => {
      if (this.sources.get(name) === source) this.sources.delete(name);
    };
  }

  snapshot(): EngineStatsSnapshot {
    const out: Record<string, number> = {};
    for (const [name, counter] of this.counters) out[name] = counter.value;
    for (const [name, source] of this.sources) out[name] = source.kind === 'cumulative' ? source.read() - source.base : source.read();
    return out;
  }

  /** Starts a new measurement window: counters return to zero and cumulative sources count from here. */
  reset(): void {
    for (const counter of this.counters.values()) counter.value = 0;
    for (const source of this.sources.values()) if (source.kind === 'cumulative') source.base = source.read();
  }
}
