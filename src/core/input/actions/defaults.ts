import type { InputActionDefinition, InputActionKind, InputBinding } from './types';
import type { ProjectInputBinding } from '../../project-settings/types';

export const DEFAULT_INPUT_ACTIONS = {
  move: 'move',
  jump: 'jump',
  run: 'run',
  interact: 'interact',
} as const;

const GAMEPAD_BUTTON_SOUTH = 'button:0';
const GAMEPAD_BUTTON_WEST = 'button:2';
const GAMEPAD_LEFT_STICK_PRESS = 'button:10';
const GAMEPAD_LEFT_STICK_X = 'axis:0';
const GAMEPAD_LEFT_STICK_Y = 'axis:1';

export function createDefaultInputActions(): InputActionDefinition[] {
  return [
    {
      name: DEFAULT_INPUT_ACTIONS.move,
      kind: 'axis2D',
      bindings: [
        { device: 'keyboard', code: 'KeyW', axis: 'y', scale: 1 },
        { device: 'keyboard', code: 'KeyS', axis: 'y', scale: -1 },
        { device: 'keyboard', code: 'KeyD', axis: 'x', scale: 1 },
        { device: 'keyboard', code: 'KeyA', axis: 'x', scale: -1 },
        { device: 'keyboard', code: 'ArrowUp', axis: 'y', scale: 1 },
        { device: 'keyboard', code: 'ArrowDown', axis: 'y', scale: -1 },
        { device: 'keyboard', code: 'ArrowRight', axis: 'x', scale: 1 },
        { device: 'keyboard', code: 'ArrowLeft', axis: 'x', scale: -1 },
        { device: 'gamepad', code: GAMEPAD_LEFT_STICK_X, axis: 'x', scale: 1 },
        { device: 'gamepad', code: GAMEPAD_LEFT_STICK_Y, axis: 'y', scale: -1 },
        { device: 'touch', code: 'stick:x', axis: 'x', scale: 1 },
        { device: 'touch', code: 'stick:y', axis: 'y', scale: 1 },
      ],
    },
    {
      name: DEFAULT_INPUT_ACTIONS.jump,
      kind: 'button',
      bindings: [
        { device: 'keyboard', code: 'Space' },
        { device: 'gamepad', code: GAMEPAD_BUTTON_SOUTH },
        { device: 'touch', code: 'button:jump' },
      ],
    },
    {
      name: DEFAULT_INPUT_ACTIONS.run,
      kind: 'button',
      bindings: [
        { device: 'keyboard', code: 'ShiftLeft' },
        { device: 'keyboard', code: 'ShiftRight' },
        { device: 'gamepad', code: GAMEPAD_LEFT_STICK_PRESS },
        { device: 'touch', code: 'button:run' },
      ],
    },
    {
      name: DEFAULT_INPUT_ACTIONS.interact,
      kind: 'button',
      bindings: [
        { device: 'keyboard', code: 'KeyE' },
        { device: 'gamepad', code: GAMEPAD_BUTTON_WEST },
        { device: 'touch', code: 'button:interact' },
      ],
    },
  ];
}

export function inputActionsFromProjectSettings(
  bindings: Record<string, ProjectInputBinding[]>,
  kinds: Record<string, InputActionKind> = {},
): InputActionDefinition[] {
  return Object.entries(bindings).map(([name, entries]) => {
    const kind = kinds[name] ?? (entries.some((entry) => entry.scale !== undefined) ? 'axis1D' : 'button');
    return {
      name,
      kind,
      bindings: entries.map((entry): InputBinding => ({
        device: entry.device,
        code: entry.code,
        ...(entry.scale !== undefined ? { scale: entry.scale } : {}),
      })),
    };
  });
}
