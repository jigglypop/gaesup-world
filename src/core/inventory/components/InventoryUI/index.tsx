import { useEffect, useState } from 'react';

import { getItemRegistry } from '../../../items/registry/ItemRegistry';
import { canHandleOverlayShortcut } from '../../../ui/overlayKeyboard';
import {
  OVERLAY_BACKDROP_STYLE,
  OVERLAY_BORDER_COLOR,
  OVERLAY_HEADER_STYLE,
  OVERLAY_PANEL_STYLE,
  OVERLAY_TEXT_DIM_COLOR,
  overlayButtonStyle,
} from '../../../ui/overlayStyles';
import { useInventoryStore } from '../../stores/inventoryStore';

export type InventoryUIProps = {
  toggleKey?: string;
  initiallyOpen?: boolean;
};

const SLOT_COLUMNS = 5;
const SLOT_GAP = 6;
const PANEL_WIDTH = 460;

export function InventoryUI({ toggleKey = 'i', initiallyOpen = false }: InventoryUIProps) {
  const [open, setOpen] = useState(initiallyOpen);
  const slots = useInventoryStore((s) => s.slots);
  const move = useInventoryStore((s) => s.move);
  const reg = getItemRegistry();
  const [drag, setDrag] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!canHandleOverlayShortcut(e)) return;
      if (e.key.toLowerCase() === toggleKey.toLowerCase()) setOpen((v) => !v);
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleKey]);

  if (!open) return null;
  return (
    <div style={OVERLAY_BACKDROP_STYLE} onClick={() => setOpen(false)}>
      <div
        role="region"
        data-world-overlay="inventory"
        aria-label="인벤토리"
        onClick={(e) => e.stopPropagation()}
        style={{ ...OVERLAY_PANEL_STYLE, width: PANEL_WIDTH, maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100dvh - 32px)', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}
      >
        <div style={{ ...OVERLAY_HEADER_STYLE, flexShrink: 0 }}>
          <strong style={{ fontSize: 15 }}>인벤토리</strong>
          <button onClick={() => setOpen(false)} style={overlayButtonStyle()}>
            닫기 [{toggleKey.toUpperCase()}]
          </button>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${SLOT_COLUMNS}, minmax(0, 1fr))`,
            gap: SLOT_GAP,
            padding: 14,
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          {slots.map((slot, i) => {
            const def = slot ? reg.get(slot.itemId) : undefined;
            return (
              <div
                key={i}
                draggable={!!slot}
                onDragStart={() => setDrag(i)}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={() => {
                  if (drag !== null && drag !== i) move(drag, i);
                  setDrag(null);
                }}
                title={def?.name ?? ''}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  boxSizing: 'border-box',
                  borderRadius: 8,
                  border: `1px solid ${OVERLAY_BORDER_COLOR}`,
                  background: 'rgba(255, 255, 255, 0.04)',
                  position: 'relative',
                  cursor: slot ? 'grab' : 'default',
                  fontSize: 11,
                }}
              >
                {slot && def ? (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        inset: 8,
                        borderRadius: 6,
                        background: def.color ?? '#888',
                        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.4)',
                      }}
                    />
                    {def.stackable && slot.count > 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 2,
                          right: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          textShadow: '0 0 3px black',
                        }}
                      >
                        {slot.count}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
        <div style={{ padding: '0 14px 12px', color: OVERLAY_TEXT_DIM_COLOR, fontSize: 11, flexShrink: 0 }}>
          {`[${toggleKey.toUpperCase()}] 닫기 / 드래그로 이동`}
        </div>
      </div>
    </div>
  );
}

export default InventoryUI;
