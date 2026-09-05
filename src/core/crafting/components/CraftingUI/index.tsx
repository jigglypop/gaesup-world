import React, { useCallback, useEffect, useState } from 'react';


import { useWalletStore } from '../../../economy/stores/walletStore';
import { useInventoryStore } from '../../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../../items/registry/ItemRegistry';
import { notify } from '../../../ui/components/Toast/toastStore';
import { canHandleOverlayShortcut } from '../../../ui/overlayKeyboard';
import { getRecipeRegistry } from '../../registry/RecipeRegistry';
import { useCraftingStore } from '../../stores/craftingStore';

export type CraftingUIProps = {
  toggleKey?: string;
  title?: string;
  open?: boolean;
  onClose?: () => void;
};

const CRAFT_FAILURE_MESSAGES: Record<string, string> = {
  'unknown recipe': '레시피를 찾을 수 없어요.',
  locked: '아직 배우지 않은 레시피예요.',
  'missing ingredients': '재료가 부족해요.',
  'insufficient bells': '돈이 부족해요.',
  'inventory full': '결과물을 받을 가방 공간이 부족해요.',
  'remove failed': '재료 수량이 바뀌었어요. 가방을 확인해 주세요.',
  'spend failed': '제작 비용을 지불하지 못했어요. 보유 금액을 확인해 주세요.',
};

export function CraftingUI({ toggleKey = 'c', title = '제작대', open: openProp, onClose }: CraftingUIProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : internalOpen;

  const close = useCallback(() => {
    if (controlled) onClose?.();
    else setInternalOpen(false);
  }, [controlled, onClose]);
  const toggle = useCallback(() => {
    if (controlled) { if (open) onClose?.(); }
    else setInternalOpen((v) => !v);
  }, [controlled, open, onClose]);
  const unlockedRecipes = useCraftingStore((s) => s.unlocked);
  const canCraft = useCraftingStore((s) => s.canCraft);
  const craft = useCraftingStore((s) => s.craft);
  const slots = useInventoryStore((s) => s.slots);
  const bells = useWalletStore((s) => s.bells);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!canHandleOverlayShortcut(e)) return;
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        close();
      } else if (e.key.toLowerCase() === toggleKey.toLowerCase() && (!controlled || open)) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toggleKey, controlled, open, close, toggle]);

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
        data-world-overlay="crafting"
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 600, maxWidth: 'calc(100vw - 24px)', boxSizing: 'border-box', overflowWrap: 'anywhere', maxHeight: '76dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          background: '#1a1a1a', color: '#fff', borderRadius: 12,
          boxShadow: '0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,200,120,0.35)',
          fontFamily: "'Pretendard', system-ui, sans-serif", fontSize: 13,
        }}
      >
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #333', display: 'flex', flexWrap: 'wrap', gap: 8, flexShrink: 0, justifyContent: 'space-between' }}>
          <strong style={{ fontSize: 15 }}>{title}</strong>
          <span style={{ color: '#ffd84a' }}>{bells.toLocaleString()} 벨</span>
          <button type="button" onClick={close} style={btn(true)}>닫기 [{toggleKey.toUpperCase()}]</button>
        </div>
        <div style={{ overflowY: 'auto', minHeight: 0, padding: 10 }}>
          {recipes.length === 0 && <Empty>레시피가 없습니다.</Empty>}
          {recipes.map((r) => {
            const unlocked = r.unlockedByDefault || unlockedRecipes.has(r.id);
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
                    type="button"
                    onClick={() => {
                      const result = craft(r.id);
                      if (!result.ok) notify('warn', CRAFT_FAILURE_MESSAGES[result.reason ?? ''] ?? '지금은 제작할 수 없어요.');
                    }}
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
                    {r.requireBells ? <span style={{ color: '#ffd84a' }}>· {r.requireBells} 벨</span> : null}
                  </div>
                )}
                {!check.ok && (
                  <div style={{ marginTop: 6, color: '#ffb3a7', fontSize: 12 }}>
                    {CRAFT_FAILURE_MESSAGES[check.reason ?? ''] ?? '지금은 제작할 수 없어요.'}
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
