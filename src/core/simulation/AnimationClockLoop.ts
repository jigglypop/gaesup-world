import type { FixedStepClock } from './FixedStepClock';

export type AnimationFrameSource = { request: (callback: FrameRequestCallback) => number; cancel: (id: number) => void };

/** Reference-counted presentation driver: one RAF callback regardless of the number of consumers. */
export class AnimationClockLoop {
  private references = 0;
  private handle: number | null = null;
  private lastTimestamp: number | null = null;
  private generation = 0;
  private leaseGeneration = 0;
  private suspended = false;

  constructor(readonly clock: FixedStepClock, private readonly frames: AnimationFrameSource = {
    request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id),
  }) {}

  get consumerCount(): number { return this.references; }
  get ownerCount(): number { return this.handle === null ? 0 : 1; }

  acquire(): () => void {
    if (++this.references === 1 && !this.suspended) {
      this.lastTimestamp = null;
      this.schedule();
    }
    const generation = this.leaseGeneration;
    let released = false;
    return () => {
      if (released || generation !== this.leaseGeneration) return;
      released = true;
      if (--this.references === 0) this.cancelFrame();
    };
  }

  stop(): void {
    this.references = 0;
    this.leaseGeneration++;
    this.cancelFrame();
  }

  /** Runtime deactivation preserves mounted consumers so setup can resume them without a remount. */
  suspend(): void {
    this.suspended = true;
    this.cancelFrame();
  }

  resume(): void {
    if (!this.suspended) return;
    this.suspended = false;
    if (this.references) this.schedule();
  }

  private cancelFrame(): void {
    if (this.handle !== null) this.frames.cancel(this.handle);
    this.handle = null;
    this.lastTimestamp = null;
    this.generation++;
  }

  private schedule(): void {
    const generation = this.generation;
    this.handle = this.frames.request(timestamp => {
      if (generation === this.generation) this.frame(timestamp, generation);
    });
  }

  private frame(timestamp: number, generation: number): void {
    this.handle = null;
    if (!this.references || this.suspended) return;
    const previous = this.lastTimestamp;
    this.lastTimestamp = timestamp;
    try {
      if (previous !== null) this.clock.advance(Math.max(0, timestamp - previous) / 1000);
    } catch (error) { this.stop(); throw error; }
    if (this.references && !this.suspended && generation === this.generation && this.handle === null) this.schedule();
  }
}
