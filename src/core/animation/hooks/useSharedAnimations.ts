import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';

import { AnimationMixer, Object3D, type AnimationAction, type AnimationClip } from 'three';

import { useSharedFrame, type SharedFrameChannel } from '../../runtime/frame';

/** Every mixer advances in this one entry, after physics presentation and before bone attachments and cameras. */
export const ANIMATION_MIXER_FRAME: SharedFrameChannel = { phase: 'animation', label: 'animation:mixers' };

export type SharedAnimations = {
  ref: RefObject<Object3D | null>;
  clips: AnimationClip[];
  mixer: AnimationMixer;
  names: string[];
  actions: Record<string, AnimationAction | null>;
};

/**
 * drei `useAnimations` with the mixers of all instances advanced by one shared frame entry in the `animation`
 * phase, instead of one R3F subscriber per instance running after the engine phases.
 */
export function useSharedAnimations(clips: AnimationClip[], root?: Object3D | RefObject<Object3D | null>): SharedAnimations {
  const ref = useRef<Object3D | null>(null);
  const [rootRef] = useState<RefObject<Object3D | null>>(() => (root ? (root instanceof Object3D ? { current: root } : root) : ref));
  const [mixer] = useState(() => new AnimationMixer(undefined as unknown as Object3D));
  useLayoutEffect(() => {
    if (root) rootRef.current = root instanceof Object3D ? root : root.current;
    (mixer as unknown as { _root: Object3D | null })._root = rootRef.current;
  });
  const lazyActions = useRef<Record<string, AnimationAction>>({});
  const api = useMemo<SharedAnimations>(() => {
    const actions: Record<string, AnimationAction | null> = {};
    for (const clip of clips) {
      Object.defineProperty(actions, clip.name, {
        enumerable: true,
        configurable: true,
        get() {
          if (!rootRef.current) return null;
          return lazyActions.current[clip.name] ??= mixer.clipAction(clip, rootRef.current);
        },
      });
    }
    return { ref: rootRef, clips, actions, names: clips.map((clip) => clip.name), mixer };
  }, [clips, mixer, rootRef]);
  useSharedFrame(ANIMATION_MIXER_FRAME, (delta) => mixer.update(delta));
  useEffect(() => {
    const currentRoot = rootRef.current;
    return () => {
      lazyActions.current = {};
      mixer.stopAllAction();
      for (const clip of clips) if (currentRoot) mixer.uncacheAction(clip, currentRoot);
    };
  }, [clips, mixer, rootRef]);
  return api;
}
