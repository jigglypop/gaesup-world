import { useLayoutEffect, useRef, type ReactNode } from 'react';

import { useThree } from '@react-three/fiber';
import type { Camera, Group, Object3D, Scene } from 'three';

import { isGpuBatchRevision } from './gpuBatchRevision';

type AsyncCompiler = { compileAsync: (scene: Object3D, camera: Camera, targetScene?: Scene | null) => Promise<unknown> };
type TargetedRenderer = {
  getRenderTarget(): unknown;
  setRenderTarget(target: unknown): void;
  getMRT(): unknown;
  setMRT(mrt: unknown): void;
};
/** Where a pass draws the scene (postprocessing): its render target and MRT outputs select the pipelines. */
export type SceneRenderTarget = { renderTarget: unknown; mrt: unknown };

const sceneTargets = new WeakMap<object, SceneRenderTarget>();

/** Registers the target a renderer draws the scene into, or clears it, so gates compile for that target. */
export function setSceneRenderTarget(renderer: TargetedRenderer, target: SceneRenderTarget | null): void {
  if (target) sceneTargets.set(renderer, target);
  else sceneTargets.delete(renderer);
}

function canCompileAsync(renderer: unknown): renderer is AsyncCompiler {
  // Verified against the revisions whose compileAsync collects render objects synchronously before its first await.
  return isGpuBatchRevision() && typeof (renderer as Partial<AsyncCompiler> | null)?.compileAsync === 'function';
}

/** Starts an async compile of `root` with `scene`'s lights while it is visible and unculled for that one call. */
export function compileSubtreeAsync(renderer: AsyncCompiler, root: Object3D, camera: Camera, scene: Scene): Promise<unknown> {
  const culled: Object3D[] = [];
  root.traverse((object) => {
    if (!object.frustumCulled) return;
    object.frustumCulled = false;
    culled.push(object);
  });
  const visible = root.visible;
  root.visible = true;
  // compileAsync reads the target and MRT before its first await, so they are restored as soon as it returns.
  const target = sceneTargets.get(renderer);
  // Only a renderer registered through setSceneRenderTarget has a target, and it can switch targets.
  const targeted = target ? (renderer as unknown as TargetedRenderer) : null;
  const previousTarget = targeted?.getRenderTarget();
  const previousMRT = targeted?.getMRT();
  if (targeted && target) {
    targeted.setRenderTarget(target.renderTarget);
    targeted.setMRT(target.mrt);
  }
  try {
    return renderer.compileAsync(root, camera, scene);
  } finally {
    if (targeted) {
      targeted.setRenderTarget(previousTarget);
      targeted.setMRT(previousMRT);
    }
    root.visible = visible;
    for (const object of culled) object.frustumCulled = true;
  }
}

/**
 * Keeps first-time content hidden until its pipelines are built asynchronously, instead of stalling the frame that
 * first draws it on synchronous shader and pipeline creation. Place it inside the Suspense boundary of the content,
 * so the gate commits together with what it compiles.
 */
export function CompileGate({ children }: { children: ReactNode }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const group = useRef<Group>(null);
  useLayoutEffect(() => {
    const root = group.current;
    if (!root || !canCompileAsync(gl)) return undefined;
    let active = true;
    root.visible = false;
    // Postprocessing loads after the first content mounts; content still hidden when its scene target appears is
    // compiled again for that target, since the first compile built pipelines for a target the scene never uses.
    const compile = (): Promise<unknown> => {
      const target = sceneTargets.get(gl);
      return compileSubtreeAsync(gl, root, camera, scene)
        .then(() => (active && sceneTargets.get(gl) !== target ? compile() : undefined));
    };
    compile()
      .catch(() => undefined)
      .finally(() => {
        if (active) root.visible = true;
      });
    return () => {
      active = false;
      root.visible = true;
    };
    // Compiles once per mount (camera swaps do not re-hide content); later edits reuse these pipelines.
  }, [gl, scene]);
  return <group ref={group}>{children}</group>;
}
