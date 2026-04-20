import React from 'react';

import { useAudioStore } from '../../stores/audioStore';

export type AudioControlsProps = {
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  offset?: { top?: number; left?: number; right?: number; bottom?: number };
};

export function AudioControls({ position = 'bottom-right', offset }: AudioControlsProps) {
  const masterMuted = useAudioStore((s) => s.masterMuted);
  const bgmMuted = useAudioStore((s) => s.bgmMuted);
  const sfxMuted = useAudioStore((s) => s.sfxMuted);
  const toggleMaster = useAudioStore((s) => s.toggleMaster);
  const toggleBgm = useAudioStore((s) => s.toggleBgm);
  const toggleSfx = useAudioStore((s) => s.toggleSfx);

  const base = position === 'top-right'    ? { top: 50, right: 200 }
    : position === 'bottom-left' ? { bottom: 12, left: 240 }
    : position === 'top-left'    ? { top: 220, left: 12 }
    : { bottom: 12, right: 110 };
  const layout = { ...base, ...(offset ?? {}) };

  const btn = (label: string, muted: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      style={{
        padding: '4px 8px',
        background: muted ? 'rgba(80,30,30,0.85)' : 'rgba(20,20,28,0.85)',
        color: muted ? '#ff8a8a' : '#fff',
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 11,
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 6,
        cursor: 'pointer',
      }}
    >{label}{muted ? ' OFF' : ''}</button>
  );

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 95,
        display: 'flex',
        gap: 4,
        pointerEvents: 'auto',
        ...layout,
      }}
    >
      {btn('M',  masterMuted, toggleMaster)}
      {btn('Bgm', bgmMuted,   toggleBgm)}
      {btn('Sfx', sfxMuted,   toggleSfx)}
    </div>
  );
}

export default AudioControls;
