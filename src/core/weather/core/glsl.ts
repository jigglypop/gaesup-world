import type { WeatherField } from './field';

function createUniforms() {
  return {
    weatherRain: { value: 0 },
    weatherWetness: { value: 0 },
    weatherSnowCover: { value: 0 },
    weatherWind: { value: 0.2 },
  };
}

export type WeatherGlUniforms = ReturnType<typeof createUniforms>;

let uniforms: WeatherGlUniforms | null = null;

/**
 * The live weather as classic `ShaderMaterial` uniforms (`{ value }` objects): spread them into a material's
 * `uniforms` and prepend `WEATHER_SURFACE_GLSL` to its fragment shader.
 */
export function weatherGlUniforms(): WeatherGlUniforms {
  return (uniforms ??= createUniforms());
}

export function syncWeatherGlUniforms(field: Readonly<WeatherField>): void {
  if (!uniforms) return;
  uniforms.weatherRain.value = field.rain;
  uniforms.weatherWetness.value = field.wetness;
  uniforms.weatherSnowCover.value = field.snowCover;
  uniforms.weatherWind.value = field.windStrength;
}

/** GLSL twins of `wetSurface` and `snowSurface` without the noise: `up` is the world normal's y. */
export const WEATHER_SURFACE_GLSL = /* glsl */ `
uniform float weatherRain;
uniform float weatherWetness;
uniform float weatherSnowCover;
uniform float weatherWind;
vec3 weatherWet(vec3 color) { return color * mix(1.0, 0.58, clamp(weatherWetness, 0.0, 1.0)); }
float weatherSnowAmount(float up) { return smoothstep(0.04, 0.22, weatherSnowCover * smoothstep(0.45, 0.85, up) * 1.3 - 0.2); }
vec3 weatherSnow(vec3 color, float up) { return mix(color, vec3(0.9, 0.93, 0.98), weatherSnowAmount(up)); }
`;
