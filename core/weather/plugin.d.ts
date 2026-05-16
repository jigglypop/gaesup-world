import type { GaesupPlugin } from '../plugins';
import type { WeatherSerialized } from './types';
export interface WeatherPluginOptions {
    id?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare function serializeWeatherState(): WeatherSerialized;
export declare function hydrateWeatherState(data: WeatherSerialized | null | undefined): void;
export declare function createWeatherPlugin(options?: WeatherPluginOptions): GaesupPlugin;
export declare const weatherPlugin: GaesupPlugin;
