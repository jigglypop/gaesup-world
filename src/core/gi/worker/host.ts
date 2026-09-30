import type { GiWorkerRequest, GiWorkerResponse } from './protocol';
import { attachGiWasm, createGiRuntime, packRuntimeAtlases } from '../components/GiVolume/runtime';
import type { GiRuntime } from '../components/GiVolume/types';
import { SETTLE_PASSES, scheduledProbeBudget } from '../core/probeSchedule';

/** One tick stands in for a 60 Hz frame, so `probesPerTick` keeps the meaning of GiVolume's probesPerFrame. */
export const GI_WORKER_TICK_MS = 16;
/** The first pass after a change runs four ticks' worth per tick: fresh light shows up in about a second. */
const FIRST_PASS_BOOST = 4;
/** A settled cache changes slowly; it is sent a quarter as often. */
const SETTLED_UPLOAD_FACTOR = 4;
/** Spare atlases kept for reuse; more would only hold memory. */
const SPARE_LIMIT = 4;

export type GiWorkerClock = {
  now: () => number;
  setTimeout: (callback: () => void, ms: number) => unknown;
  clearTimeout: (handle: unknown) => void;
};

type Post = (message: GiWorkerResponse, transfer: Transferable[]) => void;

const defaultClock: GiWorkerClock = {
  now: () => performance.now(),
  setTimeout: (callback, ms) => setTimeout(callback, ms),
  clearTimeout: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * The GI worker's state, kept apart from the worker global so tests can drive it: it owns the voxel grid and probe
 * cascade (the same runtime GiVolume uses on the main thread), traces probes on a timer and posts packed atlases.
 */
export class GiWorkerHost {
  private readonly post: Post;
  private readonly clock: GiWorkerClock;
  private runtime: GiRuntime | null = null;
  private module: WebAssembly.Module | null = null;
  private probesPerTick = 32;
  private uploadIntervalMs = 200;
  private lastUpload = Number.NEGATIVE_INFINITY;
  private timer: unknown = null;
  private disposed = false;
  private paused = false;

  constructor(post: Post, clock: GiWorkerClock = defaultClock) {
    this.post = post;
    this.clock = clock;
  }

  handle(message: GiWorkerRequest): void {
    if (this.disposed) return;
    switch (message.type) {
      case 'init':
        this.module = message.module;
        this.probesPerTick = message.probesPerTick;
        this.uploadIntervalMs = message.uploadIntervalMs;
        return;
      case 'scene': {
        const previous = this.runtime;
        const next = createGiRuntime(previous, message.boxes, message.params, message.environment);
        this.runtime = next;
        if (next && next === previous) next.cascade.setEnvironment(message.environment);
        // A newer scene may replace this runtime while the instance compiles; attaching to a dropped one is harmless.
        if (next && next !== previous && this.module) void attachGiWasm(next, this.module);
        this.lastUpload = Number.NEGATIVE_INFINITY;
        this.restart();
        return;
      }
      case 'environment':
        this.runtime?.cascade.setEnvironment(message.environment);
        this.restart();
        return;
      case 'pause':
        this.paused = message.paused;
        if (this.paused) this.stop();
        else this.schedule();
        return;
      case 'recycle': {
        const spare = this.runtime?.spareAtlases;
        if (!spare) return;
        for (const atlas of message.atlases) if (spare.length < SPARE_LIMIT) spare.push(atlas);
        return;
      }
      case 'dispose':
        this.disposed = true;
        this.stop();
        this.runtime = null;
        return;
    }
  }

  /** Runs one tick now; the timer calls it, and tests call it instead of waiting. */
  tick(): void {
    this.timer = null;
    const runtime = this.runtime;
    if (!runtime || this.disposed || this.paused) return;
    try {
      const { cascade } = runtime;
      cascade.update(scheduledProbeBudget(this.probesPerTick, cascade.passesSinceChange, FIRST_PASS_BOOST));
      const settled = cascade.passesSinceChange >= SETTLE_PASSES;
      const interval = this.uploadIntervalMs * (settled ? SETTLED_UPLOAD_FACTOR : 1);
      const now = this.clock.now();
      if (cascade.version !== runtime.uploadedVersion && now - this.lastUpload >= interval) {
        this.lastUpload = now;
        const levels = packRuntimeAtlases(runtime);
        this.post({ type: 'atlas', levels, usesWasm: cascade.usesWasm }, levels.map((level) => level.atlas.buffer as ArrayBuffer));
      }
    } catch (error) {
      // The page falls back to tracing on the main thread; a half-updated cache is not worth continuing.
      this.disposed = true;
      this.post({ type: 'error', message: describe(error) }, []);
      return;
    }
    this.schedule();
  }

  private restart(): void {
    this.stop();
    this.schedule();
  }

  private schedule(): void {
    if (this.timer !== null || !this.runtime || this.disposed || this.paused) return;
    this.timer = this.clock.setTimeout(() => this.tick(), GI_WORKER_TICK_MS);
  }

  private stop(): void {
    if (this.timer !== null) this.clock.clearTimeout(this.timer);
    this.timer = null;
  }
}
