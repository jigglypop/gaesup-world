import { createInputDeviceState } from './InputActionMap';
import type { BrowserInputDevices } from './types';

type GamepadSource = { getGamepads?: () => ArrayLike<Gamepad | null> };

export function createBrowserInputDevices(
  target: Window = window,
  gamepads: GamepadSource = typeof navigator !== 'undefined' ? navigator : {},
): BrowserInputDevices {
  const state = createInputDeviceState();
  const handleKeyDown = (event: KeyboardEvent) => {
    state.keyboard.add(event.code);
  };
  const handleKeyUp = (event: KeyboardEvent) => {
    state.keyboard.delete(event.code);
  };
  const handleMouseDown = (event: MouseEvent) => {
    state.mouse.add(`button:${event.button}`);
  };
  const handleMouseUp = (event: MouseEvent) => {
    state.mouse.delete(`button:${event.button}`);
  };
  const handleBlur = () => {
    state.keyboard.clear();
    state.mouse.clear();
  };
  target.addEventListener('keydown', handleKeyDown);
  target.addEventListener('keyup', handleKeyUp);
  target.addEventListener('mousedown', handleMouseDown);
  target.addEventListener('mouseup', handleMouseUp);
  target.addEventListener('blur', handleBlur);

  const poll = () => {
    const pads = gamepads.getGamepads?.();
    state.gamepad.clear();
    if (!pads) return;
    for (let p = 0; p < pads.length; p++) {
      const pad = pads[p];
      if (!pad) continue;
      for (let b = 0; b < pad.buttons.length; b++) {
        const value = pad.buttons[b]?.value ?? 0;
        if (value > 0) state.gamepad.set(`button:${b}`, Math.max(value, state.gamepad.get(`button:${b}`) ?? 0));
      }
      for (let a = 0; a < pad.axes.length; a++) {
        const value = pad.axes[a] ?? 0;
        if (value !== 0 && !state.gamepad.has(`axis:${a}`)) state.gamepad.set(`axis:${a}`, value);
      }
    }
  };

  return {
    state,
    poll,
    dispose: () => {
      target.removeEventListener('keydown', handleKeyDown);
      target.removeEventListener('keyup', handleKeyUp);
      target.removeEventListener('mousedown', handleMouseDown);
      target.removeEventListener('mouseup', handleMouseUp);
      target.removeEventListener('blur', handleBlur);
      handleBlur();
      state.gamepad.clear();
      state.touch.clear();
    },
  };
}
