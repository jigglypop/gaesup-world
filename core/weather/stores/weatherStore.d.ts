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
};
export declare const useWeatherStore: import("zustand").UseBoundStore<import("zustand").StoreApi<State>>;
export {};
