import {
  abs,
  attribute,
  cameraPosition,
  cameraViewMatrix,
  cos,
  cross,
  dot,
  floor,
  fract,
  length,
  max,
  mix,
  mod,
  normalize,
  positionGeometry,
  sin,
  smoothstep,
  step,
  time,
  uniform,
  uv,
  varying,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';
import { Color, DoubleSide, MeshLambertNodeMaterial, Vector2, type Node } from 'three/webgpu';

import type { PrecipitationKind } from '../../weather/types';

export function createPrecipitationUniforms() {
  return {
    /** Half the side of the square volume kept around the view. */
    radius: uniform(20),
    /** Height of the volume above `ground`. */
    height: uniform(22),
    ground: uniform(0),
    /** The layer's wind travel, wrapped to the volume. */
    offset: uniform(new Vector2()),
    /** Wind velocity in m/s, which slants the rain. */
    velocity: uniform(new Vector2()),
    /** Leaf colors, blended per leaf. */
    tint: uniform(new Color('#f2b6c8')),
    tintAlt: uniform(new Color('#fbe0e8')),
  };
}

export type PrecipitationUniforms = ReturnType<typeof createPrecipitationUniforms>;

type F = Node<'float'>;

const hash11 = (x: F) => fract(sin(x.mul(12.9898)).mul(43758.5453));
/** A camera axis in world space: a direction times the view matrix from the left is its inverse rotation. */
const worldAxis = (x: number, y: number, z: number) => vec4(x, y, z, 0).mul(cameraViewMatrix).xyz;
/** Faces the camera and tilts up, so particles catch the sky fill and the sun alike (a view-space normal). */
const facing = () => normalize(vec3(0, 0, 1).add(cameraViewMatrix.mul(vec4(0, 1, 0, 0)).xyz.mul(0.6)));

/**
 * A square volume around the view, a little ahead of the camera. Particles keep world positions and wrap around its
 * edges as it moves, fading out near them so none pops.
 */
function volume(u: PrecipitationUniforms) {
  const center = cameraPosition.xz.add(worldAxis(0, 0, -1).xz.mul(u.radius.mul(0.7)));
  const span = u.radius.mul(2);
  const wrap = (value: F, c: F) => mod(value.sub(c).add(u.radius), span).add(c).sub(u.radius);
  const edge = (x: F, z: F) => smoothstep(u.radius, u.radius.mul(0.7), max(abs(x.sub(center.x)), abs(z.sub(center.y))));
  return { center, span, wrap, edge };
}

function rain(material: MeshLambertNodeMaterial, u: PrecipitationUniforms, seed: Node<'vec4'>) {
  const { center, span, wrap, edge } = volume(u);
  const speed = mix(9, 13, seed.w);
  const y = u.ground.sub(0.3).add(mod(seed.y.mul(u.height).sub(time.mul(speed)), u.height));
  const x = wrap(seed.x.mul(span).add(u.offset.x), center.x);
  const z = wrap(seed.z.mul(span).add(u.offset.y), center.y);
  const head = vec3(x, y, z);
  const axis = normalize(vec3(u.velocity.x, speed.negate(), u.velocity.y));
  const toCamera = cameraPosition.sub(head);
  const distance = length(toCamera);
  const side = normalize(cross(axis, toCamera));
  const corner = positionGeometry.xy;
  // At least about a pixel wide at any distance; as long as the drop falls in two frames.
  material.positionNode = head
    .add(side.mul(corner.x.mul(distance.mul(0.0018).add(0.012))))
    .add(axis.mul(corner.y.sub(0.5).mul(speed.mul(0.07))));
  const fade = varying(smoothstep(0.6, 2.5, distance).mul(smoothstep(u.radius.mul(2.5), u.radius, distance)).mul(edge(x, z)));
  const across = abs(uv().x.sub(0.5)).mul(2).oneMinus();
  material.colorNode = vec3(0.78, 0.84, 0.92);
  material.emissive.setRGB(0.08, 0.1, 0.13);
  material.opacityNode = across.mul(across).mul(smoothstep(0, 0.6, uv().y)).mul(fade).mul(0.65);
}

function splash(material: MeshLambertNodeMaterial, u: PrecipitationUniforms, seed: Node<'vec4'>) {
  const { center, span, wrap, edge } = volume(u);
  const cycle = time.div(mix(0.45, 0.8, seed.w)).add(seed.z.mul(17));
  const phase = fract(cycle);
  const round = floor(cycle);
  const x = wrap(hash11(round.add(seed.x.mul(113))).mul(span), center.x);
  const z = wrap(hash11(round.mul(1.7).add(seed.y.mul(71))).mul(span), center.y);
  const size = mix(0.12, 0.34, phase).mul(mix(0.7, 1.3, seed.x));
  const corner = positionGeometry.xy;
  material.positionNode = vec3(x.add(corner.x.mul(size)), u.ground.add(0.03), z.sub(corner.y.mul(size)));
  const fade = varying(edge(x, z).mul(phase.oneMinus()));
  const d = length(uv().sub(0.5)).mul(2);
  const ring = smoothstep(0.55, 0.85, d).mul(smoothstep(1, 0.88, d)).mul(0.6);
  const drop = smoothstep(0.3, 0, d).mul(step(phase, 0.2)).mul(0.5);
  material.normalNode = cameraViewMatrix.mul(vec4(0, 1, 0, 0)).xyz;
  material.colorNode = vec3(0.84, 0.9, 0.96);
  material.emissive.setRGB(0.1, 0.11, 0.13);
  material.opacityNode = ring.add(drop).mul(fade);
}

function snow(material: MeshLambertNodeMaterial, u: PrecipitationUniforms, seed: Node<'vec4'>) {
  const { center, span, wrap, edge } = volume(u);
  const size = mix(0.05, 0.14, seed.w.mul(seed.w));
  // Bigger flakes fall faster; the speed must not share a random with the start height, or the flakes bunch up.
  const y = u.ground.sub(0.2).add(mod(seed.y.mul(u.height).sub(time.mul(mix(0.6, 1.3, seed.w))), u.height));
  const flutter = vec2(
    sin(time.mul(mix(0.6, 1.3, seed.x)).add(seed.z.mul(6.283))),
    cos(time.mul(mix(0.5, 1.1, seed.z)).add(seed.x.mul(6.283))),
  ).mul(0.4);
  const x = wrap(seed.x.mul(span).add(u.offset.x).add(flutter.x), center.x);
  const z = wrap(seed.z.mul(span).add(u.offset.y).add(flutter.y), center.y);
  const flake = vec3(x, y, z);
  const corner = positionGeometry.xy.mul(size);
  material.positionNode = flake.add(worldAxis(1, 0, 0).mul(corner.x)).add(worldAxis(0, 1, 0).mul(corner.y));
  const distance = length(cameraPosition.sub(flake));
  const fade = varying(smoothstep(1.5, 4, distance).mul(smoothstep(u.radius.mul(2.5), u.radius, distance)).mul(edge(x, z)));
  const disc = smoothstep(0.5, 0.12, length(uv().sub(0.5)));
  material.colorNode = vec3(0.95, 0.97, 1);
  material.emissive.setRGB(0.28, 0.3, 0.33);
  material.opacityNode = disc.mul(fade).mul(0.95);
}

function leaves(material: MeshLambertNodeMaterial, u: PrecipitationUniforms, seed: Node<'vec4'>) {
  const { center, span, wrap, edge } = volume(u);
  const band = 4.5;
  const y = u.ground.add(0.15)
    .add(mod(seed.y.mul(band).sub(time.mul(mix(0.25, 0.6, seed.w))), band))
    .add(sin(time.mul(1.3).add(seed.x.mul(6.283))).mul(0.25));
  const sway = vec2(
    sin(time.mul(mix(0.8, 1.6, seed.z)).add(seed.y.mul(6.283))),
    cos(time.mul(mix(0.7, 1.4, seed.x)).add(seed.z.mul(6.283))),
  ).mul(0.6);
  const x = wrap(seed.x.mul(span).add(u.offset.x).add(sway.x), center.x);
  const z = wrap(seed.z.mul(span).add(u.offset.y).add(sway.y), center.y);
  const leaf = vec3(x, y, z);
  // Tumbling: the leaf's plane turns about its own axis (Rodrigues' rotation).
  const axis = normalize(seed.xyz.sub(0.5).add(vec3(0.01, 0.02, 0)));
  const angle = time.mul(mix(1.5, 4, seed.w)).add(seed.x.mul(6.283));
  const scale = mix(0.1, 0.18, seed.z).mul(edge(x, z)).mul(smoothstep(0.5, 2, length(cameraPosition.sub(leaf))));
  const local = vec3(positionGeometry.x, positionGeometry.y.mul(0.62), 0).mul(scale);
  const c = cos(angle);
  const turned = local.mul(c).add(cross(axis, local).mul(sin(angle))).add(axis.mul(dot(axis, local)).mul(c.oneMinus()));
  material.positionNode = leaf.add(turned);
  const q = uv().sub(0.5).mul(2);
  material.colorNode = mix(u.tint, u.tintAlt, seed.y).mul(mix(0.8, 1.1, seed.x));
  material.opacityNode = length(vec2(q.x, q.y.mul(1.6))).oneMinus().add(0.5);
}

const BUILD: Record<PrecipitationKind, (material: MeshLambertNodeMaterial, u: PrecipitationUniforms, seed: Node<'vec4'>) => void> = {
  rain, splash, snow, leaves,
};

/**
 * A lit material that draws one precipitation layer: every instance of a unit quad places itself from its
 * `weatherSeed` (four randoms), the time node and `u`, so no particle is touched on the CPU. Lit by the scene's lights,
 * so it follows the time of day and the weather's own dimming, and fogged like the rest of the scene.
 */
export function createPrecipitationNodeMaterial(kind: PrecipitationKind, u: PrecipitationUniforms): MeshLambertNodeMaterial {
  const opaque = kind === 'leaves';
  const material = new MeshLambertNodeMaterial({ transparent: !opaque, depthWrite: opaque, alphaTest: opaque ? 0.5 : 0 });
  if (opaque) material.side = DoubleSide;
  material.name = `weather-${kind}`;
  material.normalNode = facing();
  BUILD[kind](material, u, attribute<'vec4'>('weatherSeed', 'vec4'));
  return material;
}
