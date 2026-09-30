import {
  attribute,
  cameraWorldMatrix,
  cos,
  length,
  max,
  mix,
  positionGeometry,
  sin,
  smoothstep,
  step,
  uniform,
  uv,
  vec3,
  vec4,
} from 'three/tsl';
import { MeshBasicNodeMaterial } from 'three/webgpu';

/**
 * Small puffs thrown out from a point and falling back: a pool of camera-facing quads that each read their burst's
 * origin and start time (`burstOrigin`, xyz + seconds), a random `burstSeed` and a `burstColor`. Only spawning writes
 * attributes; `now` moves them.
 */
export function createBurstMaterial() {
  const now = uniform(0);
  const origin = attribute<'vec4'>('burstOrigin', 'vec4');
  const seed = attribute<'vec4'>('burstSeed', 'vec4');
  const life = mix(0.45, 0.8, seed.w);
  const age = now.sub(origin.w);
  const t = age.div(life).clamp();
  const alive = step(0, age).mul(step(age, life));
  const angle = seed.x.mul(6.283);
  const spread = age.mul(mix(1, 2.6, seed.y)).mul(t.mul(-0.5).add(1));
  const rise = max(age.mul(mix(1, 2.8, seed.z)).sub(age.mul(age).mul(4.9)), 0);
  const center = origin.xyz.add(vec3(cos(angle).mul(spread), rise.add(0.05), sin(angle).mul(spread)));
  const corner = positionGeometry.xy.mul(mix(0.12, 0.26, seed.w).mul(t.mul(0.5).add(0.6)).mul(alive));
  const material = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false });
  material.name = 'effects-burst';
  material.positionNode = center
    .add(cameraWorldMatrix.mul(vec4(1, 0, 0, 0)).xyz.mul(corner.x))
    .add(cameraWorldMatrix.mul(vec4(0, 1, 0, 0)).xyz.mul(corner.y));
  material.colorNode = attribute<'vec3'>('burstColor', 'vec3');
  material.opacityNode = smoothstep(0.5, 0.3, length(uv().sub(0.5))).mul(t.oneMinus().pow(0.7));
  return { material, now };
}
