import {
  CLIMATE_PERIOD_MINUTES,
  climateTargets,
  createClimateState,
  flashEnvelope,
  resolveWeather,
  scheduledWeather,
  SEASON_WEATHER,
  settleClimate,
  stepClimate,
  type ClimateState,
  type ClimateTargets,
} from '../core/climate';

const run = (state: ClimateState, targets: ClimateTargets, seconds: number, options: Parameters<typeof stepClimate>[3] = {}) => {
  for (let t = 0; t < seconds; t += 1 / 30) stepClimate(state, targets, 1 / 30, options);
  return state;
};

describe('climate targets', () => {
  test('a clear day is calm and each weather sets its own scene', () => {
    expect(climateTargets(null)).toEqual({ rain: 0, snow: 0, wind: 0.2, overcast: 0, storm: 0 });
    const storm = climateTargets('storm', 1);
    expect(storm.rain).toBe(1);
    expect(storm.storm).toBe(1);
    expect(storm.wind).toBeGreaterThan(climateTargets('rain', 1).wind);
    expect(climateTargets('snow').rain).toBe(0);
    expect(climateTargets('wind').wind).toBeGreaterThan(0.8);
    expect(climateTargets('rain', 0.2).rain).toBeLessThan(climateTargets('rain', 0.9).rain);
  });
});

describe('stepping the climate', () => {
  test('rain eases in, soaks surfaces over time and dries slowly after', () => {
    const state = createClimateState();
    stepClimate(state, climateTargets('rain', 1), 1 / 30);
    expect(state.rain).toBeGreaterThan(0);
    expect(state.rain).toBeLessThan(0.1);
    run(state, climateTargets('rain', 1), 10);
    const soaking = state.wetness;
    expect(soaking).toBeGreaterThan(0.2);
    expect(soaking).toBeLessThan(1);
    run(state, climateTargets('rain', 1), 30);
    expect(state.wetness).toBe(1);
    run(state, climateTargets('sunny'), 30);
    expect(state.rain).toBeLessThan(0.01);
    expect(state.wetness).toBeLessThan(1);
    expect(state.wetness).toBeGreaterThan(0.5);
  });

  test('snow lies while it snows and melts after, faster in rain', () => {
    const dry = run(createClimateState(), climateTargets('snow', 1), 60);
    expect(dry.snowCover).toBe(1);
    const wet = { ...dry };
    run(dry, climateTargets('cloudy'), 40);
    run(wet, climateTargets('rain'), 40);
    expect(dry.snowCover).toBeLessThan(1);
    expect(wet.snowCover).toBeLessThan(dry.snowCover);
  });

  test('the wind gusts within bounds and carries drifting particles along its direction', () => {
    const state = run(createClimateState(), climateTargets('wind', 1), 20);
    expect(state.gust).toBeGreaterThanOrEqual(0);
    expect(state.gust).toBeLessThanOrEqual(1);
    expect(state.windOffsetX).toBeGreaterThan(0);
    expect(state.windOffsetZ).toBeGreaterThan(0);
  });

  test('a long frame gap is cut instead of jumping the weather', () => {
    const state = createClimateState();
    stepClimate(state, climateTargets('rain', 1), 60);
    expect(state.clock).toBeCloseTo(0.25);
    expect(state.rain).toBeLessThan(0.1);
  });

  test('settling jumps to a steady soaked or snowed-in state', () => {
    expect(settleClimate(createClimateState(), climateTargets('rain'))).toMatchObject({ wetness: 1, snowCover: 0 });
    expect(settleClimate(createClimateState(), climateTargets('snow'))).toMatchObject({ wetness: 0, snowCover: 1 });
  });
});

describe('lightning', () => {
  const flashes = (state: ClimateState, seconds: number, options: Parameters<typeof stepClimate>[3] = {}) => {
    const starts: number[] = [];
    let peak = 0;
    for (let t = 0; t < seconds; t += 1 / 60) {
      const before = state.flashAge;
      stepClimate(state, climateTargets('storm', 1), 1 / 60, options);
      if (state.flashAge < before) starts.push(t);
      peak = Math.max(peak, state.lightning);
    }
    return { starts, peak };
  };

  test('storms flash rarely and softly, never as a strobe', () => {
    const { starts, peak } = flashes(settleClimate(createClimateState(), climateTargets('storm', 1)), 120, { random: () => 0.5 });
    expect(starts.length).toBeGreaterThanOrEqual(4);
    for (let index = 1; index < starts.length; index++) expect(starts[index]! - starts[index - 1]!).toBeGreaterThanOrEqual(9);
    expect(peak).toBeLessThanOrEqual(1);
  });

  test('no flash outside a storm or with lightning off', () => {
    expect(flashes(settleClimate(createClimateState(), climateTargets('storm', 1)), 60, { lightning: false }).peak).toBe(0);
    const rain = settleClimate(createClimateState(), climateTargets('rain', 1));
    for (let t = 0; t < 60; t += 1 / 30) stepClimate(rain, climateTargets('rain', 1), 1 / 30);
    expect(rain.lightning).toBe(0);
  });

  test('a flash rises fast and fades within two seconds', () => {
    expect(flashEnvelope(0)).toBe(0);
    expect(flashEnvelope(0.08)).toBeCloseTo(1);
    expect(flashEnvelope(0.5)).toBeLessThan(0.5);
    expect(flashEnvelope(2.1)).toBe(0);
    expect(flashEnvelope(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe('the climate schedule', () => {
  test('is seeded, holds for a period and draws from the season', () => {
    const minutes = 3 * 1440 + 100;
    expect(scheduledWeather(minutes, 'winter')).toEqual(scheduledWeather(minutes, 'winter'));
    expect(scheduledWeather(minutes, 'winter')).toEqual(scheduledWeather(minutes + CLIMATE_PERIOD_MINUTES - 101, 'winter'));
    const kinds = new Set<string>();
    for (let period = 0; period < 80; period++) {
      const entry = scheduledWeather(period * CLIMATE_PERIOD_MINUTES, 'winter');
      expect(SEASON_WEATHER.winter).toContain(entry.kind);
      expect(entry.intensity).toBeGreaterThanOrEqual(0.4);
      expect(entry.intensity).toBeLessThanOrEqual(1);
      kinds.add(entry.kind);
    }
    expect(kinds.size).toBeGreaterThan(2);
  });

  test('a seed gives another island its own schedule', () => {
    const differs = Array.from({ length: 20 }, (_, period) => period * CLIMATE_PERIOD_MINUTES)
      .some((minutes) => scheduledWeather(minutes, 'summer', 1).kind !== scheduledWeather(minutes, 'summer', 2).kind);
    expect(differs).toBe(true);
  });

  test('a picked weather wins, an off climate is clear, and auto follows the calendar season', () => {
    const time = { totalMinutes: 2 * 1440 + 30, season: 'summer' as const };
    expect(resolveWeather({ manual: 'snow', climate: 'auto' }, time)).toEqual({ day: 2, kind: 'snow', intensity: 0.7 });
    expect(resolveWeather({ manual: null, climate: 'off' }, time)).toBeNull();
    expect(resolveWeather({ manual: null, climate: 'auto' }, time)).toEqual(scheduledWeather(time.totalMinutes, 'summer'));
    expect(resolveWeather({ manual: null, climate: 'winter' }, time)).toEqual(scheduledWeather(time.totalMinutes, 'winter'));
  });
});
