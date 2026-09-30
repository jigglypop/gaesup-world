import * as THREE from 'three';
import {
  cameraPosition, cos, distance, mix, mx_noise_float, normalGeometry, positionWorld, reference, select, sin, smoothstep, texture, uv, vec2, vec3,
} from 'three/tsl';
import { MeshStandardNodeMaterial } from 'three/webgpu';

import { DRIFT, DRIFT_TINT } from './grid';
import { groundNormal, weatherGround } from '../../rendering/tsl/groundCover';
import { WEATHER_SURFACE_GLSL, weatherGlUniforms } from '../../weather/core/glsl';
import { TILE_CONSTANTS } from '../types/constants';

/** Meters one texture repeat spans on a tile top, as a tile image is drawn for one grid cell. */
const TEXTURE_METERS = TILE_CONSTANTS.GRID_CELL_SIZE;
/** Meters across the patches that break the 4 m repeat, a finer layer inside them, and how far they move brightness. */
const PATCH_METERS = 19;
const DETAIL_METERS = 6.5;
const PATCH_SHADE = 0.12;
/**
 * Under a grass layer the ground lies in the blades' shade, deeper green, until the blades thin out with distance
 * (the lawn's LOD, `GRASS_LOD.lawn`): past that the ground alone carries the lawn's color.
 */
const UNDER_GRASS = { shade: [0.78, 0.85, 0.74], near: 22, far: 60 } as const;
/** How far rain darkens bare soil and ground under grass (`weatherGround`). */
export const GROUND_POROSITY = { soil: 0.85, grass: 0.7 } as const;

type Variant = { map: THREE.Texture | null; material: MeshStandardNodeMaterial };
const variants = new WeakMap<THREE.Material, Map<boolean, Variant>>();

/**
 * The node-renderer version of an opaque standard tile material. Its top face samples the map in world coordinates, so
 * the texture runs on across tiles whatever their size or turn. A tint the same on every load keeps a field of equal
 * tiles from showing its 4 m repeat: brighter and darker patches some 20 m across, and the island-wide drift the lawn
 * blades take (`driftPatch`), so ground and grass shift color together. With `grass` the tops lie in the blades' shade
 * where they grow thick. Sides keep their own UVs and color. The live weather wets the tiles, pools puddles with rain
 * rings on bare tops and snows over them. Color, roughness and metalness follow the source as the editor changes them;
 * a new map makes a new variant.
 */
export function groundMaterial(source: THREE.Material, grass = false): THREE.Material {
  if (!(source instanceof THREE.MeshStandardMaterial) || 'isNodeMaterial' in source || source.transparent) return source;
  let kinds = variants.get(source);
  if (!kinds) {
    variants.set(source, (kinds = new Map()));
    source.addEventListener('dispose', () => kinds!.forEach((variant) => variant.material.dispose()));
  }
  const known = kinds.get(grass);
  if (known?.map === source.map) return known.material;
  known?.material.dispose();
  const material = new MeshStandardNodeMaterial();
  material.name = `${source.name || 'tile'}:ground`;
  const top = normalGeometry.y.greaterThan(0.5);
  const { x, z } = positionWorld;
  const base = source.map ? texture(source.map, select(top, positionWorld.xz.div(TEXTURE_METERS), uv())).rgb : vec3(1);
  const drift = smoothstep(-DRIFT.edge, DRIFT.edge,
    sin(x.mul(DRIFT.x).add(sin(z.mul(DRIFT.warp)).mul(DRIFT.bend))).mul(cos(z.mul(DRIFT.z).add(x.mul(DRIFT.skew)))));
  const patch = mx_noise_float(positionWorld.xz.div(PATCH_METERS)).mul(0.7).add(mx_noise_float(positionWorld.xz.div(DETAIL_METERS)).mul(0.3));
  const tint = vec3(...DRIFT_TINT.base).add(vec3(...DRIFT_TINT.swing).mul(drift)).mul(patch.mul(PATCH_SHADE).add(1));
  const shaded = grass
    ? tint.mul(mix(vec3(...UNDER_GRASS.shade), vec3(1), smoothstep(UNDER_GRASS.near, UNDER_GRASS.far, distance(cameraPosition, positionWorld))))
    : tint;
  const color = base.mul(reference('color', 'color', source)).mul(select(top, shaded, vec3(1)));
  // Grass soaks rain up; bare tiles pool it.
  const weather = grass ? { porosity: GROUND_POROSITY.grass, puddles: false } : { porosity: GROUND_POROSITY.soil };
  const ground = weatherGround(color, reference('roughness', 'float', source), weather);
  material.colorNode = ground.color;
  material.roughnessNode = ground.roughness;
  if (!grass) material.normalNode = groundNormal(vec2(0));
  material.metalnessNode = reference('metalness', 'float', source);
  kinds.set(grass, { map: source.map, material });
  return material;
}

const weathered = new WeakSet<THREE.Material>();

/**
 * The live weather on a classic renderer's lit material (standard, physical, toon, lambert): wet darkens it by
 * `porosity` and glosses a standard one, and lying snow covers what faces up (`WEATHER_SURFACE_GLSL`, no noise). The
 * shader reads the shared uniforms, so a weather change rebuilds nothing. Node renderers ignore it; patches once.
 */
export function classicWeather<T extends THREE.Material>(material: T, porosity = 1): T {
  if (weathered.has(material)) return material;
  weathered.add(material);
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, weatherGlUniforms());
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `${WEATHER_SURFACE_GLSL}\nvoid main() {`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
  float weatherSoak = clamp(weatherWetness * ${porosity.toFixed(3)}, 0.0, 1.0);
  diffuseColor.rgb = weatherSnow(diffuseColor.rgb * mix(1.0, 0.58, weatherSoak), (vec4(normal, 0.0) * viewMatrix).y);
#ifdef STANDARD
  roughnessFactor = mix(roughnessFactor, 0.3, weatherSoak);
#endif`);
  };
  material.customProgramCacheKey = () => `weather:${porosity}`;
  material.needsUpdate = true;
  return material;
}
