import React from 'react';

import { useTownStore } from '../../stores/townStore';

export type TownHUDProps = {
  position?: 'top-right' | 'bottom-right';
};

export function TownHUD({ position = 'top-right' }: TownHUDProps) {
  const decorationScore = useTownStore((s) => s.decorationScore);
  const houses = useTownStore((s) => s.houses);
  const residents = useTownStore((s) => s.residents);

  const totalHouses = Object.keys(houses).length;
  const occupied = Object.values(houses).filter((h) => h.state === 'occupied').length;
  const residentCount = Object.keys(residents).length;

  const layout = position === 'bottom-right'
    ? { bottom: 12, right: 100 }
    : { top: 50, right: 12 };

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 90,
        padding: '6px 10px',
        background: 'rgba(20,20,28,0.85)',
        color: '#fff',
        fontFamily: 'monospace',
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
