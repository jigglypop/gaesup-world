import * as THREE from 'three';
import { cos, mx_noise_float, normalGeometry, positionWorld, reference, select, sin, smoothstep, texture, uv, vec3 } from 'three/tsl';
import { MeshStandardNodeMaterial } from 'three/webgpu';

import { DRIFT, DRIFT_TINT } from './grid';
import { TILE_CONSTANTS } from '../types/constants';

/** Meters one texture repeat spans on a tile top, as a tile image is drawn for one grid cell. */
const TEXTURE_METERS = TILE_CONSTANTS.GRID_CELL_SIZE;
/** Meters across the patches that break the 4 m repeat, a finer layer inside them, and how far they move brightness. */
const PATCH_METERS = 19;
const DETAIL_METERS = 6.5;
const PATCH_SHADE = 0.12;

const variants = new WeakMap<THREE.Material, { map: THREE.Texture | null; material: MeshStandardNodeMaterial }>();

/**
 * The node-renderer version of an opaque standard tile material. Its top face samples the map in world coordinates, so
 * the texture runs on across tiles whatever their size or turn. A tint the same on every load keeps a field of equal
 * tiles from showing its 4 m repeat: brighter and darker patches some 20 m across, and the island-wide drift the lawn
 * blades take (`driftPatch`), so ground and grass shift color together. Sides keep their own UVs and color. Color,
 * roughness and metalness follow the source as the editor changes them; a new map makes a new variant.
 */
export function groundMaterial(source: THREE.Material): THREE.Material {
  if (!(source instanceof THREE.MeshStandardMaterial) || 'isNodeMaterial' in source || source.transparent) return source;
  const known = variants.get(source);
  if (known?.map === source.map) return known.material;
  known?.material.dispose();
  if (!known) source.addEventListener('dispose', () => variants.get(source)?.material.dispose());
  const material = new MeshStandardNodeMaterial();
  material.name = `${source.name || 'tile'}:ground`;
  const top = normalGeometry.y.greaterThan(0.5);
  const { x, z } = positionWorld;
  const base = source.map ? texture(source.map, select(top, positionWorld.xz.div(TEXTURE_METERS), uv())).rgb : vec3(1);
  const drift = smoothstep(-DRIFT.edge, DRIFT.edge,
    sin(x.mul(DRIFT.x).add(sin(z.mul(DRIFT.warp)).mul(DRIFT.bend))).mul(cos(z.mul(DRIFT.z).add(x.mul(DRIFT.skew)))));
  const patch = mx_noise_float(positionWorld.xz.div(PATCH_METERS)).mul(0.7).add(mx_noise_float(positionWorld.xz.div(DETAIL_METERS)).mul(0.3));
  const tint = vec3(...DRIFT_TINT.base).add(vec3(...DRIFT_TINT.swing).mul(drift)).mul(patch.mul(PATCH_SHADE).add(1));
  material.colorNode = base.mul(reference('color', 'color', source)).mul(select(top, tint, vec3(1)));
  material.roughnessNode = reference('roughness', 'float', source);
  material.metalnessNode = reference('metalness', 'float', source);
  variants.set(source, { map: source.map, material });
  return material;
}
