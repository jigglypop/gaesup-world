import { useLayoutEffect, useRef, type ReactNode } from 'react';

import { useThree } from '@react-three/fiber';
import type { Camera, Group, Object3D, Scene } from 'three';

import { isGpuBatchRevision } from './gpuBatchRevision';

type AsyncCompiler = { compileAsync: (scene: Object3D, camera: Camera, targetScene?: Scene | null) => Promise<unknown> };

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
  try {
    return renderer.compileAsync(root, camera, scene);
  } finally {
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
    compileSubtreeAsync(gl, root, camera, scene)
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
