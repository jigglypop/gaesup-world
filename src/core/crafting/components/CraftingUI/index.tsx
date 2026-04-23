import React, { useEffect, useState } from 'react';

import { useWalletStore } from '../../../economy/stores/walletStore';
import { useInventoryStore } from '../../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../../items/registry/ItemRegistry';
import { getRecipeRegistry } from '../../registry/RecipeRegistry';
import { useCraftingStore } from '../../stores/craftingStore';

export type CraftingUIProps = {
  toggleKey?: string;
  title?: string;
  open?: boolean;
  onClose?: () => void;
};

export function CraftingUI({ toggleKey = 'c', title = '제작대', open: openProp, onClose }: CraftingUIProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : internalOpen;

  const close = () => {
    if (controlled) onClose?.();
    else setInternalOpen(false);
  };
  const toggle = () => {
    if (controlled) { if (open) onClose?.(); }
    else setInternalOpen((v) => !v);
  };
  const isUnlocked = useCraftingStore((s) => s.isUnlocked);
  const canCraft = useCraftingStore((s) => s.canCraft);
  const craft = useCraftingStore((s) => s.craft);
  const slots = useInventoryStore((s) => s.slots);
  const bells = useWalletStore((s) => s.bells);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key.toLowerCase() === toggleKey.toLowerCase()) toggle();
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleKey, controlled, open]);

  if (!open) return null;
  const recipes = getRecipeRegistry().all();
  const counts = (() => {
    const m = new Map<string, number>();
    for (const s of slots) if (s) m.set(s.itemId, (m.get(s.itemId) ?? 0) + s.count);
    return m;
  })();

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 130, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 600, maxHeight: '76vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          background: '#1a1a1a', color: '#fff', borderRadius: 12,
          boxShadow: '0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,200,120,0.35)',
          fontFamily: "'Pretendard', system-ui, sans-serif", fontSize: 13,
        }}
      >
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
          <strong style={{ fontSize: 15 }}>{title}</strong>
          <span style={{ color: '#ffd84a' }}>{bells.toLocaleString()} B</span>
          <button onClick={close} style={btn()}>닫기 [{toggleKey.toUpperCase()}]</button>
        </div>
        <div style={{ overflowY: 'auto', padding: 10 }}>
          {recipes.length === 0 && <Empty>레시피가 없습니다.</Empty>}
          {recipes.map((r) => {
            const unlocked = isUnlocked(r.id);
            const check = canCraft(r.id);
            const outDef = getItemRegistry().get(r.output.itemId);
            return (
              <div key={r.id} style={{
                padding: 10, marginBottom: 6,
                background: '#222', borderRadius: 8,
                opacity: unlocked ? 1 : 0.45,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 16, height: 16, borderRadius: 4, background: outDef?.color ?? '#888' }} />
                    <strong>{unlocked ? r.name : '???'}</strong>
                    {r.output.count > 1 && <span style={{ opacity: 0.7 }}>x{r.output.count}</span>}
                  </div>
                  <button
                    onClick={() => craft(r.id)}
                    disabled={!check.ok}
                    style={btn(check.ok)}
                  >제작</button>
                </div>
                {unlocked && (
                  <div style={{ fontSize: 12, opacity: 0.85 }}>
                    재료: {r.ingredients.map((ing) => {
                      const have = counts.get(ing.itemId) ?? 0;
                      const ok = have >= ing.count;
                      const def = getItemRegistry().get(ing.itemId);
                      return (
                        <span key={ing.itemId} style={{ marginRight: 8, color: ok ? '#7adf90' : '#ff8a8a' }}>
                          {def?.name ?? ing.itemId} {have}/{ing.count}
                        </span>
                      );
                    })}
                    {r.requireBells ? <span style={{ color: '#ffd84a' }}>· {r.requireBells} B</span> : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 14, opacity: 0.6 }}>{children}</div>;
}

function btn(enabled?: boolean): React.CSSProperties {
  return {
    padding: '5px 10px',
    background: enabled ? '#ffc878' : '#333',
    color: enabled ? '#1a1a1a' : '#777',
    border: 'none', borderRadius: 6, cursor: enabled ? 'pointer' : 'not-allowed',
    fontFamily: "'Pretendard', system-ui, sans-serif", fontSize: 12, fontWeight: enabled ? 700 : 400,
  };
}

export default CraftingUI;
