import { logger } from '../utils/logger';

export type BrowserGamepad = Pick<Gamepad, 'id' | 'index' | 'connected' | 'mapping' | 'axes' | 'buttons' | 'timestamp'>;
export type GamepadSnapshotListener = (pads: ReadonlyArray<BrowserGamepad | null>) => void;
export type GamepadSource = { subscribe: (listener: GamepadSnapshotListener) => () => void };

/** One browser poll per animation frame, shared by all active gamepad worlds. */
export class BrowserGamepadHub implements GamepadSource {
  private listeners = new Set<{ listener: GamepadSnapshotListener }>();
  private listenerSnapshot: Array<{ listener: GamepadSnapshotListener }> = [];
  private snapshot: ReadonlyArray<BrowserGamepad | null> = [];
  private frame: number | undefined;
  private focused = true;
  private reads = 0;
  private generation = 0;
  private polling = false;
  private pollRequested = false;
  private status: 'idle' | 'ready' | 'paused' | 'unsupported' | 'blocked' = 'idle';
  constructor(private readonly target: Window) {}

  subscribe(listener: GamepadSnapshotListener): () => void {
    const lease = { listener }; const first = this.listeners.size === 0; this.listeners.add(lease);
    this.listenerSnapshot = [...this.listeners];
    if (first) {
      this.focused = this.target.document.hasFocus();
      this.target.addEventListener('gamepadconnected', this.wake);
      this.target.addEventListener('gamepaddisconnected', this.wake);
      this.target.addEventListener('focus', this.focus);
      this.target.addEventListener('blur', this.blur);
      this.target.document.addEventListener('visibilitychange', this.wake);
      this.poll();
    } else this.notify(listener, this.snapshot);
    return () => {
      if (!this.listeners.delete(lease)) return;
      this.listenerSnapshot = [...this.listeners];
      if (this.listeners.size) return;
      this.generation++; this.cancelFrame(); this.snapshot = []; this.status = 'idle';
      this.target.removeEventListener('gamepadconnected', this.wake);
      this.target.removeEventListener('gamepaddisconnected', this.wake);
      this.target.removeEventListener('focus', this.focus);
      this.target.removeEventListener('blur', this.blur);
      this.target.document.removeEventListener('visibilitychange', this.wake);
    };
  }
  getStats() { return { subscribers: this.listeners.size, pendingFrames: Number(this.frame !== undefined), reads: this.reads, status: this.status }; }
  private notify(listener: GamepadSnapshotListener, pads: ReadonlyArray<BrowserGamepad | null>): void {
    try { listener(pads); } catch (error) { logger.error('Gamepad input consumer failed', error instanceof Error ? error : String(error)); }
  }
  private cancelFrame(): void { if (this.frame !== undefined) this.target.cancelAnimationFrame(this.frame); this.frame = undefined; }
  private focus = () => { this.focused = true; this.wake(); };
  private blur = () => { this.focused = false; this.wake(); };
  private wake = () => { this.cancelFrame(); this.poll(); };
  private poll = () => {
    // A consumer may replace the last lease or dispatch a focus event while being notified.
    // Defer that read to the next frame instead of losing the wake or recursing into consumers.
    if (this.polling) { this.pollRequested = true; return; }
    this.pollRequested = false;
    this.frame = undefined;
    if (!this.listeners.size) return;
    this.polling = true;
    const generation = this.generation;
    let pads: ReadonlyArray<BrowserGamepad | null> = [];
    if (!this.focused || this.target.document.hidden) this.status = 'paused';
    else if (typeof this.target.navigator.getGamepads !== 'function') this.status = 'unsupported';
    else {
      try { this.reads++; pads = this.target.navigator.getGamepads(); this.status = 'ready'; }
      catch { this.status = 'blocked'; }
    }
    this.snapshot = pads;
    for (const lease of this.listenerSnapshot) {
      if (generation !== this.generation) break;
      if (this.listeners.has(lease)) this.notify(lease.listener, pads);
    }
    this.polling = false;
    if (this.listeners.size && this.frame === undefined && (this.pollRequested || (generation === this.generation && this.focused && !this.target.document.hidden && this.status === 'ready' && pads.some(pad => pad?.connected)))) {
      const scheduledGeneration = this.generation;
      const frame = this.target.requestAnimationFrame(() => { if (this.frame === frame && this.generation === scheduledGeneration) this.poll(); });
      this.frame = frame;
    }
  };
}

const hubs = new WeakMap<Window, BrowserGamepadHub>();
export function getBrowserGamepadHub(target: Window = window): BrowserGamepadHub {
  let hub = hubs.get(target); if (!hub) { hub = new BrowserGamepadHub(target); hubs.set(target, hub); } return hub;
}
