import React from 'react';

import { useWalletStore } from '../../stores/walletStore';

export type WalletHUDProps = {
  position?: 'top-center' | 'bottom-right';
};

export function WalletHUD({ position = 'top-center' }: WalletHUDProps) {
  const bells = useWalletStore((s) => s.bells);
  const layout = position === 'bottom-right'
    ? { bottom: 96, right: 12 }
    : { top: 10, left: '50%', transform: 'translateX(-50%)' as const };
  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 90,
        padding: '6px 12px',
        background: 'rgba(40,30,10,0.85)',
        color: '#ffd84a',
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 13,
        borderRadius: 999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: 'inset 0 0 0 1px rgba(255,216,74,0.4)',
        pointerEvents: 'none',
        userSelect: 'none',
        ...layout,
      }}
    >
      <span style={{
        width: 16, height: 16, borderRadius: '50%',
        background: '#ffd84a', color: '#3a2a08',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 11,
      }}>B</span>
      <span style={{ fontWeight: 700 }}>{bells.toLocaleString()}</span>
    </div>
  );
}

export default WalletHUD;
