import React, { useEffect, useState } from 'react';

import { getItemRegistry } from '../../../items/registry/ItemRegistry';
import { useInventoryStore } from '../../stores/inventoryStore';

export type InventoryUIProps = {
  toggleKey?: string;
  initiallyOpen?: boolean;
};

export function InventoryUI({ toggleKey = 'i', initiallyOpen = false }: InventoryUIProps) {
  const [open, setOpen] = useState(initiallyOpen);
  const slots = useInventoryStore((s) => s.slots);
  const move = useInventoryStore((s) => s.move);
  const reg = getItemRegistry();
  const [drag, setDrag] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key.toLowerCase() === toggleKey.toLowerCase()) setOpen((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleKey]);

  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(20,20,20,0.95)',
          borderRadius: 12,
          padding: 16,
          minWidth: 460,
          color: '#fff',
          fontFamily: 'monospace',
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 14, opacity: 0.9 }}>Inventory</div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'transparent', border: 'none', color: '#fff',
              cursor: 'pointer', fontSize: 14,
            }}
          >×</button>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 64px)',
            gap: 6,
          }}
        >
          {slots.map((slot, i) => {
            const def = slot ? reg.get(slot.itemId) : undefined;
            return (
              <div
                key={i}
                draggable={!!slot}
                onDragStart={() => setDrag(i)}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={() => { if (drag !== null && drag !== i) move(drag, i); setDrag(null); }}
                title={def?.name ?? ''}
                style={{
                  width: 64, height: 64,
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(0,0,0,0.5)',
                  position: 'relative',
                  cursor: slot ? 'grab' : 'default',
                  fontSize: 11,
                }}
              >
                {slot && def ? (
                  <>
                    <div
                      style={{
                        position: 'absolute', inset: 8,
                        borderRadius: 6,
                        background: def.color ?? '#888',
                        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.4)',
                      }}
                    />
                    {def.stackable && slot.count > 1 && (
                      <div
                        style={{
                          position: 'absolute', bottom: 2, right: 4,
                          fontSize: 11, fontWeight: 700,
                          textShadow: '0 0 3px black',
                        }}
                      >{slot.count}</div>
                    )}
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, opacity: 0.6, fontSize: 11 }}>
          {`[${toggleKey.toUpperCase()}] 닫기 / 드래그로 이동`}
        </div>
      </div>
    </div>
  );
}

export default InventoryUI;
