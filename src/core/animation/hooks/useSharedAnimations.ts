import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';

import { AnimationMixer, Frustum, Matrix4, Object3D, Sphere, type AnimationAction, type AnimationClip, type Camera } from 'three';

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

const view = { frustum: new Frustum(), matrix: new Matrix4(), bounds: new Sphere() };

/** Whether a sphere of `radius` around the object's origin is inside the camera's view. */
function inView(object: Object3D, camera: Camera, radius: number): boolean {
  view.matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  view.frustum.setFromProjectionMatrix(view.matrix, camera.coordinateSystem, camera.reversedDepth);
  object.getWorldPosition(view.bounds.center);
  view.bounds.radius = radius;
  return view.frustum.intersectsSphere(view.bounds);
}

/**
 * drei `useAnimations` with the mixers of all instances advanced by one shared frame entry in the `animation`
 * phase, instead of one R3F subscriber per instance running after the engine phases.
 *
 * With `cullRadius` the mixer only advances while a sphere of that radius around the root is in the camera's view;
 * the time skipped off screen is applied in one step when the root comes back.
 */
export function useSharedAnimations(clips: AnimationClip[], root?: Object3D | RefObject<Object3D | null>, cullRadius?: number): SharedAnimations {
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
  const skipped = useRef(0);
  useSharedFrame(ANIMATION_MIXER_FRAME, (delta, _elapsed, { camera }) => {
    const target = rootRef.current;
    if (cullRadius !== undefined && target && !inView(target, camera, cullRadius)) {
      skipped.current += delta;
      return;
    }
    mixer.update(delta + skipped.current);
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
