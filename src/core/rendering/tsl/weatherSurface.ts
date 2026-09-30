import {
  dot,
  exp,
  float,
  floor,
  fract,
  length,
  max,
  mix,
  mx_noise_float,
  normalWorld,
  positionWorld,
  sin,
  smoothstep,
  step,
  time,
  uniform,
  vec2,
  vec3,
} from 'three/tsl';
import { Vector2, type Node } from 'three/webgpu';

import type { WeatherField } from '../../weather/core/field';

function createWeatherNodes() {
  return {
    rain: uniform(0),
    snow: uniform(0),
    overcast: uniform(0),
    wetness: uniform(0),
    snowCover: uniform(0),
    lightning: uniform(0),
    windStrength: uniform(0.2),
    /** Unit xz direction the wind blows toward. */
    windDirection: uniform(new Vector2(0.848, 0.53)),
  };
}

export type WeatherNodes = ReturnType<typeof createWeatherNodes>;

let nodes: WeatherNodes | null = null;

/**
 * The live weather as shared TSL uniforms. Every material that reads them sees one value per frame, written by the
 * mounted `Weather`; a weather change only moves values, so no material rebuilds.
 */
export function weatherNodes(): WeatherNodes {
  return (nodes ??= createWeatherNodes());
}

export function syncWeatherNodes(field: Readonly<WeatherField>): void {
  if (!nodes) return;
  nodes.rain.value = field.rain;
  nodes.snow.value = field.snow;
  nodes.overcast.value = field.overcast;
  nodes.wetness.value = field.wetness;
  nodes.snowCover.value = field.snowCover;
  nodes.lightning.value = field.lightning;
  nodes.windStrength.value = field.windStrength;
  nodes.windDirection.value.set(field.windX, field.windZ);
}

type SurfaceInput = {
  /** World position; defaults to `positionWorld`. */
  position?: Node<'vec3'>;
  /** World normal; defaults to `normalWorld`. */
  normal?: Node<'vec3'>;
};

const SNOW = vec3(0.9, 0.93, 0.98);
const PUDDLE = vec3(0.62, 0.68, 0.78);

const hash21 = (p: Node<'vec2'>) => fract(sin(dot(p, vec2(12.9898, 78.233))).mul(43758.5453));

/**
 * The wet look from the shared `wetness`: darker and glossier, with puddles pooling on flat ground once it is soaked.
 * `porosity` scales how much a surface darkens (sand 1, stone 0.5).
 */
export function wetSurface(
  color: Node<'vec3'>,
  roughness: Node<'float'>,
  { position = positionWorld, normal = normalWorld, porosity = 1, puddles = true }: SurfaceInput & { porosity?: number; puddles?: boolean } = {},
) {
  const { wetness } = weatherNodes();
  const wet = wetness.mul(porosity).clamp();
  const flat = smoothstep(0.82, 0.97, normal.y);
  const puddle = puddles
    ? smoothstep(0.6, 0.7, mx_noise_float(position.xz.mul(0.28)).mul(0.5).add(0.5)).mul(flat).mul(smoothstep(0.35, 0.9, wetness))
    : float(0);
  const dark = color.mul(mix(float(1), float(0.58), wet));
  return {
    color: mix(dark, dark.mul(PUDDLE), puddle),
    roughness: mix(mix(roughness, float(0.3), wet), float(0.06), puddle),
    puddle,
  };
}

/** How much lying snow covers a point: upward faces first, patchy while the shared `snowCover` is thin. */
export function snowAmount({ position = positionWorld, normal = normalWorld, cover }: SurfaceInput & { cover?: Node<'float'> } = {}) {
  const up = smoothstep(0.45, 0.85, normal.y);
  const patch = mx_noise_float(position.mul(1.7)).mul(0.5).add(0.5);
  return smoothstep(0.04, 0.22, (cover ?? weatherNodes().snowCover).mul(up).mul(1.3).sub(patch.mul(0.45)));
}

/** Lying snow over `color`, with its roughness; see `snowAmount`. */
export function snowSurface(color: Node<'vec3'>, roughness: Node<'float'>, input: SurfaceInput & { cover?: Node<'float'> } = {}) {
  const amount = snowAmount(input);
  return { color: mix(color, SNOW, amount), roughness: mix(roughness, float(0.85), amount), amount };
}

/** Wet, then snow over it: the weather on any lit surface, such as roofs, rocks and trees (no puddles). */
export function weatheredSurface(color: Node<'vec3'>, roughness: Node<'float'>, input: SurfaceInput = {}) {
  const wet = wetSurface(color, roughness, { ...input, porosity: 0.6, puddles: false });
  return snowSurface(wet.color, wet.roughness, input);
}

/**
 * Rain rings on water or puddles: an xz normal tilt from drops that land on a grid, spread and fade, as many as the
 * shared `rain` asks for. Add it to the surface normal's xz (`normal.xz += rainRipples(position.xz)`).
 */
export function rainRipples(xz: Node<'vec2'>, { cells = 1.6, strength = 0.35 }: { cells?: number; strength?: number } = {}): Node<'vec2'> {
  const { rain } = weatherNodes();
  const layer = (shift: number, rate: number) => {
    const p = xz.mul(cells).add(shift);
    const cell = floor(p);
    const h = hash21(cell.add(shift * 7.1));
    const center = cell.add(vec2(h, hash21(cell.add(3.7 + shift))).mul(0.6).add(0.2));
    const phase = fract(time.mul(rate).add(h.mul(7.3)));
    const offset = p.sub(center);
    const distance = length(offset);
    const ring = distance.sub(phase.mul(0.45));
    const wave = sin(ring.mul(38)).mul(exp(ring.mul(ring).mul(-420))).mul(phase.oneMinus().mul(phase.oneMinus()));
    return offset.div(max(distance, 1e-3)).mul(wave).mul(step(h.mul(0.97), rain));
  };
  return layer(0, 1.1).add(layer(0.5, 0.83)).mul(rain.mul(strength));
}
