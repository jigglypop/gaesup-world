import { createMemoryInputBackend, type InputBackend, type InputBackendSnapshot, type InputStateListener } from '../interactions/core/adapter';
import type { GamepadState, KeyboardState, MouseState, TouchState } from '../interactions/core/types';
import { logger } from '../utils/logger';

const owners = new WeakMap<InputBackend, WorldInputBackend>();

/** A failed second owner must not destroy a source still serving a different world. */
export function isWorldInputSourceOwned(source: InputBackend): boolean {
  return owners.has(source) || (source instanceof WorldInputBackend && source.getStats().active);
}

/** Stable world port: hooks, store commands and motion read the same source and lifecycle. */
export class WorldInputBackend implements InputBackend {
  private readonly memory = createMemoryInputBackend();
  private readonly neutral = createMemoryInputBackend();
  private source: InputBackend = this.memory;
  private readonly listeners = new Set<{ listener: InputStateListener }>();
  private unsubscribe: (() => void) | undefined;
  private active = false;
  private generation = 0;
  private revision = 0;
  private supplementalGamepad = false;

  getKeyboard = (): KeyboardState => (this.active ? this.source : this.neutral).getKeyboard();
  getMouse = (): MouseState => (this.active ? this.source : this.neutral).getMouse();
  getGamepad = (): GamepadState => this.active ? (this.supplementalGamepad ? this.memory.getGamepad!() : this.source.getGamepad?.() ?? this.memory.getGamepad!()) : this.neutral.getGamepad!();
  getTouch = (): TouchState => (this.active ? this.source.getTouch?.() : undefined) ?? this.neutral.getTouch!();
  updateKeyboard = (input: Partial<KeyboardState>): void => this.write(source => source.updateKeyboard(input));
  updateMouse = (input: Partial<MouseState>): void => this.write(source => source.updateMouse(input));
  updateGamepad = (input: Partial<GamepadState>): void => this.write(source => {
    if (source.getGamepad && source.updateGamepad && !this.supplementalGamepad) source.updateGamepad(input);
    else { this.supplementalGamepad = true; this.memory.updateGamepad!(input); }
  });
  updateTouch = (input: Partial<TouchState>): void => this.write(source => source.updateTouch?.(input));

  subscribe = (listener: InputStateListener): (() => void) => {
    const lease = { listener }; this.listeners.add(lease);
    this.notify(listener, this.snapshot());
    return () => { this.listeners.delete(lease); };
  };

  activate(source: InputBackend = this.memory): void {
    if (source === this) source = this.memory;
    else if (source instanceof WorldInputBackend) throw new Error('A world input port cannot be used as another world\'s source');
    if (this.active && source === this.source) return;
    const owner = owners.get(source);
    if (owner && owner !== this) throw new Error('An input backend cannot be owned by two active worlds');
    this.suspend();
    this.source = source; this.active = true; owners.set(source, this);
    const generation = ++this.generation;
    try {
      const before = this.revision;
      const unsubscribe = source.subscribe?.(() => { if (this.active && this.generation === generation) this.emit(); });
      if (this.active && this.generation === generation) this.unsubscribe = unsubscribe;
      else unsubscribe?.();
      if (this.active && this.generation === generation && before === this.revision) this.emit();
    } catch (error) { this.suspend(); throw error; }
  }

  suspend(): void {
    if (!this.active) return;
    const previous = this.source; const unsubscribe = this.unsubscribe;
    this.active = false; this.generation++; this.unsubscribe = undefined;
    this.attempt(() => unsubscribe?.());
    // Clear transient controls before a plugin reuses its source in a new generation.
    this.attempt(() => previous.updateKeyboard(this.neutral.getKeyboard()));
    this.attempt(() => previous.updateMouse({ ...this.neutral.getMouse(), hasArrived: false }));
    this.attempt(() => previous.updateGamepad?.({ ...this.neutral.getGamepad!(), buttons: Object.fromEntries(Object.keys(previous.getGamepad?.().buttons ?? {}).map(key => [key, false])) }));
    this.attempt(() => previous.updateTouch?.(this.neutral.getTouch!()));
    this.memory.updateGamepad!({ ...this.neutral.getGamepad!(), buttons: Object.fromEntries(Object.keys(this.memory.getGamepad!().buttons).map(key => [key, false])) });
    this.supplementalGamepad = false;
    owners.delete(previous);
    this.emit();
  }

  getStats() { return { active: this.active, subscribers: this.listeners.size, sourceSubscriptions: Number(Boolean(this.unsubscribe)), revision: this.revision }; }

  private write(write: (source: InputBackend) => void): void {
    if (!this.active) return;
    const before = this.revision; write(this.source);
    if (this.active && before === this.revision) this.emit();
  }
  private snapshot(): InputBackendSnapshot { return { keyboard: this.getKeyboard(), mouse: this.getMouse(), gamepad: this.getGamepad(), touch: this.getTouch() }; }
  private notify(listener: InputStateListener, snapshot: InputBackendSnapshot): void { this.attempt(() => listener(snapshot)); }
  private attempt(operation: () => void): void { try { operation(); } catch (error) { logger.error('World input backend callback failed', error instanceof Error ? error : String(error)); } }
  private emit(): void {
    this.revision++;
    const generation = this.generation; const snapshot = this.snapshot();
    for (const lease of [...this.listeners]) {
      if (generation !== this.generation) break;
      if (this.listeners.has(lease)) this.notify(lease.listener, snapshot);
    }
  }
}
