import React from 'react';

import { getItemRegistry } from '../../../items/registry/ItemRegistry';
import { useHotbar } from '../../hooks/useInventory';

export function HotbarUI() {
  const { slots, equipped, setEquipped } = useHotbar();
  const reg = getItemRegistry();
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 95,
        display: 'flex',
        gap: 6,
        padding: 6,
        background: 'rgba(0,0,0,0.5)',
        borderRadius: 8,
        backdropFilter: 'blur(6px)',
      }}
    >
      {slots.map((slot, i) => {
        const def = slot ? reg.get(slot.itemId) : undefined;
        const active = i === equipped;
        return (
          <button
            key={i}
            onClick={() => setEquipped(i)}
            title={def?.name ?? ''}
            style={{
              width: 56,
              height: 56,
              borderRadius: 6,
              border: active ? '2px solid #ffd84a' : '2px solid rgba(255,255,255,0.18)',
              background: 'rgba(20,20,20,0.85)',
              color: '#fff',
              position: 'relative',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'monospace',
              fontSize: 11,
              boxShadow: active ? '0 0 12px rgba(255,216,74,0.6)' : 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 4,
                left: 4,
                width: 14,
                height: 14,
                borderRadius: 3,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, opacity: 0.85,
              }}
            >
              {i + 1}
            </div>
            {slot && def ? (
              <>
                <div
                  style={{
                    position: 'absolute',
                    inset: 14,
                    borderRadius: 6,
                    background: def.color ?? '#888',
                    boxShadow: 'inset 0 0 8px rgba(0,0,0,0.4)',
                  }}
                />
                {def.stackable && slot.count > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 2, right: 4,
                      fontSize: 11, fontWeight: 700,
                      textShadow: '0 0 3px black',
                    }}
                  >
                    {slot.count}
                  </div>
                )}
              </>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default HotbarUI;
