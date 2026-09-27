import { useEffect, useLayoutEffect, useRef } from 'react';

import { LoopOnce, LoopRepeat, type AnimationAction, type AnimationMixerEventMap } from 'three';

import { applyClipPose, findClipKey } from '../core/clips';

export type ClipTransitionOptions = {
  /** Crossfade seconds. Default 0.2. */
  fade?: number;
  /** Plays the clip once, holding its last frame, then fades back to `stance`. */
  once?: boolean;
  /** Where a finished one-shot returns. Default `'idle'`; a model without it stands in its walk's first frame. */
  stance?: string;
  /** Where a looping first clip starts in its cycle, 0–1, so figures sharing a clip do not move in step. */
  phase?: number;
  /** Playback rate of the playing clip. Default 1. */
  timeScale?: number;
  /** Called when a one-shot finishes and hands back to the stance. */
  onFinish?: () => void;
};

type Actions = Record<string, AnimationAction | null>;

function actionFor(actions: Actions, name: string, only: boolean): AnimationAction | null {
  const keys = Object.keys(actions);
  const key = findClipKey(keys, name) ?? (only && keys.length === 1 ? keys[0] : undefined);
  return key === undefined ? null : actions[key] ?? null;
}

/** Restarts `action` at full weight for a loop, or once holding its last frame. */
function restart(action: AnimationAction, once: boolean): AnimationAction {
  action.reset();
  action.setLoop(once ? LoopOnce : LoopRepeat, once ? 1 : Infinity);
  action.clampWhenFinished = once;
  return action.play();
}

/**
 * Plays `name` on `actions` (as from `useSharedAnimations`) without ever passing through the rest pose:
 * - the first clip starts at full weight before the first frame is drawn, instead of fading in from the bind pose;
 * - later clips restart and cross-fade from the playing one, so the blended weight stays at one;
 * - a one-shot (`once`) hands back to `stance` when it finishes;
 * - a model without its stance clip stands in the first frame of its walk, applied once.
 * A name the model does not have keeps the playing clip.
 */
export function useClipTransition(actions: Actions, name: string | undefined, options: ClipTransitionOptions = {}): void {
  const { fade = 0.2, once = false, stance = 'idle', phase, timeScale = 1 } = options;
  const state = useRef<{ actions?: Actions; current: AnimationAction | null }>({ current: null });
  const latest = useRef({ fade, stance, onFinish: options.onFinish });
  latest.current = { fade, stance, onFinish: options.onFinish };

  useLayoutEffect(() => {
    const own = state.current;
    const first = own.actions !== actions;
    if (first) {
      own.actions = actions;
      own.current = null;
      const walk = actionFor(actions, stance, true) ? null : actionFor(actions, 'walk', false);
      if (walk) applyClipPose(walk.getRoot(), walk.getClip());
    }
    const next = name === undefined ? null : actionFor(actions, name, !once);
    const previous = own.current;
    if (!next) {
      // Standing without a stance clip: the walk's first frame is the rest state the fade returns to.
      if (previous && name === stance) previous.fadeOut(fade);
      if (name === stance) own.current = null;
      return;
    }
    if (next === previous && !once) return;
    restart(next, once);
    if (previous && previous !== next) next.crossFadeFrom(previous, fade, false);
    else if (first) {
      if (phase !== undefined && !once) next.time = (((phase % 1) + 1) % 1) * next.getClip().duration;
      next.getMixer().update(0);
    } else if (!previous) next.fadeIn(fade);
    own.current = next;
  }, [actions, name, once]);

  useLayoutEffect(() => {
    state.current.current?.setEffectiveTimeScale(timeScale);
  }, [actions, name, once, timeScale]);

  useEffect(() => {
    const mixer = Object.keys(actions).length ? actionFor(actions, Object.keys(actions)[0]!, false)?.getMixer() : undefined;
    if (!mixer) return undefined;
    const settle = ({ action }: AnimationMixerEventMap['finished']) => {
      const own = state.current;
      if (action !== own.current) return;
      const { fade: seconds, stance: back, onFinish } = latest.current;
      const next = actionFor(actions, back, true);
      if (next && next !== action) {
        restart(next, false).crossFadeFrom(action, seconds, false);
        own.current = next;
      } else {
        action.fadeOut(seconds);
        own.current = null;
      }
      onFinish?.();
    };
    mixer.addEventListener('finished', settle);
    return () => mixer.removeEventListener('finished', settle);
  }, [actions]);
}
