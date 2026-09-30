import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';

import { AnimationMixer, Frustum, Matrix4, Object3D, Sphere, Vector3, type AnimationAction, type AnimationClip, type Camera } from 'three';

import { useSharedFrame, type SharedFrameChannel } from '../../runtime/frame';

/** Every mixer advances in this one entry, after physics presentation and before bone attachments and cameras. */
export const ANIMATION_MIXER_FRAME: SharedFrameChannel = { phase: 'animation', label: 'animation:mixers' };

/** A mixer beyond its far distance advances at most this often; at that size on screen the steps do not show. */
const FAR_MIXER_SECONDS = 1 / 15;

export type SharedAnimations = {
  ref: RefObject<Object3D | null>;
  clips: AnimationClip[];
  mixer: AnimationMixer;
  names: string[];
  actions: Record<string, AnimationAction | null>;
};

const view = { frustum: new Frustum(), matrix: new Matrix4(), bounds: new Sphere(), eye: new Vector3() };

/** Whether a sphere of `radius` around `view.bounds.center` is inside the camera's view. */
function inView(camera: Camera, radius: number): boolean {
  view.matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  view.frustum.setFromProjectionMatrix(view.matrix, camera.coordinateSystem, camera.reversedDepth);
  view.bounds.radius = radius;
  return view.frustum.intersectsSphere(view.bounds);
}

/** Common clip spellings of exported models, by lowercase name, mapped to the engine's clip names. */
const CANONICAL_CLIP_NAMES: Readonly<Record<string, string>> = {
  idle: 'idle', walk: 'walk', walking: 'walk', run: 'run', running: 'run',
  jump: 'jump', jumping: 'jump', fall: 'fall', falling: 'fall',
};

/**
 * drei `useAnimations` with the mixers of all instances advanced by one shared frame entry in the `animation`
 * phase, instead of one R3F subscriber per instance running after the engine phases.
 *
 * With `cullRadius` the mixer only advances while a sphere of that radius around the root is in the camera's view;
 * the time skipped off screen is applied in one step when the root comes back. Beyond `farDistance` from the camera
 * it advances at 15 Hz.
 */
export function useSharedAnimations(clips: AnimationClip[], root?: Object3D | RefObject<Object3D | null>, cullRadius?: number, farDistance?: number): SharedAnimations {
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
    const define = (name: string, clip: AnimationClip) => Object.defineProperty(actions, name, {
      enumerable: true,
      configurable: true,
      get() {
        if (!rootRef.current) return null;
        return lazyActions.current[clip.name] ??= mixer.clipAction(clip, rootRef.current);
      },
    });
    for (const clip of clips) define(clip.name, clip);
    // Engine names ('idle', 'walk', 'run') also find the spellings models ship with, unless a clip already has them.
    // They are listed too, so copies such as the animation bridge's registration keep them; both names share one action.
    for (const clip of clips) {
      const canonical = CANONICAL_CLIP_NAMES[clip.name.toLowerCase()];
      if (canonical && !(canonical in actions)) define(canonical, clip);
    }
    return { ref: rootRef, clips, actions, names: clips.map((clip) => clip.name), mixer };
  }, [clips, mixer, rootRef]);
  const skipped = useRef(0);
  useSharedFrame(ANIMATION_MIXER_FRAME, (delta, _elapsed, { camera }) => {
    const target = rootRef.current;
    // A frame clock that jumps back must not rewind the mixers: negative time runs every clip before its start.
    skipped.current += Math.max(0, delta || 0);
    if (target && (cullRadius !== undefined || farDistance !== undefined)) {
      target.getWorldPosition(view.bounds.center);
      if (cullRadius !== undefined && !inView(camera, cullRadius)) return;
      if (farDistance !== undefined && skipped.current < FAR_MIXER_SECONDS
        && view.bounds.center.distanceToSquared(view.eye.setFromMatrixPosition(camera.matrixWorld)) > farDistance * farDistance) return;
    }
    mixer.update(skipped.current);
    skipped.current = 0;
  });
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
