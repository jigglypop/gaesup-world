import {
  abs, cameraPosition, cameraViewMatrix, color, dot, exp, length, max, min, mix, modelWorldMatrix, normalize, normalMap as perturbNormal, normalView,
  positionGeometry, positionView, positionWorld, pow, screenUV, sin, smoothstep, texture, uniform, vec2, vec3, vec4, viewportTexture,
} from 'three/tsl';
import { MeshBasicNodeMaterial, MeshStandardNodeMaterial, type Node, type Texture } from 'three/webgpu';

import { shoreEdge, waterDepthAt, waterShore, type WaterFieldBinding } from './waterBed';
import { rainRipples, weatherNodes } from './weatherSurface';
import { getSharedWaterNormals } from '../../building/components/mesh/water/normals';
import { WATER_BED_MARK, WATER_COLORS, WATER_OPTICS, WATER_SHORE, type WaterLodState } from '../../building/components/mesh/water/shading';

export type { WaterFieldBinding } from './waterBed';

export type WaterMaterialOptions = {
  /** Unlit stylized shading; otherwise lit PBR water. */
  toon?: boolean | undefined;
  /** Without a field the geometry's `waterCoverage` and `waterDistance` attributes shape the shore. */
  field?: WaterFieldBinding | null | undefined;
  /** Open sea over a shelving sea floor. Other water fades in across its bank over a pond floor. */
  open?: boolean | undefined;
  lod?: WaterLodState | undefined;
};

let sceneColor: ReturnType<typeof viewportTexture> | null = null;

/** The frame under the water, copied once per render and shared by every water surface. */
function getSceneColor(): ReturnType<typeof viewportTexture> {
  sceneColor ??= viewportTexture();
  return sceneColor;
}

const band = (value: Node<'float'>, [from, to]: readonly [number, number]) => smoothstep(from, to, value);

/** 1 where the framebuffer shows a water floor (alpha `WATER_BED_MARK`), 0 where it shows anything else. */
const onFloor = (alpha: Node<'float'>) => smoothstep(WATER_BED_MARK + (1 - WATER_BED_MARK) * 0.25, WATER_BED_MARK + (1 - WATER_BED_MARK) * 0.75, alpha)
  .oneMinus();

/**
 * Node water over its floor (`createWaterBedMaterial`). The frame behind shows through, bent by the ripples and absorbed
 * with the water in front of the floor, so shallows over sand are clear turquoise and deep water turns blue and opaque.
 * Fresnel trades that view for the reflection at grazing angles; foam gathers in the shallows and along the shore.
 * The live weather rings it with raindrops, raises its swell and chop with the wind, and whitens it with spray in rain
 * and whitecaps in a gale. One copy of the frame per render, no extra pass.
 */
export function createToonWaterMaterial(
  normalMap: Texture = getSharedWaterNormals(),
  { toon = true, field = null, open = false, lod }: WaterMaterialOptions = {},
) {
  const time = uniform(0);
  /** Surface multiplier so day/night scenes can dim the water. */
  const brightness = uniform(1);
  const detail = uniform(1).onRenderUpdate(() => (lod?.detailed === false ? 0 : 1));
  const shore = waterShore(field);
  const { rain, windStrength } = weatherNodes();
  // 1 on a calm day, about 2 in wind and 2.6 in a storm's gusts.
  const blow = windStrength.add(0.8);

  // A slow world-space swell that continues across surfaces and stays flat over the bank; a pond barely stirs.
  const local = positionGeometry;
  const origin = modelWorldMatrix.mul(vec4(local, 1)).xz;
  const swell = sin(origin.x.mul(0.55).add(time.mul(0.85))).mul(0.045)
    .add(sin(origin.y.mul(0.78).sub(time.mul(1.05)).add(origin.x.mul(0.33))).mul(0.025))
    .add(sin(origin.x.add(origin.y).mul(1.4).add(time.mul(1.6))).mul(0.012));
  const stir = smoothstep(0.7, 0.9, shore.coverageAt(origin)).mul(detail).mul(open ? 1 : 0.3);
  const positionNode = vec3(local.x, local.y, local.z.add(swell.mul(stir).mul(blow)));

  const world = positionWorld.xz;
  const edge = shoreEdge(world, shore.coverageAt(world));
  const a = texture(normalMap, world.mul(0.055).add(vec2(time.mul(0.009), time.mul(0.004))));
  const b = texture(normalMap, world.mul(0.12).add(vec2(time.mul(-0.006), time.mul(0.008))));
  // Wind roughens the ripples; raindrops ring them.
  const chop = blow.mul(0.45).add(0.55);
  const drops = rainRipples(world).mul(detail);
  const tilt = vec2(a.x.add(b.x).sub(1), a.y.add(b.y).sub(1)).mul(detail).mul(chop).add(drops);
  const n = normalize(vec3(tilt.x.mul(0.7), 1, tilt.y.mul(0.7)));
  const view = normalize(cameraPosition.sub(positionWorld));

  // Water between the surface and the floor along the view ray; the floor's depth is known right under the surface,
  // and whatever stands in the water reads as that deep too. Ripples bend the view only where it lands on the floor
  // both ways, so nothing above the water or in front of it smears into the water.
  const thickness = waterDepthAt(shore.distanceAt(world), open).div(max(abs(view.y), 0.15));
  const frame = getSceneColor();
  const straight = frame.sample(screenUV);
  const bentUV = screenUV.add(tilt.mul(WATER_OPTICS.refraction).mul(min(thickness, 2)).div(max(positionView.z.negate(), 1)));
  const bent = frame.sample(bentUV);
  const behind = mix(straight.rgb, bent.rgb, onFloor(straight.a).mul(onFloor(bent.a)));
  const [ar, ag, ab] = WATER_OPTICS.absorption;
  const backdrop = behind.mul(exp(vec3(ar, ag, ab).mul(thickness.negate())));

  const wet = band(edge, WATER_SHORE.water);
  const [foamIn, foamPeak, foamOut, foamEnd] = WATER_SHORE.foam;
  const ripple = sin(world.x.mul(0.7).add(world.y.mul(0.5)).sub(time.mul(0.55))).mul(0.5).add(0.5);
  const lace = smoothstep(0.35, 0.65, a.x.add(b.y).mul(0.5)).mul(detail).mul(0.6).add(0.4);
  const shallows = smoothstep(0, WATER_OPTICS.foam, thickness).oneMinus().mul(lace);
  // Rain spatters the whole surface and whitens the rings of its drops; a gale whips whitecaps where the ripples crest.
  const crest = smoothstep(0.55, 0.8, a.x.add(b.y).mul(0.5)).mul(detail);
  const spray = rain.mul(0.14).add(crest.mul(smoothstep(0.9, 1.8, windStrength).mul(0.55).add(rain.mul(0.3)))).add(length(drops).mul(1.6));
  const foam = max(band(edge, [foamIn, foamPeak]).mul(band(edge, [foamOut, foamEnd]).oneMinus()), shallows)
    .mul(ripple.mul(detail).mul(0.45).add(0.55)).add(spray).min(1);
  const bank = mix(color(WATER_COLORS.bank), color(WATER_COLORS.wet), band(edge, WATER_SHORE.wet));
  const body = mix(color(WATER_COLORS.shallow), color(WATER_COLORS.deep), exp(thickness.div(-WATER_OPTICS.deepening)).oneMinus());

  const fresnel = pow(max(dot(n, view), 0).oneMinus(), 5).mul(1 - WATER_OPTICS.reflectance).add(WATER_OPTICS.reflectance);
  // How much of the frame behind shows: what the water lets through and the surface neither reflects nor foams over.
  const seeThrough = exp(thickness.mul(-WATER_OPTICS.clarity)).mul(fresnel.oneMinus()).mul(foam.mul(0.85).oneMinus()).mul(wet);

  let material: MeshBasicNodeMaterial | MeshStandardNodeMaterial;
  let surface: Node<'vec3'> = mix(body, color(WATER_COLORS.foam), foam.mul(0.8));
  let seen: Node<'vec3'> = backdrop;
  if (toon) {
    material = new MeshBasicNodeMaterial();
    // Unlit: the sky and a fixed sun glint stand in for the reflection, on the water and on what shows through it alike.
    const highlight = pow(max(dot(n, normalize(view.add(vec3(-0.5, 0.9, -0.3).normalize()))), 0), 96).mul(detail);
    const glint = highlight.mul(0.5).mul(wet);
    surface = mix(surface, color(WATER_COLORS.sky), fresnel.mul(0.6)).add(glint);
    seen = backdrop.add(glint.mul(brightness));
  } else {
    const lit = new MeshStandardNodeMaterial({ metalness: 0 });
    // NormalMapNode's declaration omits its vec3 result type.
    const ripples = perturbNormal(a.rgb.add(b.rgb).mul(0.5), vec2(chop.mul(0.35))) as unknown as Node<'vec3'>;
    const rings = cameraViewMatrix.mul(vec4(drops.x, 0, drops.y, 0)).xyz;
    lit.normalNode = normalize(mix(normalView, ripples, wet.mul(detail)).add(rings.mul(wet)));
    lit.roughnessNode = mix(0.95, 0.06, wet);
    material = lit;
  }
  material.name = 'water-surface';
  material.positionNode = positionNode;
  material.colorNode = mix(bank, surface, wet).mul(brightness);
  material.backdropNode = seen;
  material.backdropAlphaNode = seeThrough;
  // Drawn after the opaque frame it shows; the surface mesh draws first among see-through things.
  material.transparent = true;
  material.depthWrite = false;
  if (!open) material.opacityNode = band(edge, WATER_SHORE.edge);
  return { material, time, brightness };
}
