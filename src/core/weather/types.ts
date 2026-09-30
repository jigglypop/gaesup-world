export type WeatherKind = 'sunny' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'wind';

export const WEATHER_KINDS: readonly WeatherKind[] = ['sunny', 'cloudy', 'rain', 'snow', 'storm', 'wind'];

export type WeatherEntry = {
  day: number;
  kind: WeatherKind;
  intensity: number;
};

export type WeatherSerialized = {
  version: number;
  current: WeatherEntry | null;
  history: WeatherEntry[];
};

/** Falling rain streaks, their splashes on the ground, snowflakes, and leaves or petals blown by the wind. */
export type PrecipitationKind = 'rain' | 'splash' | 'snow' | 'leaves';
