import * as THREE from 'three';

import type { PrecipitationKind } from '../../types';

const COMMON = /* glsl */ `
attribute vec4 weatherSeed;
uniform float uTime;
uniform float uRadius;
uniform float uHeight;
uniform float uGround;
uniform vec2 uOffset;
uniform vec2 uVelocity;
varying vec2 vUv;
varying float vFade;
varying float vSeed;
float wrapTo(float v, float c) { return mod(v - c + uRadius, 2.0 * uRadius) + c - uRadius; }
float hash11(float x) { return fract(sin(x * 12.9898) * 43758.5453); }
`;

// Each body sets `world`, `vFade` and reads `c` (the volume center) and `span`.
const BODY: Record<PrecipitationKind, string> = {
  rain: /* glsl */ `
    float speed = mix(9.0, 13.0, weatherSeed.w);
    float x = wrapTo(weatherSeed.x * span + uOffset.x, c.x);
    float z = wrapTo(weatherSeed.z * span + uOffset.y, c.y);
    vec3 head = vec3(x, uGround - 0.3 + mod(weatherSeed.y * uHeight - uTime * speed, uHeight), z);
    vec3 axis = normalize(vec3(uVelocity.x, -speed, uVelocity.y));
    vec3 toCamera = cameraPosition - head;
    float d = length(toCamera);
    world = head + normalize(cross(axis, toCamera)) * position.x * (d * 0.0018 + 0.012) + axis * (position.y - 0.5) * speed * 0.07;
    vFade = smoothstep(0.6, 2.5, d) * smoothstep(uRadius * 2.5, uRadius, d) * edge(x, z, c);`,
  splash: /* glsl */ `
    float cycle = uTime / mix(0.45, 0.8, weatherSeed.w) + weatherSeed.z * 17.0;
    float phase = fract(cycle);
    float x = wrapTo(hash11(floor(cycle) + weatherSeed.x * 113.0) * span, c.x);
    float z = wrapTo(hash11(floor(cycle) * 1.7 + weatherSeed.y * 71.0) * span, c.y);
    float size = mix(0.12, 0.34, phase) * mix(0.7, 1.3, weatherSeed.x);
    world = vec3(x + position.x * size, uGround + 0.03, z - position.y * size);
    vSeed = phase;
    vFade = edge(x, z, c) * (1.0 - phase);`,
  snow: /* glsl */ `
    float size = mix(0.05, 0.14, weatherSeed.w * weatherSeed.w);
    vec2 flutter = vec2(sin(uTime * mix(0.6, 1.3, weatherSeed.x) + weatherSeed.z * 6.283), cos(uTime * mix(0.5, 1.1, weatherSeed.z) + weatherSeed.x * 6.283)) * 0.4;
    float x = wrapTo(weatherSeed.x * span + uOffset.x + flutter.x, c.x);
    float z = wrapTo(weatherSeed.z * span + uOffset.y + flutter.y, c.y);
    vec3 flake = vec3(x, uGround - 0.2 + mod(weatherSeed.y * uHeight - uTime * mix(0.6, 1.3, weatherSeed.w), uHeight), z);
    world = flake + right * position.x * size + up * position.y * size;
    float d = length(cameraPosition - flake);
    vFade = smoothstep(1.5, 4.0, d) * smoothstep(uRadius * 2.5, uRadius, d) * edge(x, z, c);`,
  leaves: /* glsl */ `
    vec2 sway = vec2(sin(uTime * mix(0.8, 1.6, weatherSeed.z) + weatherSeed.y * 6.283), cos(uTime * mix(0.7, 1.4, weatherSeed.x) + weatherSeed.z * 6.283)) * 0.6;
    float x = wrapTo(weatherSeed.x * span + uOffset.x + sway.x, c.x);
    float z = wrapTo(weatherSeed.z * span + uOffset.y + sway.y, c.y);
    vec3 leaf = vec3(x, uGround + 0.15 + mod(weatherSeed.y * 4.5 - uTime * mix(0.25, 0.6, weatherSeed.w), 4.5) + sin(uTime * 1.3 + weatherSeed.x * 6.283) * 0.25, z);
    vec3 axis = normalize(weatherSeed.xyz - 0.5 + vec3(0.01, 0.02, 0.0));
    float angle = uTime * mix(1.5, 4.0, weatherSeed.w) + weatherSeed.x * 6.283;
    vec3 local = vec3(position.x, position.y * 0.62, 0.0) * mix(0.1, 0.18, weatherSeed.z) * edge(x, z, c) * smoothstep(0.5, 2.0, length(cameraPosition - leaf));
    world = leaf + local * cos(angle) + cross(axis, local) * sin(angle) + axis * dot(axis, local) * (1.0 - cos(angle));
    vSeed = weatherSeed.y;
    vFade = 1.0;`,
};

const FRAGMENT: Record<PrecipitationKind, string> = {
  rain: 'float a = 1.0 - abs(vUv.x - 0.5) * 2.0; gl_FragColor = vec4(vec3(0.78, 0.84, 0.92) * uLight, a * a * smoothstep(0.0, 0.6, vUv.y) * vFade * 0.65);',
  splash: `float d = length(vUv - 0.5) * 2.0;
    float ring = smoothstep(0.55, 0.85, d) * smoothstep(1.0, 0.88, d) * 0.6 + smoothstep(0.3, 0.0, d) * step(vSeed, 0.2) * 0.5;
    gl_FragColor = vec4(vec3(0.84, 0.9, 0.96) * uLight, ring * vFade);`,
  snow: 'gl_FragColor = vec4(vec3(0.95, 0.97, 1.0) * uLight, smoothstep(0.5, 0.12, length(vUv - 0.5)) * vFade * 0.95);',
  leaves: `vec2 q = (vUv - 0.5) * 2.0;
    if (length(vec2(q.x, q.y * 1.6)) > 1.0) discard;
    gl_FragColor = vec4(mix(uTint, uTintAlt, vSeed) * uLight, 1.0);`,
};

/**
 * The classic WebGL twin of `createPrecipitationNodeMaterial`: the same motion in GLSL from the same seeds, unlit
 * (`uLight` scales it with the weather's own dimming). `uTime` and the rest are updated by the layer each frame.
 */
export function createPrecipitationGlMaterial(kind: PrecipitationKind): THREE.ShaderMaterial {
  const opaque = kind === 'leaves';
  return new THREE.ShaderMaterial({
    name: `weather-${kind}`,
    uniforms: {
      uTime: { value: 0 }, uRadius: { value: 20 }, uHeight: { value: 22 }, uGround: { value: 0 }, uLight: { value: 1 },
      uOffset: { value: new THREE.Vector2() }, uVelocity: { value: new THREE.Vector2() },
      uTint: { value: new THREE.Color('#f2b6c8') }, uTintAlt: { value: new THREE.Color('#fbe0e8') },
    },
    vertexShader: `${COMMON}
      float edge(float x, float z, vec2 c) { return smoothstep(uRadius, uRadius * 0.7, max(abs(x - c.x), abs(z - c.y))); }
      void main() {
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        vec3 forward = -vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);
        vec2 c = cameraPosition.xz + forward.xz * uRadius * 0.7;
        float span = 2.0 * uRadius;
        vec3 world = vec3(0.0);
        vSeed = 0.0;
        ${BODY[kind]}
        vUv = uv;
        gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
      }`,
    fragmentShader: `uniform float uLight; uniform vec3 uTint; uniform vec3 uTintAlt;
      varying vec2 vUv; varying float vFade; varying float vSeed;
      void main() { ${FRAGMENT[kind]} }`,
    transparent: !opaque,
    depthWrite: opaque,
    side: opaque ? THREE.DoubleSide : THREE.FrontSide,
  });
}
