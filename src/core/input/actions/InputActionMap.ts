import type {
  InputActionDefinition,
  InputActionState,
  InputBinding,
  InputDeviceState,
  InputRecordingFrame,
} from './types';

const DEFAULT_DEADZONE = 0.15;
const PRESS_THRESHOLD = 0.5;

type ActionSlot = {
  definition: InputActionDefinition;
  state: InputActionState;
};

export function createInputDeviceState(): InputDeviceState {
  return { keyboard: new Set(), mouse: new Set(), gamepad: new Map(), touch: new Map() };
}

function readBinding(devices: InputDeviceState, binding: InputBinding): number {
  switch (binding.device) {
    case 'keyboard':
      return devices.keyboard.has(binding.code) ? 1 : 0;
    case 'mouse':
      return devices.mouse.has(binding.code) ? 1 : 0;
    case 'gamepad':
      return devices.gamepad.get(binding.code) ?? 0;
    case 'touch':
      return devices.touch.get(binding.code) ?? 0;
  }
}

function applyDeadzone(value: number, deadzone: number): number {
  return Math.abs(value) < deadzone ? 0 : value;
}

function clampUnit(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function createState(): InputActionState {
  return { pressed: false, down: false, up: false, value: 0, x: 0, y: 0 };
}

export class InputActionMap {
  private readonly slots = new Map<string, ActionSlot>();
  private readonly order: ActionSlot[] = [];

  constructor(definitions: readonly InputActionDefinition[]) {
    definitions.forEach((definition) => {
      if (this.slots.has(definition.name)) {
        throw new Error(`[InputActionMap Error]: 중복 액션 ${definition.name}`);
      }
      const slot = { definition, state: createState() };
      this.slots.set(definition.name, slot);
      this.order.push(slot);
    });
  }

  get(name: string): Readonly<InputActionState> | undefined {
    return this.slots.get(name)?.state;
  }

  names(): string[] {
    return this.order.map((slot) => slot.definition.name);
  }

  definitions(): readonly InputActionDefinition[] {
    return this.order.map((slot) => slot.definition);
  }

  evaluate(devices: InputDeviceState): void {
    for (let i = 0; i < this.order.length; i++) {
      const slot = this.order[i]!;
      const { definition } = slot;
      const deadzone = definition.deadzone ?? DEFAULT_DEADZONE;
      let x = 0;
      let y = 0;
      let value = 0;
      for (let b = 0; b < definition.bindings.length; b++) {
        const binding = definition.bindings[b]!;
        const raw = applyDeadzone(readBinding(devices, binding), deadzone) * (binding.scale ?? 1);
        if (definition.kind === 'axis2D') {
          if (binding.axis === 'y') y += raw;
          else x += raw;
        } else if (definition.kind === 'button') {
          value = Math.max(value, Math.abs(raw));
        } else {
          value += raw;
        }
      }
      if (definition.kind === 'axis2D') {
        const length = Math.hypot(x, y);
        if (length > 1) {
          x /= length;
          y /= length;
        }
        value = Math.min(1, length);
      } else {
        value = definition.kind === 'button' ? Math.min(1, value) : clampUnit(value);
      }
      this.writeState(slot.state, value, x, y);
    }
  }

  applyRecordedFrame(frame: InputRecordingFrame): void {
    for (let i = 0; i < this.order.length; i++) {
      const slot = this.order[i]!;
      const recorded = frame[slot.definition.name];
      if (recorded) this.writeState(slot.state, recorded[0], recorded[1], recorded[2]);
      else this.writeState(slot.state, 0, 0, 0);
    }
  }

  captureFrame(): InputRecordingFrame {
    const frame: InputRecordingFrame = {};
    for (let i = 0; i < this.order.length; i++) {
      const slot = this.order[i]!;
      const { value, x, y } = slot.state;
      if (value !== 0 || x !== 0 || y !== 0) frame[slot.definition.name] = [value, x, y];
    }
    return frame;
  }

  reset(): void {
    this.order.forEach((slot) => this.writeState(slot.state, 0, 0, 0));
  }

  private writeState(state: InputActionState, value: number, x: number, y: number): void {
    const pressed = value >= PRESS_THRESHOLD;
    state.down = pressed && !state.pressed;
    state.up = !pressed && state.pressed;
    state.pressed = pressed;
    state.value = value;
    state.x = x;
    state.y = y;
  }
}
