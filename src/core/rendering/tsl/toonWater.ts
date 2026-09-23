import {
  Fn, sin, mix, clamp, max, dot, normalize, pow, texture, cameraPosition,
  vec2, vec3, vec4, uniform, varying, positionGeometry, modelWorldMatrix,
} from 'three/tsl';
import { Color, MeshBasicNodeMaterial, type Texture } from 'three/webgpu';

import { getSharedWaterNormals } from '../../building/components/mesh/water/normals';

/** Bounded surface cost: two filtered normal samples, no reflection render target. */
export function createToonWaterMaterial(normalMap: Texture = getSharedWaterNormals()) {
  const time = uniform(0);
  /** Unlit surface multiplier so day/night scenes can dim the water without relighting it. */
  const brightness = uniform(1);
  const p = positionGeometry;
  const wave = sin(p.x.mul(0.55).add(time.mul(0.85))).mul(0.085)
    .add(sin(p.y.mul(0.78).sub(time.mul(1.05)).add(p.x.mul(0.33))).mul(0.055))
    .add(sin(p.x.add(p.y).mul(1.4).add(time.mul(1.6))).mul(0.025));
  const displaced = vec3(p.xy, p.z.add(wave));
  const world = varying(modelWorldMatrix.mul(vec4(displaced, 1)).xyz);
  const waveHeight = varying(wave);
  const material = new MeshBasicNodeMaterial({ toneMapped: false, fog: false });
  material.positionNode = displaced;
  material.colorNode = Fn(() => {
    const a = texture(normalMap, world.xz.mul(0.055).add(vec2(time.mul(0.009), time.mul(0.004)))).xy.mul(2).sub(1);
    const b = texture(normalMap, world.xz.mul(0.12).add(vec2(time.mul(-0.006), time.mul(0.008)))).xy.mul(2).sub(1);
    const n = normalize(vec3(a.x.add(b.x).mul(0.48), 1, a.y.add(b.y).mul(0.48))).toVar();
    const view = normalize(cameraPosition.sub(world)).toVar();
    const fresnel = pow(max(dot(n, view), 0).oneMinus(), 3);
    const highlight = pow(max(dot(n, normalize(view.add(normalize(vec3(-0.5, 0.9, -0.3))))), 0), 96);
    const tint = clamp(waveHeight.mul(1.1).add(n.x.mul(0.28)).add(0.42), 0, 1);
    const base = mix(uniform(new Color('#176180')), uniform(new Color('#48b9b4')), tint);
    return mix(base, vec3(0.48, 0.72, 0.78), fresnel.mul(0.6)).add(highlight.mul(0.38)).mul(brightness);
  })();
  return { material, time, brightness };
}
