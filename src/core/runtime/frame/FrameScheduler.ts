import {
  FRAME_PHASES,
  type FrameCallback,
  type FramePhase,
  type FramePhaseMetrics,
  type FrameSubscriptionOptions,
} from './types';
import { createErrorReportState, reportThrottled, type ErrorReportState } from '../../utils/reportError';

type FrameEntry = {
  callback: FrameCallback;
  order: number;
  sequence: number;
  throttleMs: number;
  lastRunMs: number;
  enabled: (() => boolean) | undefined;
  label: string;
  active: boolean;
  errors: ErrorReportState;
};

function compareEntries(a: FrameEntry, b: FrameEntry): number {
  return a.order - b.order || a.sequence - b.sequence;
}

export const POST_PHYSICS_PHASE_INDEX = FRAME_PHASES.indexOf('postPhysics');

export class FrameScheduler {
  private readonly phases = new Map<FramePhase, FrameEntry[]>();
  private readonly metrics = new Map<FramePhase, FramePhaseMetrics>();
  private sequence = 0;
  private ticking = false;
  private needsCompaction = false;
  private metricsEnabled = false;
  private readonly hosts: object[] = [];
  private generation = 0;
  private frameNumber = 0;
  private lastPhaseIndex = Number.POSITIVE_INFINITY;

  constructor() {
    FRAME_PHASES.forEach((phase) => {
      this.phases.set(phase, []);
      this.metrics.set(phase, { calls: 0, totalMs: 0, lastMs: 0 });
    });
  }

  add(phase: FramePhase, callback: FrameCallback, options: FrameSubscriptionOptions = {}): () => void {
    const entries = this.phases.get(phase);
    if (!entries) throw new Error(`[FrameScheduler Error]: 알 수 없는 프레임 단계 ${phase}`);
    const entry: FrameEntry = {
      callback,
      order: options.order ?? 0,
      sequence: this.sequence++,
      throttleMs: Math.max(0, options.throttleMs ?? 0),
      lastRunMs: Number.NEGATIVE_INFINITY,
      enabled: options.enabled,
      label: options.label ?? phase,
      active: true,
      errors: createErrorReportState(),
    };
    if (this.ticking) {
      entries.push(entry);
      this.needsCompaction = true;
    } else {
      entries.push(entry);
      entries.sort(compareEntries);
    }
    return () => {
      if (!entry.active) return;
      entry.active = false;
      if (this.ticking) {
        this.needsCompaction = true;
        return;
      }
      this.compactPhase(entries);
    };
  }

  tick(delta: number, elapsedMs: number): void {
    for (let p = 0; p < FRAME_PHASES.length; p++) this.tickPhase(p, delta, elapsedMs);
  }

  tickBeforePhysics(delta: number, elapsedMs: number): void {
    for (let p = 0; p < POST_PHYSICS_PHASE_INDEX; p++) this.tickPhase(p, delta, elapsedMs);
  }

  tickAfterPhysics(delta: number, elapsedMs: number): void {
    for (let p = POST_PHYSICS_PHASE_INDEX; p < FRAME_PHASES.length; p++) this.tickPhase(p, delta, elapsedMs);
  }

  tickPhase(phaseIndex: number, delta: number, elapsedMs: number): void {
    const phase = FRAME_PHASES[phaseIndex];
    if (!phase) return;
    // A phase at or before the previous one starts a new frame, including partial tick drivers.
    if (phaseIndex <= this.lastPhaseIndex) this.frameNumber++;
    this.lastPhaseIndex = phaseIndex;
    const entries = this.phases.get(phase)!;
    if (entries.length === 0) return;
    this.ticking = true;
    try {
      const startedAt = this.metricsEnabled ? performance.now() : 0;
      const count = entries.length;
      for (let i = 0; i < count; i++) {
        this.runEntry(entries[i]!, delta, elapsedMs);
      }
      if (this.metricsEnabled) this.recordMetrics(phase, performance.now() - startedAt);
    } finally {
      this.ticking = false;
    }
    if (this.needsCompaction) {
      this.needsCompaction = false;
      this.phases.forEach((entries) => {
        this.compactPhase(entries);
        entries.sort(compareEntries);
      });
    }
  }

  private runEntry(entry: FrameEntry, delta: number, elapsedMs: number): void {
    if (!entry.active) return;
    if (entry.enabled && !entry.enabled()) return;
    if (entry.throttleMs > 0) {
      if (elapsedMs >= entry.lastRunMs && elapsedMs - entry.lastRunMs < entry.throttleMs) return;
      entry.lastRunMs = elapsedMs;
    }
    try {
      entry.callback(delta, elapsedMs);
    } catch (error) {
      // Like Unity's Update, a throwing callback keeps running next frame; reports are rate-limited per entry.
      reportThrottled(entry.errors, elapsedMs, error, { source: 'frame', label: entry.label });
    }
  }

  private compactPhase(entries: FrameEntry[]): void {
    let write = 0;
    for (let read = 0; read < entries.length; read++) {
      const entry = entries[read]!;
      if (entry.active) entries[write++] = entry;
    }
    entries.length = write;
  }

  private recordMetrics(phase: FramePhase, elapsed: number): void {
    const metrics = this.metrics.get(phase)!;
    metrics.calls++;
    metrics.totalMs += elapsed;
    metrics.lastMs = elapsed;
  }

  attachHost(token: object): () => void {
    this.hosts.push(token);
    return () => {
      const index = this.hosts.indexOf(token);
      if (index >= 0) this.hosts.splice(index, 1);
    };
  }

  hasHost(): boolean {
    return this.hosts.length > 0;
  }

  hostCount(): number {
    return this.hosts.length;
  }

  isTickOwner(token: object): boolean {
    return this.hosts[0] === token;
  }

  /** Increments once per ticked frame; readers use it to share per-frame work. */
  getFrame(): number {
    return this.frameNumber;
  }

  getGeneration(): number {
    return this.generation;
  }

  setMetricsEnabled(enabled: boolean): void {
    this.metricsEnabled = enabled;
  }

  isMetricsEnabled(): boolean {
    return this.metricsEnabled;
  }

  getMetrics(phase: FramePhase): Readonly<FramePhaseMetrics> {
    return this.metrics.get(phase)!;
  }

  resetMetrics(): void {
    this.metrics.forEach((metrics) => {
      metrics.calls = 0;
      metrics.totalMs = 0;
      metrics.lastMs = 0;
    });
  }

  count(phase?: FramePhase): number {
    let total = 0;
    this.phases.forEach((entries, entryPhase) => {
      if (phase && entryPhase !== phase) return;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i]!.active) total++;
      }
    });
    return total;
  }

  clear(): void {
    this.generation++;
    this.phases.forEach((entries) => {
      entries.forEach((entry) => {
        entry.active = false;
      });
      if (!this.ticking) entries.length = 0;
    });
    if (this.ticking) this.needsCompaction = true;
  }
}

export const frameScheduler = new FrameScheduler();
