import { act, render } from '@testing-library/react';

import { useTimeStore } from '../../time/stores/timeStore';
import { CLIMATE_PERIOD_MINUTES, SEASON_WEATHER, type WeatherSelection } from '../core/climate';
import { useWeatherSource } from '../hooks/useWeatherSource';
import { useWeatherStore } from '../stores/weatherStore';

function Source(selection: WeatherSelection) {
  useWeatherSource(selection);
  return null;
}

const current = () => useWeatherStore.getState().current;

beforeEach(() => {
  useWeatherStore.setState({ current: null, history: [] });
  useTimeStore.getState().setTotalMinutes(8 * 60);
});

test('an inactive selection leaves the store to others', () => {
  useWeatherStore.getState().setWeather('rain', 0.4, 0);
  render(<Source manual={null} climate="off" />);
  expect(current()).toMatchObject({ kind: 'rain', intensity: 0.4 });
});

test('a picked weather is written once and turning it off clears the sky', () => {
  const view = render(<Source manual="storm" climate="off" />);
  expect(current()).toMatchObject({ kind: 'storm', intensity: 0.9 });
  const written = useWeatherStore.getState().history.length;
  view.rerender(<Source manual="storm" climate="off" />);
  expect(useWeatherStore.getState().history).toHaveLength(written);
  view.rerender(<Source manual={null} climate="off" />);
  expect(current()?.kind).toBe('sunny');
});

test('a climate follows its season and moves with the schedule', () => {
  render(<Source manual={null} climate="winter" />);
  expect(SEASON_WEATHER.winter).toContain(current()?.kind);
  const seen = new Set<string>();
  for (let period = 2; period < 30; period++) {
    act(() => useTimeStore.getState().setTotalMinutes(period * CLIMATE_PERIOD_MINUTES));
    seen.add(current()!.kind);
  }
  expect(seen.size).toBeGreaterThan(1);
  for (const kind of seen) expect(SEASON_WEATHER.winter).toContain(kind);
});

test('a picked weather wins over the climate', () => {
  const view = render(<Source manual={null} climate="summer" />);
  view.rerender(<Source manual="snow" climate="summer" />);
  act(() => useTimeStore.getState().setTotalMinutes(9 * CLIMATE_PERIOD_MINUTES));
  expect(current()?.kind).toBe('snow');
});
