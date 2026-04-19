import React from 'react';

import { useWeatherStore } from '../../stores/weatherStore';
import type { WeatherKind } from '../../types';

export type WeatherHUDProps = {
  position?: 'top-left' | 'top-right';
};

const ICONS: Record<WeatherKind, { sym: string; color: string; label: string }> = {
  sunny:  { sym: 'O', color: '#ffd84a', label: '맑음' },
  cloudy: { sym: 'c', color: '#aab2bc', label: '흐림' },
  rain:   { sym: 'r', color: '#4aa8ff', label: '비' },
  snow:   { sym: '*', color: '#dff0ff', label: '눈' },
  storm:  { sym: '!', color: '#7f7fff', label: '폭풍' },
};

export function WeatherHUD({ position = 'top-left' }: WeatherHUDProps) {
  const current = useWeatherStore((s) => s.current);
  if (!current) return null;
  const meta = ICONS[current.kind];
  const layout = position === 'top-right'
    ? { top: 50, right: 12 }
    : { top: 50, left: 12 };
  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 90,
        padding: '4px 10px',
        background: 'rgba(20,20,28,0.85)',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: 12,
        borderRadius: 999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: `inset 0 0 0 1px ${meta.color}55`,
        pointerEvents: 'none',
        userSelect: 'none',
        ...layout,
      }}
    >
      <span style={{
        width: 18, height: 18, borderRadius: '50%',
        background: meta.color, color: '#1a1a1a',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 11,
      }}>{meta.sym}</span>
      <span>{meta.label}</span>
    </div>
  );
}

export default WeatherHUD;
