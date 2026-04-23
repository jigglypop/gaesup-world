import React, { useState } from 'react';

import { getItemRegistry } from '../../../items/registry/ItemRegistry';
import { useInventoryStore } from '../../../inventory/stores/inventoryStore';
import { useShopStore } from '../../stores/shopStore';
import { useWalletStore } from '../../stores/walletStore';
import { notify } from '../../../ui/components/Toast/toastStore';

export type ShopUIProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
};

export function ShopUI({ open, onClose, title = 'Shop' }: ShopUIProps) {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const stock = useShopStore((s) => s.dailyStock);
  const buy = useShopStore((s) => s.buy);
  const sell = useShopStore((s) => s.sell);
  const sellPriceOf = useShopStore((s) => s.sellPriceOf);
  const bells = useWalletStore((s) => s.bells);
  const slots = useInventoryStore((s) => s.slots);

  if (!open) return null;

  const sellable = (() => {
    const counts = new Map<string, number>();
    for (const slot of slots) {
      if (!slot) continue;
      counts.set(slot.itemId, (counts.get(slot.itemId) ?? 0) + slot.count);
    }
    return Array.from(counts.entries()).filter(([id]) => sellPriceOf(id) > 0);
  })();

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 130,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 520, maxHeight: '70vh', overflow: 'hidden',
          background: '#1a1a1a', color: '#fff',
          borderRadius: 12,
          boxShadow: '0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,216,74,0.35)',
          fontFamily: "'Pretendard', system-ui, sans-serif", fontSize: 13,
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #333' }}>
          <strong style={{ fontSize: 15 }}>{title}</strong>
          <span style={{ color: '#ffd84a' }}>{bells.toLocaleString()} B</span>
          <button onClick={onClose} style={btnStyle()}>닫기</button>
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
          <TabBtn active={tab === 'buy'} onClick={() => setTab('buy')}>구매</TabBtn>
          <TabBtn active={tab === 'sell'} onClick={() => setTab('sell')}>판매</TabBtn>
        </div>
        <div style={{ overflowY: 'auto', padding: 10 }}>
          {tab === 'buy' && (
            stock.length === 0 ? (
              <div style={{ opacity: 0.7, padding: 12 }}>오늘 상품이 없습니다.</div>
            ) : stock.map((offer) => {
              const def = getItemRegistry().get(offer.itemId);
              const price = offer.price ?? def?.buyPrice ?? 0;
              const stockLeft = offer.stock ?? 0;
              return (
                <Row
                  key={offer.itemId}
                  {...(def?.color ? { color: def.color } : {})}
                  name={def?.name ?? offer.itemId}
                  sub={`재고 ${stockLeft}`}
                  price={price}
                  disabled={stockLeft <= 0 || bells < price}
                  actionLabel="구매"
                  onAction={() => {
                    const r = buy(offer.itemId, 1);
                    if (r.ok) notify('success', `${def?.name ?? offer.itemId} 구매`);
                    else notify('warn', `구매 실패: ${r.reason ?? ''}`);
                  }}
                />
              );
            })
          )}
          {tab === 'sell' && (
            sellable.length === 0 ? (
              <div style={{ opacity: 0.7, padding: 12 }}>판매할 아이템이 없습니다.</div>
            ) : sellable.map(([id, count]) => {
              const def = getItemRegistry().get(id);
              const price = sellPriceOf(id);
              return (
                <Row
                  key={id}
                  {...(def?.color ? { color: def.color } : {})}
                  name={def?.name ?? id}
                  sub={`보유 ${count}`}
                  price={price}
                  actionLabel="판매"
                  onAction={() => {
                    const r = sell(id, 1);
                    if (r.ok) notify('reward', `${def?.name ?? id} 판매 +${price} B`);
                    else notify('warn', `판매 실패: ${r.reason ?? ''}`);
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '8px 10px',
        background: active ? '#262626' : 'transparent',
        color: active ? '#ffd84a' : '#ddd',
        border: 'none',
        cursor: 'pointer',
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 13,
      }}
    >{children}</button>
  );
}

function Row({
  color, name, sub, price, actionLabel, onAction, disabled,
}: {
  color?: string; name: string; sub?: string; price: number;
  actionLabel: string; onAction: () => void; disabled?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 6px', borderBottom: '1px solid #2a2a2a',
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 6, background: color ?? '#888',
      }} />
      <div style={{ flex: 1 }}>
        <div>{name}</div>
        {sub && <div style={{ fontSize: 11, opacity: 0.7 }}>{sub}</div>}
      </div>
      <div style={{ color: '#ffd84a', minWidth: 64, textAlign: 'right' }}>{price.toLocaleString()} B</div>
      <button onClick={onAction} disabled={disabled} style={btnStyle(disabled)}>{actionLabel}</button>
    </div>
  );
}

function btnStyle(disabled?: boolean): React.CSSProperties {
  return {
    padding: '6px 10px',
    background: disabled ? '#333' : '#444',
    color: disabled ? '#777' : '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'Pretendard', system-ui, sans-serif",
    fontSize: 12,
  };
}

export default ShopUI;
