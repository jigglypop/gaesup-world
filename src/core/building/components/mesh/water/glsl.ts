import * as THREE from 'three';

import { POND_FLOOR_OFFSET, WATER_BED, WATER_COLORS, WATER_OPTICS, WATER_SHORE } from './shading';
import { WEATHER_SURFACE_GLSL, weatherGlUniforms } from '../../../../weather/core/glsl';
import { SHORE_DISTANCE_RANGE } from '../../../terrain/shoreField';

const f = (value: number) => value.toFixed(4);
const band = (value: string, [from, to]: readonly [number, number]) => `smoothstep(${f(from)}, ${f(to)}, ${value})`;
const [foamIn, foamPeak, foamOut, foamEnd] = WATER_SHORE.foam;
const { sea, pond } = WATER_BED;

// Same shore reading, depths and bands as the node materials (rendering/tsl/toonWater.ts, waterBed.ts).
const SHORE = /* glsl */ `
uniform float uTime;
uniform float uDetail;
uniform float uBrightness;
#ifdef USE_SHORE_FIELD
uniform sampler2D uShore;
uniform vec4 uShoreTransform;
/** Coverage and meters to land at a world xz; past the field's border the sea keeps getting farther from land. */
vec2 shoreAt(vec2 p) {
  vec2 uv = (p - uShoreTransform.xy) * uShoreTransform.zw;
  vec2 s = texture2D(uShore, uv).rg;
  return vec2(s.x, s.y * ${f(SHORE_DISTANCE_RANGE)} + length(max(abs(uv - 0.5) - 0.5, 0.0) / uShoreTransform.zw));
}
#endif
varying vec3 vWorldPos;
varying vec2 vShore;

float shoreEdge(vec2 p, float coverage) {
  return coverage + sin(p.x * 0.9 + sin(p.y * 0.63) * 1.4) * cos(p.y * 0.77 - p.x * 0.21) * ${f(WATER_SHORE.wobble)};
}

float waterDepth(float d) {
  d = max(d, 0.0);
#ifdef OPEN_WATER
  return min(${f(sea.shore)} + d * (${f(sea.slope)} + d * ${f(sea.curve)}), ${f(sea.max)});
#else
  return smoothstep(0.0, ${f(pond.ramp)}, d) * ${f(pond.depth)};
#endif
}
`;

/** Coverage and meters to land under a fragment. */
const FRAGMENT_SHORE = /* glsl */ `
vec2 shoreHere() {
#ifdef USE_SHORE_FIELD
  return shoreAt(vWorldPos.xz);
#else
  return vShore;
#endif
}`;

/** The live weather (`WEATHER_SURFACE_GLSL`) and raindrop rings, the GLSL twin of `rainRipples`. */
const WEATHER = /* glsl */ `
${WEATHER_SURFACE_GLSL}
float dropHash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
vec2 dropRings(vec2 xz, float shift, float rate) {
  vec2 p = xz * 1.6 + shift;
  vec2 cell = floor(p);
  float h = dropHash(cell + shift * 7.1);
  vec2 offset = p - (cell + vec2(h, dropHash(cell + 3.7 + shift)) * 0.6 + 0.2);
  float phase = fract(uTime * rate + h * 7.3);
  float d = length(offset), ring = d - phase * 0.45;
  float wave = sin(ring * 38.0) * exp(-ring * ring * 420.0) * (1.0 - phase) * (1.0 - phase);
  return offset / max(d, 1e-3) * wave * step(h * 0.97, weatherRain);
}
vec2 rainRipples(vec2 xz) { return (dropRings(xz, 0.0, 1.1) + dropRings(xz, 0.5, 0.83)) * weatherRain * 0.35; }
`;

/** `displace(p, origin)`: how far below the surface a vertex at world xz `origin` lies. */
const vertex = (displace: string) => /* glsl */ `
#include <common>
#include <fog_pars_vertex>
${SHORE}
uniform float weatherWind;
attribute float waterCoverage;
attribute float waterDistance;

void main() {
  vec3 p = position;
  vec2 origin = (modelMatrix * vec4(p, 1.0)).xz;
#ifdef USE_SHORE_FIELD
  vec2 shore = shoreAt(origin);
#else
  vec2 shore = vec2(waterCoverage, waterDistance);
#endif
  ${displace}
  vShore = shore;
  vWorldPos = (modelMatrix * vec4(p, 1.0)).xyz;
  vec4 mvPosition = viewMatrix * vec4(vWorldPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const SURFACE_VERTEX = vertex(/* glsl */ `
  float swell = sin(origin.x * 0.55 + uTime * 0.85) * 0.045
    + sin(origin.y * 0.78 - uTime * 1.05 + origin.x * 0.33) * 0.025
    + sin((origin.x + origin.y) * 1.4 + uTime * 1.6) * 0.012;
#ifdef OPEN_WATER
  float stir = 1.0;
#else
  float stir = 0.3;
#endif
  // The wind raises the swell: 1 on a calm day, about 2 in wind.
  p.z += swell * smoothstep(0.7, 0.9, shore.x) * uDetail * stir * (weatherWind + 0.8);`);

const SURFACE_FRAGMENT = /* glsl */ `
#include <common>
#include <fog_pars_fragment>
${SHORE}
${FRAGMENT_SHORE}
${WEATHER}
uniform sampler2D uNormals;
uniform vec3 uBank;
uniform vec3 uWet;
uniform vec3 uShallow;
uniform vec3 uDeep;
uniform vec3 uFoam;
uniform vec3 uSky;

void main() {
  vec2 p = vWorldPos.xz;
  vec2 shore = shoreHere();
  float edge = shoreEdge(p, shore.x);
  vec3 a = texture2D(uNormals, p * 0.055 + vec2(uTime * 0.009, uTime * 0.004)).xyz;
  vec3 b = texture2D(uNormals, p * 0.12 + vec2(-uTime * 0.006, uTime * 0.008)).xyz;
  // Wind roughens the ripples; raindrops ring them.
  vec2 drops = rainRipples(p) * uDetail;
  vec2 tilt = (a.xy + b.xy - 1.0) * (weatherWind * 0.45 + 0.91) * uDetail + drops;
  vec3 n = normalize(vec3(tilt.x * 0.7, 1.0, tilt.y * 0.7));
  vec3 view = normalize(cameraPosition - vWorldPos);
  float fresnel = ${f(WATER_OPTICS.reflectance)} + ${f(1 - WATER_OPTICS.reflectance)} * pow(1.0 - max(dot(n, view), 0.0), 5.0);
  float highlight = pow(max(dot(n, normalize(view + normalize(vec3(-0.5, 0.9, -0.3)))), 0.0), 96.0) * uDetail;
  // Without the frame behind, the floor shows through by blending: as much as the water in front of it lets through.
  float thickness = waterDepth(shore.y) / max(abs(view.y), 0.15);
  float wet = ${band('edge', WATER_SHORE.water)};
  float ripple = sin(p.x * 0.7 + p.y * 0.5 - uTime * 0.55) * 0.5 + 0.5;
  float lace = smoothstep(0.35, 0.65, (a.x + b.y) * 0.5) * uDetail * 0.6 + 0.4;
  float shallows = (1.0 - smoothstep(0.0, ${f(WATER_OPTICS.foam)}, thickness)) * lace;
  // Rain spatters the whole surface and whitens the rings of its drops; a gale whips whitecaps where the ripples crest.
  float crest = smoothstep(0.55, 0.8, (a.x + b.y) * 0.5) * uDetail;
  float spray = weatherRain * 0.14 + crest * (smoothstep(0.9, 1.8, weatherWind) * 0.55 + weatherRain * 0.3) + length(drops) * 1.6;
  float foam = min(max(${band('edge', [foamIn, foamPeak])} * (1.0 - ${band('edge', [foamOut, foamEnd])}), shallows) * (0.55 + 0.45 * ripple * uDetail) + spray, 1.0);
  vec3 bank = mix(uBank, uWet, ${band('edge', WATER_SHORE.wet)});
  vec3 body = mix(uShallow, uDeep, 1.0 - exp(-thickness / ${f(WATER_OPTICS.deepening)}));
  body = mix(body, uSky, fresnel * 0.6) + highlight * 0.35;
  vec3 color = mix(bank, mix(body, uFoam, foam * 0.8), wet) * uBrightness;
  float seeThrough = exp(-${f(WATER_OPTICS.clarity)} * thickness) * (1.0 - fresnel) * (1.0 - foam * 0.85) * wet;
  float alpha = 1.0 - seeThrough;
#ifndef OPEN_WATER
  alpha *= ${band('edge', WATER_SHORE.edge)};
#endif
  gl_FragColor = vec4(color, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

const BED_VERTEX = vertex(/* glsl */ `
#ifdef OPEN_WATER
  p.z -= waterDepth(shore.y);
#else
  p.z -= ${f(pond.floor)};
#endif`);

const { scale, strength, fade } = WATER_OPTICS.caustics;
const BED_FRAGMENT = /* glsl */ `
#include <common>
#include <fog_pars_fragment>
${SHORE}
${FRAGMENT_SHORE}
uniform sampler2D uNormals;
uniform vec3 uBed;
uniform vec3 uBedDeep;

float caustics(vec2 p, float depth) {
  p *= ${f(scale)};
  vec2 a = texture2D(uNormals, p + vec2(uTime * 0.021, uTime * 0.013)).xy;
  vec2 b = texture2D(uNormals, p * 1.37 + vec2(-uTime * 0.017, uTime * 0.019)).xy;
  return pow(saturate(1.0 - length(a + b - 1.0) * 6.0), 3.0) * exp(-depth * ${f(fade)}) * ${f(strength)} * uDetail;
}

void main() {
  vec2 shore = shoreHere();
  float depth = waterDepth(shore.y);
#ifdef OPEN_WATER
  float deep = smoothstep(0.0, 4.0, depth);
#else
  // Past the bank the pond's surface is see-through, and the ground there must show, not the floor.
  if (shoreEdge(vWorldPos.xz, shore.x) < ${f(WATER_SHORE.edge[1])}) discard;
  float deep = smoothstep(0.0, ${f(pond.depth)}, depth);
#endif
  gl_FragColor = vec4(mix(uBed, uBedDeep, deep) * (1.0 + caustics(vWorldPos.xz, depth)) * uBrightness, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

export type GlslWaterOptions = {
  normals: THREE.Texture;
  /** Shore coverage texture and its world-to-uv transform; without it the `waterCoverage` attribute is used. */
  field?: { texture: THREE.Texture; transform: THREE.Vector4 } | null;
  /** Open sea over a shelving floor. */
  open?: boolean;
};

const color = (hex: string) => ({ value: new THREE.Color(hex) });

function shaderOptions({ field = null, open = false }: Omit<GlslWaterOptions, 'normals'>) {
  return {
    uniforms: {
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      uTime: { value: 0 },
      uDetail: { value: 1 },
      uBrightness: { value: 1 },
      uShore: { value: field?.texture ?? null },
      uShoreTransform: { value: field?.transform ?? new THREE.Vector4(0, 0, 1, 1) },
    },
    defines: { ...(field ? { USE_SHORE_FIELD: '' } : {}), ...(open ? { OPEN_WATER: '' } : {}) },
    fog: true,
  };
}

/**
 * The classic WebGL renderer's water: the node material's look without TSL or a copy of the frame, rained on and blown
 * by the live weather's shared uniforms. The floor (`createGlslWaterBedMaterial`) shows through by blending, as much as
 * the water in front of it lets through.
 */
export function createGlslWaterMaterial({ normals, ...options }: GlslWaterOptions): THREE.ShaderMaterial {
  const base = shaderOptions(options);
  return new THREE.ShaderMaterial({
    ...base,
    name: 'water-surface',
    uniforms: {
      ...base.uniforms,
      ...weatherGlUniforms(),
      uNormals: { value: normals },
      uBank: color(WATER_COLORS.bank),
      uWet: color(WATER_COLORS.wet),
      uShallow: color(WATER_COLORS.shallow),
      uDeep: color(WATER_COLORS.deep),
      uFoam: color(WATER_COLORS.foam),
      uSky: color(WATER_COLORS.sky),
    },
    vertexShader: SURFACE_VERTEX,
    fragmentShader: SURFACE_FRAGMENT,
    transparent: true,
    depthWrite: false,
  });
}

/** The floor under classic WebGL water, shaped like the node floor (`createWaterBedMaterial`). */
export function createGlslWaterBedMaterial({ normals, ...options }: GlslWaterOptions): THREE.ShaderMaterial {
  const base = shaderOptions(options);
  const [shallow, deep] = options.open ? [WATER_COLORS.seaBed, WATER_COLORS.seaBedDeep] : [WATER_COLORS.pondBed, WATER_COLORS.pondBedDeep];
  return new THREE.ShaderMaterial({
    ...base,
    name: 'water-bed',
    uniforms: { ...base.uniforms, uNormals: { value: normals }, uBed: color(shallow), uBedDeep: color(deep) },
    vertexShader: BED_VERTEX,
    fragmentShader: BED_FRAGMENT,
    ...(options.open ? {} : POND_FLOOR_OFFSET),
  });
}
