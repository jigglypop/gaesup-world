import * as THREE from 'three';

import { getBrowserGamepadHub, type BrowserGamepad, type GamepadSource } from './BrowserGamepadHub';
import type { GamepadState, InputAdapter, KeyboardState } from './core';
import type { WorldInputScope } from './WorldInputScope';
import { createKeyboardOwnership } from '../hooks/useKeyboard/ownership';
import { logger } from '../utils/logger';

export const STANDARD_GAMEPAD_BUTTONS = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Back', 'Start', 'LeftStick', 'RightStick', 'DPadUp', 'DPadDown', 'DPadLeft', 'DPadRight', 'Guide'] as const;
export type GamepadButtonName = typeof STANDARD_GAMEPAD_BUTTONS[number];
export type WorldGamepadOptions = {
  enabled?: boolean;
  index?: number;
  deadzone?: number;
  lookSpeed?: number;
  mapping?: { axes?: Partial<Record<'leftX' | 'leftY' | 'rightX' | 'rightY', number>>; buttons?: Partial<Record<GamepadButtonName, number>> };
  bindings?: Partial<Record<GamepadButtonName, keyof KeyboardState | null>>;
};
const defaults: Partial<Record<GamepadButtonName, keyof KeyboardState>> = { A: 'space', B: 'escape', X: 'keyF', Y: 'keyE', RB: 'shift', Back: 'escape', Start: 'escape', DPadUp: 'forward', DPadDown: 'backward', DPadLeft: 'leftward', DPadRight: 'rightward' };
const finite = (value: number | undefined, low: number, high: number) => Number.isFinite(value) ? Math.max(low, Math.min(high, value!)) : 0;
export function applyGamepadDeadzone(x: number, y: number, deadzone: number, out: THREE.Vector2): THREE.Vector2 {
  out.set(finite(x, -1, 1), finite(y, -1, 1)); const length = out.length();
  return length <= deadzone ? out.set(0, 0) : out.multiplyScalar((Math.min(1, length) - deadzone) / ((1 - deadzone) * length));
}

/** Maps focused browser input to a world's stable backend without owning a second frame loop. */
export class WorldGamepadInput {
  private options: WorldGamepadOptions;
  private running = false;
  private disconnect: (() => void) | undefined;
  private ownership: ReturnType<typeof createKeyboardOwnership>;
  private deviceId: string | undefined;
  private deviceMapping: string | undefined;
  private blocked = new Uint8Array(17);
  private blockedLeft = false;
  private blockedRight = false;
  private armed = false;
  private changes = 0;
  private selectedIndex: number | null = null;
  private mappingSupported = true;
  private state: GamepadState = { connected: false, leftStick: new THREE.Vector2(), rightStick: new THREE.Vector2(), triggers: { left: 0, right: 0 }, buttons: Object.fromEntries(STANDARD_GAMEPAD_BUTTONS.map(name => [name, false])), vibration: { weak: 0, strong: 0 } };
  private scratchLeft = new THREE.Vector2();
  private scratchRight = new THREE.Vector2();
  private generation = 0;
  private inputEpoch = 0;
  constructor(private readonly backend: InputAdapter, private readonly scope: WorldInputScope, private readonly eligible: () => boolean, options: WorldGamepadOptions = {}, private readonly source?: GamepadSource, private readonly onManualMovement?: () => void) {
    this.options = this.copyOptions(options); this.ownership = createKeyboardOwnership(backend);
  }
  get lookSpeed(): number { return this.options.lookSpeed ?? 2.5; }
  configure(options: WorldGamepadOptions): void { const next = this.copyOptions({ ...this.options, ...options }); this.release(); this.options = next; this.refresh(); }
  resume(): void { this.running = true; this.refresh(); }
  suspend(): void { this.running = false; this.stop(); }
  refresh(): void {
    const shouldRun = this.running && this.options.enabled !== false && this.eligible();
    if (!shouldRun) { this.stop(); return; }
    if (this.disconnect) return;
    const source = this.source ?? (typeof window === 'undefined' ? undefined : getBrowserGamepadHub());
    if (!source) return;
    const generation = ++this.generation;
    let offSource: (() => void) | undefined;
    const offBlur = this.scope.onBlur(this.release);
    this.disconnect = () => { offBlur(); offSource?.(); };
    try {
      const off = source.subscribe(pads => { if (this.running && this.generation === generation) this.sample(pads); });
      if (this.running && this.generation === generation) offSource = off; else off();
    } catch (error) { this.stop(); throw error; }
  }
  getStats() { return { active: !!this.disconnect, connected: this.state.connected, selectedIndex: this.selectedIndex, mappingSupported: this.mappingSupported, changes: this.changes }; }
  private copyOptions(options: WorldGamepadOptions): WorldGamepadOptions {
    if (options.index !== undefined && (!Number.isInteger(options.index) || options.index < 0)) throw new RangeError('Gamepad index must be a non-negative integer');
    const deadzone = options.deadzone ?? 0.15; const lookSpeed = options.lookSpeed ?? 2.5;
    if (!Number.isFinite(deadzone) || deadzone < 0 || deadzone >= 1) throw new RangeError('Gamepad deadzone must be between 0 and 1');
    if (!Number.isFinite(lookSpeed) || lookSpeed < 0) throw new RangeError('Gamepad look speed must be non-negative');
    for (const index of [...Object.values(options.mapping?.axes ?? {}), ...Object.values(options.mapping?.buttons ?? {})]) if (!Number.isInteger(index) || index < 0) throw new RangeError('Gamepad mapping indices must be non-negative integers');
    return { ...options, deadzone, lookSpeed, ...(options.bindings ? { bindings: { ...options.bindings } } : {}), ...(options.mapping ? { mapping: { axes: { ...options.mapping.axes }, buttons: { ...options.mapping.buttons } } } : {}) };
  }
  private stop(): void {
    const off = this.disconnect; this.disconnect = undefined; const generation = ++this.generation;
    try { off?.(); } catch (error) { logger.error('Gamepad source cleanup failed', error instanceof Error ? error : String(error)); }
    if (generation === this.generation) this.release();
  }
  private release = () => {
    this.inputEpoch++;
    this.armed = false; this.deviceId = undefined; this.deviceMapping = undefined; this.selectedIndex = null;
    const connected = this.state.connected; const epoch = this.inputEpoch;
    this.state.connected = false; this.state.leftStick.set(0, 0); this.state.rightStick.set(0, 0); this.state.triggers.left = 0; this.state.triggers.right = 0;
    for (const name of STANDARD_GAMEPAD_BUTTONS) this.state.buttons[name] = false;
    this.ownership.release();
    if (connected && epoch === this.inputEpoch) {
      try { this.publish(); } catch (error) { logger.error('Gamepad state cleanup failed', error instanceof Error ? error : String(error)); }
    }
  };
  private publish(): void { this.changes++; this.backend.updateGamepad?.(this.state); }
  private sample(pads: ReadonlyArray<BrowserGamepad | null>): void {
    if (!this.eligible() || !this.scope.isFocused()) { this.release(); return; }
    const generation = this.generation;
    let selected: BrowserGamepad | undefined; let unsupported: BrowserGamepad | undefined;
    for (const pad of pads) {
      if (!pad?.connected || (this.options.index !== undefined && pad.index !== this.options.index)) continue;
      if (pad.mapping === 'standard' || this.options.mapping) { selected = pad; break; }
      unsupported ??= pad;
    }
    selected ??= unsupported;
    this.mappingSupported = !selected || selected.mapping === 'standard' || !!this.options.mapping;
    if (!selected || !this.mappingSupported) { this.release(); return; }
    if (this.selectedIndex !== selected.index || this.deviceId !== selected.id || this.deviceMapping !== selected.mapping) {
      const epoch = this.inputEpoch; this.release();
      if (generation !== this.generation || this.inputEpoch !== epoch + 1 || !this.running) return;
    }
    this.deviceId = selected.id; this.deviceMapping = selected.mapping; this.selectedIndex = selected.index;
    const axes = this.options.mapping?.axes;
    const deadzone = this.options.deadzone!;
    applyGamepadDeadzone(selected.axes[axes?.leftX ?? 0] ?? 0, selected.axes[axes?.leftY ?? 1] ?? 0, deadzone, this.scratchLeft);
    applyGamepadDeadzone(selected.axes[axes?.rightX ?? 2] ?? 0, selected.axes[axes?.rightY ?? 3] ?? 0, deadzone, this.scratchRight);
    if (!this.armed) { this.blockedLeft = this.scratchLeft.lengthSq() > 0; this.blockedRight = this.scratchRight.lengthSq() > 0; }
    if (this.blockedLeft) { if (!this.scratchLeft.lengthSq()) this.blockedLeft = false; else this.scratchLeft.set(0, 0); }
    if (this.blockedRight) { if (!this.scratchRight.lengthSq()) this.blockedRight = false; else this.scratchRight.set(0, 0); }
    let changed = !this.state.connected || !this.state.leftStick.equals(this.scratchLeft) || !this.state.rightStick.equals(this.scratchRight);
    this.state.connected = true; this.state.leftStick.copy(this.scratchLeft); this.state.rightStick.copy(this.scratchRight);
    const epoch = this.inputEpoch;
    for (let index = 0; index < STANDARD_GAMEPAD_BUTTONS.length; index++) {
      const name = STANDARD_GAMEPAD_BUTTONS[index]!; const raw = selected.buttons[this.options.mapping?.buttons?.[name] ?? index];
      const value = finite(raw?.value, 0, 1); const held = !!raw?.pressed || value >= 0.5;
      if (!this.armed) this.blocked[index] = Number(held || value > 0.01);
      if (!held && value <= 0.01) this.blocked[index] = 0;
      const down = !this.blocked[index] && held;
      if (this.state.buttons[name] !== down) { this.state.buttons[name] = down; changed = true; }
      if (name === 'LT' || name === 'RT') {
        const trigger = name === 'LT' ? 'left' : 'right'; const next = this.blocked[index] ? 0 : value;
        if (this.state.triggers[trigger] !== next) { this.state.triggers[trigger] = next; changed = true; }
      }
    }
    this.armed = true;
    if (this.state.leftStick.lengthSq() > 0 || this.state.buttons['DPadUp'] || this.state.buttons['DPadDown'] || this.state.buttons['DPadLeft'] || this.state.buttons['DPadRight']) {
      this.onManualMovement?.();
      if (this.backend.getMouse().isActive) this.backend.updateMouse({ isActive: false, shouldRun: false, hasArrived: false });
      if (generation !== this.generation || epoch !== this.inputEpoch || !this.running) return;
    }
    if (changed) this.publish();
    if (!this.scope.isFocused()) return;
    for (const name of STANDARD_GAMEPAD_BUTTONS) {
      if (generation !== this.generation || epoch !== this.inputEpoch || !this.running) return;
      const key = this.options.bindings?.[name] === undefined ? defaults[name] : this.options.bindings[name];
      if (key) this.ownership.set(name, key, this.state.buttons[name]!);
    }
  }
}
