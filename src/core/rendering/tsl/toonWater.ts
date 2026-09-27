import {
  attribute, cameraPosition, color, cos, dot, max, mix, modelWorldMatrix, normalize, normalMap as perturbNormal, normalView,
  pow, positionGeometry, positionWorld, sin, smoothstep, texture, uniform, vec2, vec3, vec4,
} from 'three/tsl';
import { MeshBasicNodeMaterial, MeshStandardNodeMaterial, type Node, type Texture, type Vector4 } from 'three/webgpu';

import { getSharedWaterNormals } from '../../building/components/mesh/water/normals';
import { WATER_COLORS, WATER_SHORE, type WaterLodState } from '../../building/components/mesh/water/shading';

/** Shore coverage as water reads it: a texture and the transform from world xz to its uv. */
export type WaterFieldBinding = { readonly texture: Texture; readonly transform: Vector4 };

export type WaterMaterialOptions = {
  /** Unlit stylized shading; otherwise lit PBR water. */
  toon?: boolean | undefined;
  /** Without a field the geometry's `waterCoverage` attribute shapes the shore. */
  field?: WaterFieldBinding | null | undefined;
  /** Open sea: opaque. Other water fades in across its bank. */
  open?: boolean | undefined;
  lod?: WaterLodState | undefined;
};

const band = (value: Node<'float'>, [from, to]: readonly [number, number]) => smoothstep(from, to, value);

/**
 * Node water: bank, wet sand, shallows and deep water from shore coverage, a foam line at the waterline and two
 * scrolling samples of a tileable normal map. Fog and tone mapping apply like any surface. No render target.
 */
export function createToonWaterMaterial(
  normalMap: Texture = getSharedWaterNormals(),
  { toon = true, field = null, open = false, lod }: WaterMaterialOptions = {},
) {
  const time = uniform(0);
  /** Surface multiplier so day/night scenes can dim the water. */
  const brightness = uniform(1);
  const detail = uniform(1).onRenderUpdate(() => (lod?.detailed === false ? 0 : 1));
  const shore = field ? { texture: field.texture, transform: uniform(field.transform) } : null;
  const coverageAt = (xz: Node<'vec2'>): Node<'float'> => (shore
    ? texture(shore.texture, xz.sub(shore.transform.xy).mul(shore.transform.zw)).r
    : attribute<'float'>('waterCoverage', 'float'));

  // A slow world-space swell that continues across surfaces and stays flat over the bank.
  const local = positionGeometry;
  const origin = modelWorldMatrix.mul(vec4(local, 1)).xz;
  const swell = sin(origin.x.mul(0.55).add(time.mul(0.85))).mul(0.045)
    .add(sin(origin.y.mul(0.78).sub(time.mul(1.05)).add(origin.x.mul(0.33))).mul(0.025))
    .add(sin(origin.x.add(origin.y).mul(1.4).add(time.mul(1.6))).mul(0.012));
  const positionNode = vec3(local.x, local.y, local.z.add(swell.mul(smoothstep(0.7, 0.9, coverageAt(origin))).mul(detail)));

  const world = positionWorld.xz;
  const coverage = coverageAt(world);
  const edge = coverage.add(sin(world.x.mul(0.9).add(sin(world.y.mul(0.63)).mul(1.4)))
    .mul(cos(world.y.mul(0.77).sub(world.x.mul(0.21)))).mul(WATER_SHORE.wobble));
  const a = texture(normalMap, world.mul(0.055).add(vec2(time.mul(0.009), time.mul(0.004))));
  const b = texture(normalMap, world.mul(0.12).add(vec2(time.mul(-0.006), time.mul(0.008))));
  const wet = band(edge, WATER_SHORE.water);
  const [foamIn, foamPeak, foamOut, foamEnd] = WATER_SHORE.foam;
  const ripple = sin(world.x.mul(0.7).add(world.y.mul(0.5)).sub(time.mul(0.55))).mul(0.5).add(0.5);
  const foam = band(edge, [foamIn, foamPeak]).mul(band(edge, [foamOut, foamEnd]).oneMinus())
    .mul(ripple.mul(detail).mul(0.45).add(0.55));
  const bank = mix(color(WATER_COLORS.bank), color(WATER_COLORS.wet), band(edge, WATER_SHORE.wet));
  let body = mix(color(WATER_COLORS.shallow), color(WATER_COLORS.deep), band(coverage, WATER_SHORE.depth));

  let material: MeshBasicNodeMaterial | MeshStandardNodeMaterial;
  if (toon) {
    material = new MeshBasicNodeMaterial();
    const tilt = vec2(a.x.add(b.x).sub(1), a.y.add(b.y).sub(1)).mul(detail.mul(0.7));
    const n = normalize(vec3(tilt.x, 1, tilt.y));
    const view = normalize(cameraPosition.sub(positionWorld));
    const fresnel = pow(max(dot(n, view), 0).oneMinus(), 3);
    const highlight = pow(max(dot(n, normalize(view.add(vec3(-0.5, 0.9, -0.3).normalize()))), 0), 96).mul(detail);
    body = mix(body, color(WATER_COLORS.sky), fresnel.mul(0.5)).add(highlight.mul(0.35));
  } else {
    const lit = new MeshStandardNodeMaterial({ metalness: 0 });
    // NormalMapNode's declaration omits its vec3 result type.
    const ripples = perturbNormal(a.rgb.add(b.rgb).mul(0.5), vec2(0.35, 0.35)) as unknown as Node<'vec3'>;
    lit.normalNode = normalize(mix(normalView, ripples, wet.mul(detail)));
    lit.roughnessNode = mix(0.95, 0.14, wet);
    material = lit;
  }
  material.positionNode = positionNode;
  material.colorNode = mix(bank, mix(body, color(WATER_COLORS.foam), foam.mul(0.8)), wet).mul(brightness);
  if (!open) {
    material.transparent = true;
    material.depthWrite = false;
    material.opacityNode = band(edge, WATER_SHORE.edge);
  }
  return { material, time, brightness };
}
