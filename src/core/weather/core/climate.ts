import type { Season } from '../../time/types';
import type { WeatherEntry, WeatherKind } from '../types';

/**
 * What a weather does to the scene. Each is 0..1 except `wind`: about 0.2 on a calm day, 1 on a windy one and higher in
 * a storm.
 */
export type ClimateTargets = { rain: number; snow: number; wind: number; overcast: number; storm: number };

/** The running climate: the targets eased over time, and what they leave behind. */
export type ClimateState = ClimateTargets & {
  /** Wet surfaces: grows while it rains and dries slowly after. */
  wetness: number;
  /** Lying snow: grows while it snows and melts slowly after, faster in rain. */
  snowCover: number;
  /** 0..1 gust envelope over the base wind. */
  gust: number;
  /** 0..1 soft lightning flash. */
  lightning: number;
  /** Integrated wind travel in meters, for particles that drift with it. */
  windOffsetX: number;
  windOffsetZ: number;
  clock: number;
  strikeIn: number;
  flashAge: number;
};

/** `off`: only a manual weather. `auto`: a seeded schedule from the game calendar's season. A season fixes the pool. */
export type ClimateMode = 'off' | 'auto' | Season;

export const CLIMATE_MODES: readonly ClimateMode[] = ['off', 'auto', 'spring', 'summer', 'autumn', 'winter'];

/** Wind speed in m/s at strength 1. */
export const WIND_SPEED = 5;
/** Scheduled weather holds for a quarter of a game day. */
export const CLIMATE_PERIOD_MINUTES = 360;
/** Seconds of steady rain to soak surfaces, and to dry them in sunshine. */
const WET_SECONDS = 25;
const DRY_SECONDS = 90;
/** Seconds of steady snow to cover the ground, and to melt it. */
const SNOW_SECONDS = 45;
const MELT_SECONDS = 150;
/** Seconds between strikes in a full storm: rare, never a strobe. */
const STRIKE_MIN = 9;
const STRIKE_SPAN = 13;
const FLASH_RISE = 0.08;
const FLASH_DECAY = 0.35;
/** The prevailing wind, the same one the grass sways in. */
const WIND_ANGLE = Math.atan2(0.53, 0.848);

const CALM: ClimateTargets = { rain: 0, snow: 0, wind: 0.2, overcast: 0, storm: 0 };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Targets of a weather at `intensity` (0..1); `null` is a clear day. */
export function climateTargets(kind: WeatherKind | null | undefined, intensity = 0.7): ClimateTargets {
  const i = clamp01(intensity);
  switch (kind) {
    case 'cloudy': return { ...CALM, wind: 0.3, overcast: 0.4 + 0.3 * i };
    case 'rain': return { ...CALM, rain: 0.45 + 0.45 * i, wind: 0.35 + 0.25 * i, overcast: 0.7 + 0.2 * i };
    case 'storm': return { ...CALM, rain: 0.85 + 0.15 * i, wind: 1.15 + 0.35 * i, overcast: 1, storm: 1 };
    case 'snow': return { ...CALM, snow: 0.45 + 0.5 * i, wind: 0.25 + 0.2 * i, overcast: 0.5 + 0.2 * i };
    case 'wind': return { ...CALM, wind: 0.85 + 0.4 * i, overcast: 0.12 };
    default: return { ...CALM };
  }
}

export function createClimateState(targets: ClimateTargets = CALM): ClimateState {
  return {
    ...targets, wetness: 0, snowCover: 0, gust: 0.5, lightning: 0, windOffsetX: 0, windOffsetZ: 0,
    clock: 0, strikeIn: STRIKE_MIN / 2, flashAge: Number.POSITIVE_INFINITY,
  };
}

/** Jumps to the steady state of `targets`: soaked in rain, covered in snow. For a world that loads with its weather. */
export function settleClimate(state: ClimateState, targets: ClimateTargets): ClimateState {
  Object.assign(state, targets);
  state.wetness = targets.rain > 0 ? 1 : 0;
  state.snowCover = targets.snow > 0 ? 1 : 0;
  return state;
}

const approach = (value: number, target: number, dt: number, seconds: number) =>
  value + (target - value) * (1 - Math.exp(-dt / seconds));

/** One soft pulse: a short rise and a long fall, zero after two seconds. */
export function flashEnvelope(age: number): number {
  if (!(age >= 0) || age > 2) return 0;
  return age < FLASH_RISE ? age / FLASH_RISE : Math.exp(-(age - FLASH_RISE) / FLASH_DECAY);
}

/** The wind with its gusts; storms gust harder. */
export function effectiveWind(state: Pick<ClimateState, 'wind' | 'gust' | 'storm'>): number {
  return state.wind * (1 + (state.gust - 0.5) * (0.35 + 0.45 * state.storm));
}

/** The unit xz direction the wind blows toward: the prevailing wind, veering slowly. */
export function windAngle(clock: number): number {
  return WIND_ANGLE + 0.26 * Math.sin(clock * 0.021);
}

export type ClimateStepOptions = {
  /** Storm flashes; off keeps storms dark and steady. */
  lightning?: boolean;
  random?: () => number;
};

/** Advances the climate by `dt` seconds toward `targets`, in place. Long gaps are cut to a quarter second. */
export function stepClimate(state: ClimateState, targets: ClimateTargets, dt: number, options: ClimateStepOptions = {}): ClimateState {
  const step = Math.min(Math.max(dt, 0), 0.25);
  if (step === 0) return state;
  state.clock += step;
  state.rain = approach(state.rain, targets.rain, step, 3.5);
  state.snow = approach(state.snow, targets.snow, step, 4.5);
  state.wind = approach(state.wind, targets.wind, step, 3);
  state.overcast = approach(state.overcast, targets.overcast, step, 6);
  state.storm = approach(state.storm, targets.storm, step, 4);

  state.wetness = state.rain > 0.02
    ? clamp01(state.wetness + (state.rain * step) / WET_SECONDS)
    : clamp01(state.wetness - (step / DRY_SECONDS) * (1 - 0.6 * state.overcast));
  state.snowCover = state.snow > 0.02
    ? clamp01(state.snowCover + (state.snow * step) / SNOW_SECONDS)
    : clamp01(state.snowCover - (step / MELT_SECONDS) * (1 + 3 * state.rain));

  const c = state.clock;
  state.gust = clamp01(0.5 + 0.28 * Math.sin(c * 0.53) + 0.16 * Math.sin(c * 1.37 + 1.7) + 0.06 * Math.sin(c * 3.1 + 0.4));
  const travel = effectiveWind(state) * WIND_SPEED * step;
  const angle = windAngle(c);
  state.windOffsetX += Math.cos(angle) * travel;
  state.windOffsetZ += Math.sin(angle) * travel;

  state.flashAge += step;
  if (options.lightning !== false && state.storm > 0.5) {
    state.strikeIn -= step;
    if (state.strikeIn <= 0) {
      state.flashAge = 0;
      state.strikeIn = STRIKE_MIN + (options.random ?? Math.random)() * STRIKE_SPAN;
    }
  } else {
    // A storm that starts rumbles a few seconds before its first flash.
    state.strikeIn = Math.max(state.strikeIn, STRIKE_MIN / 2);
  }
  state.lightning = options.lightning === false ? 0 : flashEnvelope(state.flashAge);
  return state;
}

/** Weathers each season draws from; repeats weigh a kind. */
export const SEASON_WEATHER: Record<Season, readonly WeatherKind[]> = {
  spring: ['sunny', 'sunny', 'cloudy', 'rain', 'wind'],
  summer: ['sunny', 'sunny', 'sunny', 'cloudy', 'rain', 'storm'],
  autumn: ['sunny', 'cloudy', 'wind', 'wind', 'rain'],
  winter: ['snow', 'snow', 'cloudy', 'sunny', 'wind'],
};

/** Intensity of a weather picked by hand. */
export const MANUAL_INTENSITY: Record<WeatherKind, number> = { sunny: 0.5, cloudy: 0.6, rain: 0.7, snow: 0.7, storm: 0.9, wind: 0.7 };

function random01(seed: number): () => number {
  let s = (seed | 0) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 0x100000000;
  };
}

/** The weather a seeded schedule gives for the period of the day holding `totalMinutes`. */
export function scheduledWeather(totalMinutes: number, season: Season, seed = 0): WeatherEntry {
  const period = Math.floor(Math.max(0, totalMinutes) / CLIMATE_PERIOD_MINUTES);
  const rng = random01(Math.imul(period + 1, 2654435761) ^ Math.imul(seed | 0, 40503));
  rng();
  const pool = SEASON_WEATHER[season];
  return {
    day: Math.floor(Math.max(0, totalMinutes) / 1440),
    kind: pool[Math.floor(rng() * pool.length)] ?? 'sunny',
    intensity: Math.round((0.4 + rng() * 0.6) * 100) / 100,
  };
}

export type WeatherSelection = {
  /** A weather picked by hand; it wins over the climate. */
  manual: WeatherKind | null;
  climate: ClimateMode;
  /** Varies the schedule between islands. */
  seed?: number;
};

/** The weather a selection gives at a game time; `null` for a clear day with no schedule. */
export function resolveWeather(selection: WeatherSelection, time: { totalMinutes: number; season: Season }): WeatherEntry | null {
  const day = Math.floor(Math.max(0, time.totalMinutes) / 1440);
  if (selection.manual) return { day, kind: selection.manual, intensity: MANUAL_INTENSITY[selection.manual] };
  if (selection.climate === 'off') return null;
  const season = selection.climate === 'auto' ? time.season : selection.climate;
  return scheduledWeather(time.totalMinutes, season, selection.seed);
}
