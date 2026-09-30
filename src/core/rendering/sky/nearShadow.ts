import type { Mesh, Object3D } from 'three';

// Casters finer than a far cascade's texels, such as grass blades: only the nearest cascade resolves their shadows.
const nearOnly = new Set<Object3D>();

/** Casters currently drawn into the nearest cascade only. */
export function countNearOnlyCasters(): number {
  return nearOnly.size;
}

/** Casts `object`'s shadow into the nearest cascade only. Returns the undo. */
export function castNearShadowOnly(object: Object3D): () => void {
  nearOnly.add(object);
  return () => {
    nearOnly.delete(object);
  };
}

/**
 * Small props: every mesh under `root` casts into the nearest cascade only and receives shadows. The far cascades would
 * spend a draw per mesh on shadows a few texels wide. Returns the undo.
 */
export function castSubtreeNearShadowOnly(root: Object3D): () => void {
  const releases: (() => void)[] = [];
  root.traverse((child) => {
    if (!(child as Mesh).isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    releases.push(castNearShadowOnly(child));
  });
  return () => releases.forEach((release) => release());
}

type Cascade = { renderShadow(frame: unknown): void };

/** Renders `cascade` with the near-only casters sitting it out. */
export function skipNearOnlyCasters(cascade: Cascade): void {
  const render = cascade.renderShadow;
  cascade.renderShadow = function (this: Cascade, frame: unknown) {
    const skipped: Object3D[] = [];
    for (const caster of nearOnly) {
      if (!caster.castShadow) continue;
      caster.castShadow = false;
      skipped.push(caster);
    }
    try {
      render.call(this, frame);
    } finally {
      for (const caster of skipped) caster.castShadow = true;
    }
  };
}
