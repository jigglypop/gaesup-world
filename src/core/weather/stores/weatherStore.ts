import { create } from 'zustand';

import type { WeatherEntry, WeatherKind, WeatherSerialized } from '../types';

type State = {
  current: WeatherEntry | null;
  history: WeatherEntry[];

  rollForDay: (day: number, season?: string) => WeatherEntry;
  setWeather: (kind: WeatherKind, intensity?: number, day?: number) => void;
  isPrecipitating: () => boolean;
  fishingBonus: () => number;
  bugBonus: () => number;

  serialize: () => WeatherSerialized;
  hydrate: (data: WeatherSerialized | null | undefined) => void;
  prepareHydrate: (data: WeatherSerialized | null | undefined) => () => void;
};

function makeRng(seed: number): () => number {
  let s = (seed | 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

const SUNNY_RANGE: WeatherKind[] = ['sunny', 'sunny', 'sunny', 'cloudy'];
const RAINY_RANGE: WeatherKind[] = ['rain', 'rain', 'cloudy', 'storm', 'sunny'];
const SNOWY_RANGE: WeatherKind[] = ['snow', 'snow', 'cloudy', 'sunny'];

function poolBySeason(season?: string): WeatherKind[] {
  if (season === 'winter') return SNOWY_RANGE;
  if (season === 'autumn' || season === 'spring') return RAINY_RANGE;
  return SUNNY_RANGE;
}

function prepareWeatherEntry(entry: WeatherEntry): WeatherEntry {
  if (!entry || typeof entry !== 'object' || !Number.isSafeInteger(entry.day) || entry.day < 0 ||
    !['sunny', 'cloudy', 'rain', 'snow', 'storm'].includes(entry.kind) ||
    typeof entry.intensity !== 'number' || !Number.isFinite(entry.intensity) || entry.intensity < 0 || entry.intensity > 1) {
    throw new TypeError('Invalid weather entry');
  }
  return { day: entry.day, kind: entry.kind, intensity: entry.intensity };
}

export const useWeatherStore = create<State>((set, get) => ({
  current: null,
  history: [],

  rollForDay: (day, season) => {
    const cur = get().current;
    if (cur && cur.day === day) return cur;
    const rng = makeRng(day * 6151 + 7919);
    const pool = poolBySeason(season);
    const kind = pool[Math.floor(rng() * pool.length)] ?? 'sunny';
    const intensity = 0.4 + rng() * 0.6;
    const entry: WeatherEntry = { day, kind, intensity };
    set({ current: entry, history: [...get().history.slice(-29), entry] });
    return entry;
  },

  setWeather: (kind, intensity = 0.7, day) => {
    const d = day ?? get().current?.day ?? 0;
    const entry: WeatherEntry = { day: d, kind, intensity };
    set({ current: entry, history: [...get().history.slice(-29), entry] });
  },

  isPrecipitating: () => {
    const c = get().current;
    return !!c && (c.kind === 'rain' || c.kind === 'snow' || c.kind === 'storm');
  },

  fishingBonus: () => {
    const c = get().current;
    if (!c) return 0;
    if (c.kind === 'rain' || c.kind === 'storm') return 0.2;
    if (c.kind === 'cloudy') return 0.1;
    return 0;
  },

  bugBonus: () => {
    const c = get().current;
    if (!c) return 0;
    if (c.kind === 'sunny') return 0.15;
    if (c.kind === 'rain' || c.kind === 'storm' || c.kind === 'snow') return -0.5;
    return 0;
  },

  serialize: (): WeatherSerialized => ({
    version: 1,
    current: get().current ? { ...get().current! } : null,
    history: get().history.map((h) => ({ ...h })),
  }),

  prepareHydrate: (data) => {
    if (data === null || data === undefined) return () => {};
    if (typeof data !== 'object' || data.version !== 1 || !Array.isArray(data.history)) {
      throw new TypeError('Invalid weather snapshot');
    }
    const current = data.current === null ? null : prepareWeatherEntry(data.current);
    const history = Array.from(data.history, prepareWeatherEntry);
    return () => set({ current, history });
  },
  hydrate: (data) => get().prepareHydrate(data)(),
}));
