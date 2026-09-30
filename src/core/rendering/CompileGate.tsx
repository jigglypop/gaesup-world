import { useLayoutEffect, useRef, type ReactNode } from 'react';

import { useThree } from '@react-three/fiber';
import type { Group } from 'three';

import { canCompileAsync, compileInSlices, countCompile, hideUntilCompiled, sceneTargets } from './sceneCompile';

export {
  compileInSlices,
  compileSceneAsync,
  compileSubtreeAsync,
  pendingCompiles,
  setSceneRenderTarget,
  subscribeCompiles,
  type SceneRenderTarget,
} from './sceneCompile';

/**
 * Keeps first-time content hidden until its pipelines are built asynchronously, instead of stalling the frame that
 * first draws it on synchronous shader and pipeline creation. Its drawables compile in slices on later tasks
 * (`compileInSlices`), so content that mounts all at once, a whole world, never builds in one long task. Place it
 * inside the Suspense boundary of the content, so the gate commits together with what it compiles.
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
    const reveal = hideUntilCompiled(root);
    // Postprocessing loads after the first content mounts; content still hidden when its scene target appears is
    // compiled again for that target, since the first compile built pipelines for a target the scene never uses.
    const compile = (): Promise<unknown> => {
      const target = sceneTargets.get(gl);
      return compileInSlices(gl, root, camera, scene, () => active)
        .then(() => (active && sceneTargets.get(gl) !== target ? compile() : undefined));
    };
    let counted = true;
    const settle = () => {
      if (!counted) return;
      counted = false;
      countCompile(-1);
    };
    countCompile(1);
    compile()
      .catch(() => undefined)
      .finally(() => {
        if (active) reveal();
        settle();
      });
    return () => {
      active = false;
      reveal();
      settle();
    };
    // Compiles once per mount (camera swaps do not re-hide content); later edits reuse these pipelines.
  }, [gl, scene]);
  return <group ref={group}>{children}</group>;
}
