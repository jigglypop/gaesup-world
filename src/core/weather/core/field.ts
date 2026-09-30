import { effectiveWind, windAngle, type ClimateState } from './climate';

/**
 * The live weather that surfaces, particles and lights read: one per page, written once a frame by the mounted
 * `Weather` (or `useWeatherClimate`). Values are 0..1 except `windStrength` (about 0.2 calm, 1 windy, up to ~2 in a
 * storm) and the wind vectors.
 */
export type WeatherField = {
  rain: number;
  snow: number;
  overcast: number;
  storm: number;
  /** Wet surfaces: darker and glossier, with puddles on flat ground. */
  wetness: number;
  /** Lying snow on upward faces. */
  snowCover: number;
  /** Soft lightning flash. */
  lightning: number;
  /** Wind with gusts. */
  windStrength: number;
  /** Unit xz direction the wind blows toward. */
  windX: number;
  windZ: number;
  /** Integrated wind travel in meters, for particles that drift with it. */
  windOffsetX: number;
  windOffsetZ: number;
};

const CLEAR: WeatherField = {
  rain: 0, snow: 0, overcast: 0, storm: 0, wetness: 0, snowCover: 0, lightning: 0,
  windStrength: 0.2, windX: 0.848, windZ: 0.53, windOffsetX: 0, windOffsetZ: 0,
};

const field: WeatherField = { ...CLEAR };

/** The page's live weather. Read it in frame callbacks; it changes in place. */
export const weatherField: Readonly<WeatherField> = field;

export function writeWeatherField(state: ClimateState): void {
  field.rain = state.rain;
  field.snow = state.snow;
  field.overcast = state.overcast;
  field.storm = state.storm;
  field.wetness = state.wetness;
  field.snowCover = state.snowCover;
  field.lightning = state.lightning;
  field.windStrength = effectiveWind(state);
  const angle = windAngle(state.clock);
  field.windX = Math.cos(angle);
  field.windZ = Math.sin(angle);
  field.windOffsetX = state.windOffsetX;
  field.windOffsetZ = state.windOffsetZ;
}

/** How hard foliage sways in the live wind: about 0.9 calm, 2 on a windy day and near 3 in a storm's gusts. */
export function windSway(live: Readonly<WeatherField> = field): number {
  return 0.7 + 1.1 * live.windStrength;
}

/** Back to a clear, calm day; the last driver to leave calls it. */
export function resetWeatherField(): void {
  Object.assign(field, CLEAR);
}

let owner: object | null = null;

/**
 * One driver steps the field at a time, so two mounted weathers never advance it twice a frame. Returns whether
 * `token` holds it; the first to ask gets it until it releases.
 */
export function claimWeatherField(token: object): boolean {
  owner ??= token;
  return owner === token;
}

export function releaseWeatherField(token: object): void {
  if (owner !== token) return;
  owner = null;
  resetWeatherField();
}
