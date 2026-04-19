export type WeatherKind = 'sunny' | 'cloudy' | 'rain' | 'snow' | 'storm';

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
