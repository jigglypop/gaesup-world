import { useLayoutEffect, useState } from 'react';

import type { Object3D } from 'three';

import { applyToonToScene, getDefaultToonMode, releaseToonFromScene } from './toon';

/** Applies default toon materials to an owned clone and releases them on change or unmount. Returns a revision bumped after each application. */
export function useSceneToon(root: Object3D | null | undefined): number {
  const [revision, setRevision] = useState(0);
  useLayoutEffect(() => {
    if (!root || !getDefaultToonMode()) return;
    applyToonToScene(root);
    setRevision((value) => value + 1);
    return () => releaseToonFromScene(root);
  }, [root]);
  return revision;
}
