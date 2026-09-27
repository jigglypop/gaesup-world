import { useEffect, useLayoutEffect, useRef } from 'react';

import { advance, flushGlobalEffects, useThree } from '@react-three/fiber';

import { useInputBackend } from '../interactions/hooks';
import { useCanvasFrameScheduler } from '../runtime/frame';

/** Input that keeps the canvas drawing every display frame. */
const ACTIVITY = ['pointerdown', 'pointermove', 'wheel', 'keydown', 'keyup', 'touchstart', 'touchmove'] as const;

/**
 * Which display frames to draw: every one within `afterMs` of the last activity, then at most `fps` a second. The
 * 10% slack keeps a 60 Hz display at exactly every other frame despite timestamp jitter.
 */
export function createIdleFrameGate({ fps = 30, afterMs = 2000 }: { fps?: number; afterMs?: number } = {}) {
  const gap = 900 / fps;
  let lastActivity = -Infinity;
  let lastDrawn = -Infinity;
  return {
    activity(time: number): void {
      if (time > lastActivity) lastActivity = time;
    },
    shouldDraw(time: number): boolean {
      if (time - lastActivity >= afterMs && time - lastDrawn < gap) return false;
      lastDrawn = time;
      return true;
    },
  };
}

export type IdleFrameRateProps = {
  /** Frames a second once idle. */
  fps?: number;
  /** Seconds without input before the canvas counts as idle. */
  after?: number;
};

/**
 * Draws every display frame while the scene changes and `fps` frames a second once `after` seconds pass without a
 * change. Input (a gamepad too), a moving camera and systems that call the canvas scheduler's `markActivity` (walking
 * NPCs) count as changes. It paces the canvas itself (`frameloop="never"` while mounted), so frame requests from elsewhere, such as
 * physics bodies that never sleep, do not keep an idle canvas at full rate. Simulation keeps its own clock
 * (`WorldPhysics`).
 */
export function IdleFrameRate({ fps = 30, after = 2 }: IdleFrameRateProps) {
  const get = useThree((state) => state.get);
  const scheduler = useCanvasFrameScheduler();
  const input = useInputBackend();
  const frameloop = useThree((state) => state.frameloop);
  // Frame time drawn so far, in seconds; the canvas clock follows it.
  const elapsed = useRef(0);
  const owned = useRef(false);

  // The canvas applies its own frameloop prop again whenever it renders, and that restarts its clock.
  useLayoutEffect(() => {
    if (frameloop !== 'always') return;
    owned.current = true;
    const state = get();
    state.setFrameloop('never');
    // Frames requested before the switch would still run in R3F's own loop, which passes its rAF time in milliseconds
    // where 'never' expects seconds: one frame of +1772 s, then -1771 s on the next drawn frame, which left animation
    // mixers at negative time and every character in its bind pose.
    state.internal.frames = 0;
    state.clock.elapsedTime = elapsed.current;
  }, [frameloop, get]);
  useEffect(() => () => {
    if (owned.current) get().setFrameloop('always');
  }, [get]);

  useEffect(() => {
    const gate = createIdleFrameGate({ fps, afterMs: after * 1000 });
    const wake = () => gate.activity(performance.now());
    wake();
    let last = performance.now();
    // The camera's world matrix when the last frame was drawn; a camera still gliding after input keeps full rate.
    const cameraMatrix = new Float64Array(16);
    let request = requestAnimationFrame(function draw(time) {
      request = requestAnimationFrame(draw);
      const state = get();
      gate.activity(scheduler.getLastActivity());
      if (!owned.current || state.frameloop !== 'never' || !gate.shouldDraw(time)) return;
      const elements = state.camera.matrixWorld.elements;
      for (let index = 0; index < 16; index++) {
        if (cameraMatrix[index] === elements[index]) continue;
        cameraMatrix.set(elements);
        gate.activity(time);
        break;
      }
      // Whatever else moved the canvas clock, this frame's delta is the time since the last drawn one.
      state.clock.elapsedTime = elapsed.current;
      elapsed.current += Math.max(0, time - last) / 1000;
      last = time;
      flushGlobalEffects('before', time);
      advance(elapsed.current, false, state);
      flushGlobalEffects('after', time);
    });
    for (const type of ACTIVITY) window.addEventListener(type, wake, { capture: true, passive: true });
    // Gamepads send no DOM events: a change the world's input sees, a stick or button, counts too.
    const offInput = input.subscribe?.(wake);
    return () => {
      cancelAnimationFrame(request);
      for (const type of ACTIVITY) window.removeEventListener(type, wake, { capture: true });
      offInput?.();
    };
  }, [after, fps, get, input, scheduler]);

  return null;
}
