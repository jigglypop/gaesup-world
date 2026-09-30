import { useBuildingStore, useBuildingStoreApi, type BuildingWeatherEffect } from 'gaesup-world/building';

const WEATHERS: { effect: BuildingWeatherEffect; label: string }[] = [
  { effect: 'none', label: '☀️ 맑음' },
  { effect: 'rain', label: '🌧️ 비' },
  { effect: 'storm', label: '⛈️ 폭풍' },
  { effect: 'snow', label: '❄️ 눈' },
  { effect: 'wind', label: '🍃 바람' },
];

/** The island's weather, saved with it: a picked weather, the automatic climate, and fog. */
export function WeatherControl() {
  const effect = useBuildingStore((state) => state.weatherEffect);
  const climate = useBuildingStore((state) => state.climate);
  const fog = useBuildingStore((state) => state.showFog);
  const building = useBuildingStoreApi();
  const pick = (next: BuildingWeatherEffect) => {
    building.getState().setClimate('off');
    building.getState().setWeatherEffect(next);
  };
  const auto = () => {
    building.getState().setWeatherEffect('none');
    building.getState().setClimate('auto');
  };
  return (
    <div className="mh-weather" role="group" aria-label="날씨">
      {WEATHERS.map((item) => (
        <button key={item.effect} className="mh-chip-button" aria-pressed={climate === 'off' && effect === item.effect} onClick={() => pick(item.effect)}>
          {item.label}
        </button>
      ))}
      <button className="mh-chip-button" aria-pressed={climate !== 'off' && effect === 'none'} onClick={auto}>🔄 자동</button>
      <button className="mh-chip-button" aria-pressed={fog} onClick={() => building.getState().setShowFog(!fog)}>🌫️ 안개</button>
    </div>
  );
}
