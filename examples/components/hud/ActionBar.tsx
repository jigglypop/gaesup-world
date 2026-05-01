import React from 'react';

import {
  useCatalogStore,
  useMailStore,
  useQuestStore,
} from '../../../src';

export type HudActionButton = {
  key: string;
  label: string;
  hotkey: string;
  badge?: number | string;
  badgeColor?: string;
  active?: boolean;
};

type HudActionCounts = {
  activeQuests: number;
  unreadMail: number;
  unclaimedMail: number;
  collected: number;
};

function dispatchKey(k: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
}

export function createHudActionButtons({
  activeQuests,
  unreadMail,
  unclaimedMail,
  collected,
}: HudActionCounts): HudActionButton[] {
  return [
    { key: 'i', label: '인벤', hotkey: 'I' },
    {
      key: 'j',
      label: '퀘스트',
      hotkey: 'J',
      ...(activeQuests > 0 ? { badge: activeQuests, badgeColor: '#7aa6ff' } : {}),
    },
    {
      key: 'm',
      label: '우편',
      hotkey: 'M',
      ...(unreadMail > 0 ? { badge: unreadMail, badgeColor: unclaimedMail > 0 ? '#ffd84a' : '#cf9aff' } : {}),
    },
    {
      key: 'k',
      label: '도감',
      hotkey: 'K',
      ...(collected > 0 ? { badge: collected, badgeColor: '#7adf90' } : {}),
    },
    { key: 'c', label: '제작', hotkey: 'C' },
  ];
}

export function ActionBar() {
  const messages = useMailStore((s) => s.messages);
  const quests = useQuestStore((s) => s.state);
  const catalog = useCatalogStore((s) => s.entries);

  const unreadMail = messages.reduce((n, m) => n + (m.read ? 0 : 1), 0);
  const unclaimedMail = messages.reduce((n, m) => n + (m.claimed === false ? 1 : 0), 0);
  const activeQuests = Object.values(quests).filter((p) => p.status === 'active').length;
  const collected = Object.keys(catalog).length;

  const buttons = createHudActionButtons({ activeQuests, unreadMail, unclaimedMail, collected });

  return (
    <div
      style={{
        position: 'fixed',
        right: 12,
        bottom: 96,
        zIndex: 95,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        pointerEvents: 'auto',
      }}
    >
      {buttons.map((b) => (
        <button
          key={b.key}
          onClick={() => dispatchKey(b.key)}
          style={{
            position: 'relative',
            width: 80,
            padding: '8px 6px',
            background: 'rgba(20,20,28,0.92)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 8,
            fontFamily: 'monospace',
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
          }}
        >
          <span style={{ fontWeight: 700 }}>{b.label}</span>
          <span style={{ opacity: 0.55, fontSize: 11 }}>[{b.hotkey}]</span>
          {b.badge !== undefined && (
            <span
              style={{
                position: 'absolute',
                top: -6, right: -6,
                minWidth: 18, height: 18, padding: '0 5px',
                background: b.badgeColor ?? '#ff5a5a',
                color: '#1a1a1a',
                borderRadius: 9,
                fontSize: 11, fontWeight: 800,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
              }}
            >{b.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default ActionBar;
