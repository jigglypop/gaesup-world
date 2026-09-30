import { useThree } from '@react-three/fiber';
import type * as THREE from 'three';

import { getToonGradient } from '../../../../rendering/toon';
import { createCoverMaterial, type CoverKind } from '../../../../rendering/tsl/groundCover';
import { rendererKind } from '../../../../rendering/webgpu';
import { useShoreField } from '../../../terrain/useShoreField';
import { useTrailField } from '../../../terrain/useTrailField';

const NO_FIELDS = {};
const materials = new WeakMap<object, Map<string, THREE.Material>>();

/**
 * The node material of a sand or snow cover, shared by every surface of the world with the same look: world-space
 * grain, glints, relief, wet sand along the shore field and footprints from the trail field. Null on the classic
 * WebGL renderer, whose covers keep their vertex-colored materials, and when not `enabled`. A `fringe` blends by vertex
 * alpha over the floor.
 */
export function useCoverMaterial(kind: CoverKind, toon: boolean, { fringe = false, enabled = true } = {}): THREE.Material | null {
  const node = rendererKind(useThree((state) => state.gl)) !== 'webgl' && enabled;
  const shore = useShoreField();
  const trail = useTrailField(node);
  if (!node) return null;
  const wet = kind === 'sand' ? shore : null;
  const owner = trail ?? NO_FIELDS;
  let byLook = materials.get(owner);
  if (!byLook) materials.set(owner, (byLook = new Map()));
  const key = `${kind}|${toon}|${fringe}|${wet ? 'shore' : ''}`;
  let material = byLook.get(key);
  if (!material) {
    material = createCoverMaterial({
      kind, toon, fringe, shore: wet, trail, ...(toon ? { gradientMap: getToonGradient(4) } : {}),
    });
    byLook.set(key, material);
  }
  return material;
}
