import * as THREE from 'three';

import { WATER_COLORS, WATER_SHORE } from './shading';

const f = (value: number) => value.toFixed(3);
const band = (value: string, [from, to]: readonly [number, number]) => `smoothstep(${f(from)}, ${f(to)}, ${value})`;
const [foamIn, foamPeak, foamOut, foamEnd] = WATER_SHORE.foam;

const SHORE_UNIFORMS = /* glsl */ `
uniform float uTime;
uniform float uDetail;
#ifdef USE_SHORE_FIELD
uniform sampler2D uShore;
uniform vec4 uShoreTransform;
#endif
varying vec3 vWorldPos;
varying float vCoverage;`;

// Same swell and bands as the node material (rendering/tsl/toonWater.ts); both read the shore field texture.
const VERTEX = /* glsl */ `
#include <common>
#include <fog_pars_vertex>
${SHORE_UNIFORMS}
attribute float waterCoverage;

void main() {
  vec3 p = position;
  vec2 origin = (modelMatrix * vec4(p, 1.0)).xz;
#ifdef USE_SHORE_FIELD
  float coverage = texture2D(uShore, (origin - uShoreTransform.xy) * uShoreTransform.zw).r;
#else
  float coverage = waterCoverage;
#endif
  float swell = sin(origin.x * 0.55 + uTime * 0.85) * 0.045
    + sin(origin.y * 0.78 - uTime * 1.05 + origin.x * 0.33) * 0.025
    + sin((origin.x + origin.y) * 1.4 + uTime * 1.6) * 0.012;
  p.z += swell * smoothstep(0.7, 0.9, coverage) * uDetail;
  vCoverage = coverage;
  vWorldPos = (modelMatrix * vec4(p, 1.0)).xyz;
  vec4 mvPosition = viewMatrix * vec4(vWorldPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const FRAGMENT = /* glsl */ `
#include <common>
#include <fog_pars_fragment>
${SHORE_UNIFORMS}
uniform sampler2D uNormals;
uniform float uBrightness;
uniform vec3 uBank;
uniform vec3 uWet;
uniform vec3 uShallow;
uniform vec3 uDeep;
uniform vec3 uFoam;
uniform vec3 uSky;

void main() {
  vec2 p = vWorldPos.xz;
#ifdef USE_SHORE_FIELD
  float coverage = texture2D(uShore, (p - uShoreTransform.xy) * uShoreTransform.zw).r;
#else
  float coverage = vCoverage;
#endif
  float edge = coverage + sin(p.x * 0.9 + sin(p.y * 0.63) * 1.4) * cos(p.y * 0.77 - p.x * 0.21) * ${f(WATER_SHORE.wobble)};
  vec3 a = texture2D(uNormals, p * 0.055 + vec2(uTime * 0.009, uTime * 0.004)).xyz;
  vec3 b = texture2D(uNormals, p * 0.12 + vec2(-uTime * 0.006, uTime * 0.008)).xyz;
  vec2 tilt = (a.xy + b.xy - 1.0) * 0.7 * uDetail;
  vec3 n = normalize(vec3(tilt.x, 1.0, tilt.y));
  vec3 view = normalize(cameraPosition - vWorldPos);
  float fresnel = pow(1.0 - max(dot(n, view), 0.0), 3.0);
  float highlight = pow(max(dot(n, normalize(view + normalize(vec3(-0.5, 0.9, -0.3)))), 0.0), 96.0) * uDetail;
  float wet = ${band('edge', WATER_SHORE.water)};
  float ripple = sin(p.x * 0.7 + p.y * 0.5 - uTime * 0.55) * 0.5 + 0.5;
  float foam = ${band('edge', [foamIn, foamPeak])} * (1.0 - ${band('edge', [foamOut, foamEnd])}) * (0.55 + 0.45 * ripple * uDetail);
  vec3 bank = mix(uBank, uWet, ${band('edge', WATER_SHORE.wet)});
  vec3 body = mix(uShallow, uDeep, ${band('coverage', WATER_SHORE.depth)});
  body = mix(body, uSky, fresnel * 0.5) + highlight * 0.35;
  vec3 color = mix(bank, mix(body, uFoam, foam * 0.8), wet) * uBrightness;
#ifdef OPEN_WATER
  gl_FragColor = vec4(color, 1.0);
#else
  gl_FragColor = vec4(color, ${band('edge', WATER_SHORE.edge)});
#endif
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

export type GlslWaterOptions = {
  normals: THREE.Texture;
  /** Shore coverage texture and its world-to-uv transform; without it the `waterCoverage` attribute is used. */
  field?: { texture: THREE.Texture; transform: THREE.Vector4 } | null;
  /** Open sea: opaque. */
  open?: boolean;
};

/** The classic WebGL renderer's water: the node material's look without TSL or a reflection render target. */
export function createGlslWaterMaterial({ normals, field = null, open = false }: GlslWaterOptions): THREE.ShaderMaterial {
  const color = (hex: string) => ({ value: new THREE.Color(hex) });
  return new THREE.ShaderMaterial({
    uniforms: {
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      uTime: { value: 0 },
      uDetail: { value: 1 },
      uBrightness: { value: 1 },
      uNormals: { value: normals },
      uShore: { value: field?.texture ?? null },
      uShoreTransform: { value: field?.transform ?? new THREE.Vector4(0, 0, 1, 1) },
      uBank: color(WATER_COLORS.bank),
      uWet: color(WATER_COLORS.wet),
      uShallow: color(WATER_COLORS.shallow),
      uDeep: color(WATER_COLORS.deep),
      uFoam: color(WATER_COLORS.foam),
      uSky: color(WATER_COLORS.sky),
    },
    defines: { ...(field ? { USE_SHORE_FIELD: '' } : {}), ...(open ? { OPEN_WATER: '' } : {}) },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    fog: true,
    transparent: !open,
    depthWrite: open,
  });
}
