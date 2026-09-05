import {
  Fn, float, fract, floor, sin, dot, mix, smoothstep, clamp, min,
  vec2, vec3, vec4, uniform, varying, positionGeometry, modelWorldMatrix, uv,
  sRGBTransferEOTF,
} from 'three/tsl';
import { Color, MeshBasicNodeMaterial, type Node } from 'three/webgpu';

const hash = Fn(([p]: [Node<'vec2'>]) => fract(sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453)));
const noise = Fn(([p]: [Node<'vec2'>]) => {
  const i = floor(p).toVar();
  const f = fract(p).toVar();
  const blend = f.mul(f).mul(float(3).sub(f.mul(2))).toVar();
  return mix(mix(hash(i), hash(i.add(vec2(1, 0))), blend.x),
    mix(hash(i.add(vec2(0, 1))), hash(i.add(vec2(1, 1))), blend.x), blend.y);
});
const fbm = Fn(([input]: [Node<'vec2'>]) => {
  const p = input.toVar();
  const value = float(0).toVar();
  let amplitude = 0.5;
  for (let octave = 0; octave < 4; octave++) {
    value.addAssign(noise(p).mul(amplitude));
    p.assign(p.mul(2.07).add(vec2(13.7, 7.1)));
    amplitude *= 0.5;
  }
  return value;
});

export function createToonWaterMaterial() {
  const time = uniform(0);
  const p = positionGeometry;
  const wave = sin(p.x.mul(0.55).add(time.mul(0.85))).mul(0.085)
    .add(sin(p.y.mul(0.78).sub(time.mul(1.05)).add(p.x.mul(0.33))).mul(0.055))
    .add(sin(p.x.add(p.y).mul(1.4).add(time.mul(1.6))).mul(0.025));
  const displaced = vec3(p.xy, p.z.add(wave));
  const world = varying(modelWorldMatrix.mul(vec4(displaced, 1)).xyz);
  const waveHeight = varying(wave);
  const material = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, opacity: 0.88, fog: false });
  material.positionNode = displaced;
  material.colorNode = Fn(() => {
    const wp = world.xz;
    const baseNoise = fbm(wp.mul(0.18).add(vec2(time.mul(0.04), time.mul(-0.03)))).toVar();
    const depth = clamp(float(0.5).add(waveHeight.mul(3.5)).add(baseNoise.sub(0.5).mul(0.55)), 0, 1).toVar();
    const base = mix(uniform(new Color('#1f5f88')), uniform(new Color('#9ed6c8')), depth);
    const stripe = sin(wp.x.add(wp.y).mul(0.55).add(time.mul(0.35)).add(baseNoise.mul(0.8)).mul(6))
      .mul(0.5).add(0.5).toVar();
    const foam = smoothstep(0.76, 0.86, stripe).sub(smoothstep(0.86, 0.96, stripe))
      .mul(float(0.35).add(depth.mul(0.65)));
    const specks = smoothstep(0.78, 0.95, fbm(wp.mul(0.62).add(time.mul(0.1))));
    const ripple = smoothstep(0.6, 0.95, fbm(wp.mul(1.3).add(time.mul(0.6))));
    const color = mix(base, vec3(1), foam.mul(0.55).add(specks.mul(0.5)).add(ripple.mul(0.18))).toVar();
    const coords = uv();
    const edge = smoothstep(0, 0.06, min(min(coords.x, coords.y), min(float(1).sub(coords.x), float(1).sub(coords.y))));
    // The legacy shader writes display values directly, without an output transfer.
    return sRGBTransferEOTF(mix(color.mul(0.86), color, edge)) as Node<'vec3'>;
  })();
  material.toneMapped = false;
  return { material, time };
}
