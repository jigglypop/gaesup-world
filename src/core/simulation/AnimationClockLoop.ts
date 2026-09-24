import type { FixedStepClock } from './FixedStepClock';

export type AnimationFrameSource = { request: (callback: FrameRequestCallback) => number; cancel: (id: number) => void };
/** An external frame loop that advances the clock instead of the loop's own animation frame. */
export type ClockFrameDriver = { advance: (seconds: number) => void; release: () => void };
const browserFrames: AnimationFrameSource = {
  request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id),
};

/** Reference-counted presentation driver: one RAF callback regardless of the number of consumers. */
export class AnimationClockLoop {
  private references = 0;
  private handle: number | null = null;
  private lastTimestamp: number | null = null;
  private generation = 0;
  private leaseGeneration = 0;
  private suspended = false;
  private drivers: object[] = [];

  constructor(readonly clock: FixedStepClock, private readonly frames: AnimationFrameSource = browserFrames) {}

  get consumerCount(): number { return this.references; }
  get ownerCount(): number { return this.handle !== null || (this.drivers.length > 0 && this.references > 0) ? 1 : 0; }

  /**
   * Hands clock advancement to an external frame loop (the canvas), so fixed ticks run at a known point of the
   * rendered frame instead of in a separate animation frame. The first attached driver advances; the loop's own
   * animation frame stays off until every driver is released.
   */
  attachDriver(): ClockFrameDriver {
    const token = {};
    this.drivers.push(token);
    this.cancelFrame();
    let released = false;
    return {
      advance: seconds => {
        if (released || this.drivers[0] !== token || !this.references || this.suspended) return;
        this.clock.advance(seconds);
      },
      release: () => {
        if (released) return;
        released = true;
        this.drivers.splice(this.drivers.indexOf(token), 1);
        if (!this.drivers.length && this.references && !this.suspended) this.schedule();
      },
    };
  }

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
    if (this.drivers.length) return;
    // A headless runtime retains system/consumer ownership and advances explicitly, without browser timers.
    if (this.frames === browserFrames && (typeof requestAnimationFrame !== 'function' || typeof cancelAnimationFrame !== 'function')) return;
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
