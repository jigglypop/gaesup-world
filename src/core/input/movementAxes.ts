import type { Vector2 } from 'three';

import type { GamepadState, KeyboardState } from './core';

/** X is right, Y is forward. Preserve analog strength and cap diagonal magnitude. */
export function resolveMovementAxes(keyboard: Pick<KeyboardState, 'forward' | 'backward' | 'leftward' | 'rightward'>, gamepad: GamepadState | undefined, out: Vector2, normalize = true): Vector2 {
  const stick = gamepad?.connected ? gamepad.leftStick : undefined;
  const x = stick && Number.isFinite(stick.x) ? Math.max(-1, Math.min(1, stick.x)) : 0;
  const y = stick && Number.isFinite(stick.y) ? Math.max(-1, Math.min(1, stick.y)) : 0;
  out.set(Number(keyboard.rightward) - Number(keyboard.leftward) + x, Number(keyboard.forward) - Number(keyboard.backward) - y);
  if (normalize && out.lengthSq() > 1) out.normalize();
  else if (!normalize) out.set(Math.max(-1, Math.min(1, out.x)), Math.max(-1, Math.min(1, out.y)));
  return out;
}
