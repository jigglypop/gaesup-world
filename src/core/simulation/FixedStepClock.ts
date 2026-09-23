export const SIMULATION_PHASES = ['commands', 'simulation', 'physics', 'postSimulation', 'publish'] as const;
export type SimulationPhase = typeof SIMULATION_PHASES[number];
export type FixedTick = { tick: number; deltaSeconds: number; elapsedSeconds: number };
export type ClockSystem = { id: string; phase: SimulationPhase; priority?: number; update: (tick: FixedTick) => void };
type Registration = { system: ClockSystem; owner: object; references: number; order: number; active: boolean };

/** Pure fixed-step scheduler shared by rendered and headless world drivers. No browser timer ownership. */
export class FixedStepClock {
  readonly deltaSeconds: number;
  private readonly maxSubSteps: number;
  private readonly maxFrameSeconds: number;
  private registrations = new Map<string, Registration>();
  private ordered: Registration[] = [];
  private nextOrder = 0;
  private accumulator = 0;
  private advancing = false;
  private tickNumber = 0;
  private droppedSeconds = 0;

  constructor(options: { tickRate?: number; maxSubSteps?: number; maxFrameSeconds?: number } = {}) {
    const rate = options.tickRate ?? 60;
    this.maxSubSteps = options.maxSubSteps ?? 8;
    this.maxFrameSeconds = options.maxFrameSeconds ?? 0.25;
    if (!Number.isFinite(rate) || rate <= 0 || !Number.isSafeInteger(this.maxSubSteps) || this.maxSubSteps < 1
      || !Number.isFinite(this.maxFrameSeconds) || this.maxFrameSeconds <= 0) throw new RangeError('Invalid fixed clock configuration');
    this.deltaSeconds = 1 / rate;
    if (!Number.isFinite(this.deltaSeconds) || this.deltaSeconds <= 0) throw new RangeError('Invalid fixed clock tick duration');
  }

  get tick(): number { return this.tickNumber; }
  get elapsedSeconds(): number { return this.tickNumber * this.deltaSeconds; }
  get interpolationAlpha(): number { return Math.min(1, this.accumulator / this.deltaSeconds); }
  get deferredSeconds(): number { return this.accumulator; }
  get discardedSeconds(): number { return this.droppedSeconds; }
  get systemCount(): number { return this.registrations.size; }

  addSystem(system: ClockSystem): () => void { return this.acquireSystem(system, {}); }

  /** Multiple consumers of the same owner share one update. IDs owned by different systems conflict. */
  acquireSystem(system: ClockSystem, owner: object): () => void {
    let entry = this.registrations.get(system.id);
    if (entry) {
      if (entry.owner !== owner || entry.system.phase !== system.phase || (entry.system.priority ?? 0) !== (system.priority ?? 0)) {
        throw new Error(`Clock system already registered: ${system.id}`);
      }
      entry.references++;
    } else {
      if (!system.id.trim() || !SIMULATION_PHASES.includes(system.phase) || !Number.isFinite(system.priority ?? 0)
        || typeof system.update !== 'function') throw new TypeError('Invalid clock system');
      entry = { system: { ...system }, owner, references: 1, order: this.nextOrder++, active: true };
      this.registrations.set(system.id, entry);
      this.ordered = [...this.registrations.values()].sort((a, b) => SIMULATION_PHASES.indexOf(a.system.phase) - SIMULATION_PHASES.indexOf(b.system.phase)
        || (a.system.priority ?? 0) - (b.system.priority ?? 0) || a.order - b.order);
    }
    const owned = entry;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      if (--owned.references > 0) return;
      owned.active = false;
      if (this.registrations.get(owned.system.id) === owned) this.registrations.delete(owned.system.id);
      this.ordered = this.ordered.filter(value => value !== owned);
    };
  }

  advance(frameSeconds: number): number {
    if (!Number.isFinite(frameSeconds) || frameSeconds < 0) throw new RangeError('Frame duration must be finite and nonnegative');
    if (this.advancing) throw new Error('Clock advancement is not reentrant');
    this.droppedSeconds += Math.max(0, frameSeconds - this.maxFrameSeconds);
    this.accumulator += Math.min(frameSeconds, this.maxFrameSeconds);
    this.advancing = true;
    let steps = 0;
    try {
      while (this.accumulator + this.deltaSeconds * 1e-9 >= this.deltaSeconds && steps < this.maxSubSteps) {
        this.accumulator = Math.max(0, this.accumulator - this.deltaSeconds);
        this.runTick(); steps++;
      }
      return steps;
    } finally { this.advancing = false; }
  }

  /** Deterministic replay/server stepping deliberately bypasses the display catch-up budget. */
  stepTicks(count = 1): void {
    if (!Number.isSafeInteger(count) || count < 0) throw new RangeError('Tick count must be a nonnegative safe integer');
    if (this.advancing) throw new Error('Clock advancement is not reentrant');
    this.advancing = true;
    try { for (let i = 0; i < count; i++) this.runTick(); }
    finally { this.advancing = false; }
  }

  private runTick(): void {
    if (this.tickNumber === Number.MAX_SAFE_INTEGER) throw new RangeError('Clock tick capacity exceeded');
    this.tickNumber++;
    const context = { tick: this.tickNumber, deltaSeconds: this.deltaSeconds, elapsedSeconds: this.elapsedSeconds };
    // Registration during a tick becomes visible on the next tick; disposed systems stop immediately.
    const systems = this.ordered;
    for (const entry of systems) if (entry.active) entry.system.update(context);
  }
}
