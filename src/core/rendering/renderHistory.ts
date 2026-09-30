import type { Scene } from 'three';

const revisions = new WeakMap<Scene, number>();

/** GPU compaction indices are transient; structural edits invalidate temporal samples. */
export function invalidateRenderHistory(scene: Scene): void {
  revisions.set(scene, getRenderHistoryRevision(scene) + 1);
}

export function getRenderHistoryRevision(scene: Scene): number {
  return revisions.get(scene) ?? 0;
}
