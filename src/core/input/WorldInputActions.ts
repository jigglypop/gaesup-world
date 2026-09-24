import type { InputBackend, KeyboardState } from './core';
import { getDefaultWorldInputScope, isEditableInputEvent, type WorldInputScope } from './WorldInputScope';
import { createInteractionInputAdapter } from '../interactions/core/adapter';
import { logger } from '../utils/logger';

export type InputActionContext = { key: string; timestamp: number; sequence: number; source: 'dom' | 'backend' };
export type InputActionBinding = {
  key: string | (() => string | null | undefined);
  execute: (context: InputActionContext) => boolean | void;
  cooldownMs?: number;
};
type Action = { owners: Set<InputActionBinding>; selected: InputActionBinding; lastAt: number; inFlight: boolean };
const backendKeys: ReadonlyArray<readonly [keyof KeyboardState, string]> = [
  ['forward', 'w'], ['backward', 's'], ['leftward', 'a'], ['rightward', 'd'], ['shift', 'shift'],
  ['space', 'space'], ['keyZ', 'z'], ['keyR', 'r'], ['keyF', 'f'], ['keyE', 'e'], ['escape', 'escape'],
];
function normalize(key: string): string {
  if (key === ' ') return 'space';
  const lower = key.toLowerCase();
  if (/^key[a-z]$/.test(lower)) return lower.slice(3);
  if (lower === 'shiftleft' || lower === 'shiftright') return 'shift';
  return lower;
}

/** One rising-edge consumer per action ID, shared by mounted views of a world. */
export class WorldInputActions {
  private readonly actions = new Map<string, Action>();
  private readonly backendHeld = new Set<string>();
  private readonly domHeld = new Map<string, string>();
  private held = new Set<string>();
  private blocked = new Set<string>();
  private cleanup: Array<() => void> = [];
  private connected = false;
  private enabled: boolean;
  private generation = 0;
  private sequence = 0;
  private executions = 0;
  private suppressed = 0;

  constructor(private readonly backend: InputBackend, private readonly scope: WorldInputScope, enabled = true, private readonly now = () => performance.now()) { this.enabled = enabled; }

  register(id: string, definition: InputActionBinding): () => void {
    const binding = { ...definition };
    let action = this.actions.get(id);
    if (!action) { action = { owners: new Set(), selected: binding, lastAt: -Infinity, inFlight: false }; this.actions.set(id, action); }
    action.owners.add(binding); action.selected = binding;
    const release = () => {
      if (!action!.owners.delete(binding)) return;
      if (!action!.owners.size) { if (this.actions.get(id) === action) this.actions.delete(id); }
      else if (action!.selected === binding) for (const owner of action!.owners) action!.selected = owner;
      if (!this.actions.size) this.disconnect();
    };
    try { this.connect(); } catch (error) { release(); throw error; }
    return release;
  }

  suspend(): void { this.enabled = false; this.disconnect(); for (const action of this.actions.values()) action.lastAt = -Infinity; }
  resume(): void { this.enabled = true; this.connect(); }
  getStats() { return { active: this.connected, actions: this.actions.size, registrations: [...this.actions.values()].reduce((sum, action) => sum + action.owners.size, 0), sequence: this.sequence, executions: this.executions, suppressed: this.suppressed }; }

  private readKeyboard(keyboard: KeyboardState): boolean {
    let changed = false;
    for (const [field, key] of backendKeys) {
      const down = Boolean(keyboard[field]);
      if (down === this.backendHeld.has(key)) continue;
      changed = true; if (down) this.backendHeld.add(key); else this.backendHeld.delete(key);
    }
    return changed;
  }
  private connect(): void {
    if (!this.enabled || this.connected || !this.actions.size) return;
    this.connected = true; const generation = ++this.generation;
    const attach = (off: () => void) => {
      if (this.connected && this.generation === generation) this.cleanup.push(off);
      else this.attempt(off);
    };
    let initial = true;
    try {
      this.readKeyboard(this.backend.getKeyboard()); this.held = new Set(this.backendHeld);
      const off = this.backend.subscribe?.(({ keyboard }) => {
        if (!this.connected || this.generation !== generation) return;
        const changed = this.readKeyboard(keyboard);
        if (initial) this.held = new Set(this.backendHeld);
        else if (changed) this.reconcile('backend');
      });
      if (off) attach(off);
      initial = false;
      if (!this.connected || this.generation !== generation) return;
      // Input producers and editors run first, so a DOM event and its backend write form one edge.
      attach(this.scope.listen('keydown', this.keyDown, false, 100));
      attach(this.scope.listen('keyup', this.keyUp, false, 100));
      attach(this.scope.onBlur(this.blur));
    } catch (error) { this.disconnect(); throw error; }
  }
  private disconnect(): void {
    this.connected = false; this.generation++;
    const cleanup = this.cleanup; this.cleanup = [];
    this.backendHeld.clear(); this.domHeld.clear(); this.held.clear(); this.blocked.clear();
    for (const off of cleanup) this.attempt(off);
  }
  private keyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || isEditableInputEvent(event)) return;
    const key = normalize(event.code || event.key);
    this.domHeld.set(this.scope.eventSource(event) || key, key); this.reconcile('dom');
  };
  private keyUp = (event: KeyboardEvent) => {
    this.domHeld.delete(this.scope.eventSource(event) || normalize(event.code || event.key)); this.reconcile('dom');
  };
  private blur = () => {
    this.domHeld.clear(); this.blocked = new Set(this.backendHeld); this.held = new Set(this.backendHeld);
  };
  private reconcile(source: InputActionContext['source']): void {
    const next = new Set([...this.backendHeld, ...this.domHeld.values()]);
    const rising = new Set([...next].filter(key => !this.held.has(key) && !this.blocked.has(key)));
    for (const key of this.blocked) if (!next.has(key)) this.blocked.delete(key);
    this.held = next;
    if (!rising.size || !this.connected || !this.scope.isEnabled()) return;
    const generation = this.generation;
    for (const [id, action] of [...this.actions]) {
      if (!this.connected || this.generation !== generation) break;
      const binding = action.selected;
      let key: string | null | undefined;
      try { key = typeof binding.key === 'function' ? binding.key() : binding.key; }
      catch (error) { this.report(error); continue; }
      if (!key || !rising.has(normalize(key)) || this.actions.get(id) !== action || !action.owners.has(binding)) continue;
      const now = this.now(); const cooldown = Math.max(0, binding.cooldownMs ?? 0);
      if (action.inFlight || now - action.lastAt < cooldown) { this.suppressed++; continue; }
      const previous = action.lastAt; action.lastAt = now; action.inFlight = true;
      try {
        const result = binding.execute({ key: normalize(key), timestamp: now, sequence: ++this.sequence, source });
        if (result === false) action.lastAt = previous; else this.executions++;
      } catch (error) { this.report(error); }
      finally { action.inFlight = false; }
    }
  }
  private report(error: unknown): void { logger.error('World input action failed', error instanceof Error ? error : String(error)); }
  private attempt(operation: () => void): void { try { operation(); } catch (error) { this.report(error); } }
}

let legacy: WorldInputActions | undefined;
export function getDefaultWorldInputActions(): WorldInputActions { return legacy ??= new WorldInputActions(createInteractionInputAdapter(), getDefaultWorldInputScope()); }
