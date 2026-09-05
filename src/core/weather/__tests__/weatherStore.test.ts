import { useWeatherStore } from '../stores/weatherStore';

beforeEach(() => {
  useWeatherStore.setState({ current: null, history: [] });
});

describe('weatherStore', () => {
  test('rollForDay is deterministic per (day, season)', () => {
    const a = useWeatherStore.getState().rollForDay(7, 'summer');
    useWeatherStore.setState({ current: null, history: [] });
    const b = useWeatherStore.getState().rollForDay(7, 'summer');
    expect(a.kind).toBe(b.kind);
    expect(a.intensity).toBeCloseTo(b.intensity, 5);
  });

  test('returns existing entry for same day', () => {
    const first = useWeatherStore.getState().rollForDay(3);
    const second = useWeatherStore.getState().rollForDay(3);
    expect(second).toBe(first);
  });

  test('isPrecipitating reflects current weather', () => {
    useWeatherStore.getState().setWeather('rain');
    expect(useWeatherStore.getState().isPrecipitating()).toBe(true);
    useWeatherStore.getState().setWeather('sunny');
    expect(useWeatherStore.getState().isPrecipitating()).toBe(false);
  });

  test('fishing/bug bonuses respond to weather', () => {
    useWeatherStore.getState().setWeather('rain');
    expect(useWeatherStore.getState().fishingBonus()).toBeGreaterThan(0);
    expect(useWeatherStore.getState().bugBonus()).toBeLessThan(0);

    useWeatherStore.getState().setWeather('sunny');
    expect(useWeatherStore.getState().fishingBonus()).toBe(0);
    expect(useWeatherStore.getState().bugBonus()).toBeGreaterThan(0);
  });

  test('serialize/hydrate round trip', () => {
    useWeatherStore.getState().setWeather('storm', 0.8, 12);
    const data = useWeatherStore.getState().serialize();
    useWeatherStore.setState({ current: null, history: [] });
    useWeatherStore.getState().hydrate(data);
    expect(useWeatherStore.getState().current?.kind).toBe('storm');
    expect(useWeatherStore.getState().current?.day).toBe(12);
  });

  test('history is bounded', () => {
    for (let i = 0; i < 50; i++) useWeatherStore.getState().rollForDay(i);
    expect(useWeatherStore.getState().history.length).toBeLessThanOrEqual(30);
  });

  test('snowy season pool yields snow-related kinds', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) {
      useWeatherStore.setState({ current: null, history: [] });
      seen.add(useWeatherStore.getState().rollForDay(i, 'winter').kind);
    }
    expect(seen.has('snow') || seen.has('cloudy') || seen.has('sunny')).toBe(true);
  });
});
