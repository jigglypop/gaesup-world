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
        padding: 8,
        background: 'rgba(18,20,28,0.55)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 14,
        boxShadow: '0 8px 28px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
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
              width: 54,
              height: 54,
              borderRadius: 10,
              border: active ? '1.5px solid #ffd84a' : '1px solid rgba(255,255,255,0.14)',
              background: active ? 'rgba(255,216,74,0.10)' : 'rgba(255,255,255,0.04)',
              color: '#f3f4f8',
              position: 'relative',
              cursor: 'pointer',
              padding: 0,
              fontFamily: "'Pretendard', system-ui, sans-serif",
              fontSize: 11,
              boxShadow: active ? '0 0 16px rgba(255,216,74,0.45)' : 'none',
              transition: 'background 0.18s ease, border-color 0.18s ease',
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
