import React from 'react';

import { getEventRegistry } from '../../registry/EventRegistry';
import { useEventsStore } from '../../stores/eventsStore';

export type EventsHUDProps = {
  position?: 'top-left' | 'top-right';
  excludeIds?: string[];
};

export function EventsHUD({ position = 'top-left', excludeIds = [] }: EventsHUDProps) {
  const active = useEventsStore((s) => s.active);
  const reg = getEventRegistry();

  const visible = active.filter((id) => !excludeIds.includes(id));
  if (visible.length === 0) return null;

  const layout = position === 'top-right'
    ? { top: 88, right: 12 }
    : { top: 88, left: 12 };

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        pointerEvents: 'none',
        userSelect: 'none',
        ...layout,
      }}
    >
      {visible.map((id) => {
        const def = reg.get(id);
        if (!def) return null;
        const isFestival = def.tags?.some((t) => t === 'festival' || t === 'tourney');
        return (
          <div
            key={id}
            style={{
              padding: '4px 10px',
              background: 'rgba(20,20,28,0.85)',
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: 11,
              borderRadius: 999,
              boxShadow: `inset 0 0 0 1px ${isFestival ? '#ffd84a55' : '#7adf9055'}`,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isFestival ? '#ffd84a' : '#7adf90',
            }} />
            <span>{def.name}</span>
          </div>
        );
      })}
    </div>
  );
}

export default EventsHUD;
