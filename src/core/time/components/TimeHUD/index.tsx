import React from 'react';

import { useGameTime } from '../../hooks/useGameTime';

const SEASON_COLOR: Record<string, string> = {
  spring: '#ffb6c1',
  summer: '#9bd97a',
  autumn: '#e0a060',
  winter: '#cfe2ff',
};

const WEEKDAY_LABEL: Record<string, string> = {
  sun: '일', mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토',
};

export function TimeHUD() {
  const t = useGameTime();
  const hh = String(t.hour).padStart(2, '0');
  const mm = String(t.minute).padStart(2, '0');
  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        left: 10,
        zIndex: 90,
        padding: '6px 10px',
        background: 'rgba(0,0,0,0.55)',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: 13,
        borderRadius: 6,
        userSelect: 'none',
        pointerEvents: 'none',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: SEASON_COLOR[t.season] ?? '#fff',
          }}
        />
        <span>
          Y{t.year} M{String(t.month).padStart(2, '0')} D{String(t.day).padStart(2, '0')}
          {' '}({WEEKDAY_LABEL[t.weekday]})
        </span>
        <span style={{ opacity: 0.85 }}>
          {hh}:{mm}
        </span>
      </div>
    </div>
  );
}

export default TimeHUD;
