export type { PrecipitationKind, WeatherKind, WeatherEntry, WeatherSerialized } from './types';
export { WEATHER_KINDS } from './types';
export { useWeatherStore, useWeatherStoreApi, createWeatherStore } from './stores/weatherStore';
export {
  createWeatherPlugin,
  hydrateWeatherState,
  serializeWeatherState,
  weatherPlugin,
} from './plugin';
export type { WeatherPluginOptions } from './plugin';
export { WeatherHUD } from './components/WeatherHUD';
export type { WeatherHUDProps } from './components/WeatherHUD';
export { Weather } from './components/Weather';
export type { WeatherProps } from './components/Weather';
export { WeatherEffect } from './components/WeatherEffect';
export type { WeatherEffectKind, WeatherEffectProps } from './components/WeatherEffect';
export { useWeatherTicker } from './hooks/useWeatherTicker';
export { useWeatherClimate } from './hooks/useWeatherClimate';
export type { WeatherClimateOptions } from './hooks/useWeatherClimate';
export { useWeatherSource } from './hooks/useWeatherSource';
export {
  CLIMATE_MODES,
  CLIMATE_PERIOD_MINUTES,
  climateTargets,
  resolveWeather,
  scheduledWeather,
  SEASON_WEATHER,
} from './core/climate';
export type { ClimateMode, ClimateTargets, WeatherSelection } from './core/climate';
export { weatherField, windSway } from './core/field';
export type { WeatherField } from './core/field';
export { WEATHER_SURFACE_GLSL, weatherGlUniforms } from './core/glsl';
export type { WeatherGlUniforms } from './core/glsl';
export { rainRipples, snowAmount, snowSurface, weatheredSurface, weatherNodes, wetSurface } from '../rendering/tsl/weatherSurface';
export type { WeatherNodes } from '../rendering/tsl/weatherSurface';

export type { WeatherStore } from './stores/weatherStore';
