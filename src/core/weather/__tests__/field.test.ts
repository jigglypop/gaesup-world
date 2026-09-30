import { climateTargets, createClimateState, settleClimate } from '../core/climate';
import { claimWeatherField, releaseWeatherField, weatherField, windSway, writeWeatherField } from '../core/field';
import { syncWeatherGlUniforms, weatherGlUniforms } from '../core/glsl';

afterEach(() => {
  releaseWeatherField(first);
  releaseWeatherField(second);
});

const first = {};
const second = {};

test('one driver owns the field until it releases it, which clears the weather', () => {
  expect(claimWeatherField(first)).toBe(true);
  expect(claimWeatherField(second)).toBe(false);
  writeWeatherField(settleClimate(createClimateState(), climateTargets('storm', 1)));
  expect(weatherField.rain).toBe(1);
  expect(weatherField.windStrength).toBeGreaterThan(1);
  expect(Math.hypot(weatherField.windX, weatherField.windZ)).toBeCloseTo(1);
  releaseWeatherField(second);
  expect(weatherField.rain).toBe(1);
  releaseWeatherField(first);
  expect(weatherField).toMatchObject({ rain: 0, snowCover: 0, windStrength: 0.2 });
  expect(claimWeatherField(second)).toBe(true);
});

test('foliage sways harder in stronger wind', () => {
  expect(windSway({ ...weatherField, windStrength: 0.2 })).toBeCloseTo(0.92);
  expect(windSway({ ...weatherField, windStrength: 1.8 })).toBeGreaterThan(2.5);
});

test('classic shader uniforms follow the field once created', () => {
  const uniforms = weatherGlUniforms();
  expect(weatherGlUniforms()).toBe(uniforms);
  syncWeatherGlUniforms({ ...weatherField, rain: 0.5, wetness: 0.25, snowCover: 0.75, windStrength: 1.2 });
  expect(uniforms.weatherRain.value).toBe(0.5);
  expect(uniforms.weatherWetness.value).toBe(0.25);
  expect(uniforms.weatherSnowCover.value).toBe(0.75);
  expect(uniforms.weatherWind.value).toBe(1.2);
});
