import React from 'react';

import { useTownStore } from '../../stores/townStore';

export type TownHUDProps = {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  offset?: { top?: number; left?: number; right?: number; bottom?: number };
};

export function TownHUD({ position = 'top-right', offset }: TownHUDProps) {
  const decorationScore = useTownStore((s) => s.decorationScore);
  const houses = useTownStore((s) => s.houses);
  const residents = useTownStore((s) => s.residents);

  const totalHouses = Object.keys(houses).length;
  const occupied = Object.values(houses).filter((h) => h.state === 'occupied').length;
  const residentCount = Object.keys(residents).length;

  const base = position === 'bottom-right' ? { bottom: 12, right: 100 }
    : position === 'top-left'      ? { top: 160, left: 12 }
    : position === 'bottom-left'   ? { bottom: 12, left: 240 }
    : { top: 50, right: 12 };
  const layout = { ...base, ...(offset ?? {}) };

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 90,
        padding: '6px 10px',
        background: 'rgba(20,20,28,0.85)',
        color: '#fff',
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 11,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        pointerEvents: 'none',
        userSelect: 'none',
        ...layout,
      }}
    >
      <div>마을 점수 <span style={{ color: '#ffd84a', fontWeight: 700 }}>{decorationScore}</span></div>
      <div>주민 {occupied}/{totalHouses} (등록 {residentCount})</div>
    </div>
  );
}

export default TownHUD;
