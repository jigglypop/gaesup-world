import type { Object3D } from 'three';

// Casters finer than a far cascade's texels, such as grass blades: only the nearest cascade resolves their shadows.
const nearOnly = new Set<Object3D>();

/** Casts `object`'s shadow into the nearest cascade only. Returns the undo. */
export function castNearShadowOnly(object: Object3D): () => void {
  nearOnly.add(object);
  return () => {
    nearOnly.delete(object);
  };
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
