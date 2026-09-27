import type { Object3D, SkinnedMesh } from 'three';

/**
 * Lets the renderer drop what it built for a clone that leaves the scene for good: its skeletons' bone textures and
 * each object's render objects (three r186 `Object3D.dispose`, skipped on releases without it). Geometry and materials
 * shared with a cached model stay; the cache owns them.
 */
export function releaseObject(root: Object3D): void {
  const skeletons = new Set<SkinnedMesh['skeleton']>();
  root.traverse((object) => {
    if ((object as SkinnedMesh).isSkinnedMesh) skeletons.add((object as SkinnedMesh).skeleton);
  });
  skeletons.forEach((skeleton) => skeleton.dispose());
  root.traverse((object) => (object as Object3D & { dispose?: () => void }).dispose?.());
}
