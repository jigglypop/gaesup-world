import React, { useEffect, useMemo, useState } from 'react';

import { getItemRegistry } from '../../../items/registry/ItemRegistry';
import type { ItemCategory } from '../../../items/types';
import { useCatalogStore } from '../../stores/catalogStore';
import { CATALOG_CATEGORIES } from '../../types';

export type CatalogUIProps = {
  toggleKey?: string;
};

export function CatalogUI({ toggleKey = 'k' }: CatalogUIProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ItemCategory>('fish');
  const entries = useCatalogStore((s) => s.entries);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key.toLowerCase() === toggleKey.toLowerCase()) setOpen((v) => !v);
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleKey]);

  const allItems = useMemo(() => getItemRegistry().all(), []);
  const itemsByCategory = useMemo(() => {
    const map = new Map<ItemCategory, typeof allItems>();
    for (const c of CATALOG_CATEGORIES) map.set(c, []);
    for (const def of allItems) {
      const arr = map.get(def.category);
      if (arr) arr.push(def);
    }
    return map;
  }, [allItems]);

  if (!open) return null;
  const list = itemsByCategory.get(tab) ?? [];
  const collectedInTab = list.filter((d) => entries[d.id]).length;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 130, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 760, height: 520, display: 'flex', flexDirection: 'column',
          background: '#1a1a1a', color: '#fff', borderRadius: 12,
          boxShadow: '0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(122,223,144,0.35)',
          fontFamily: 'monospace', fontSize: 13, overflow: 'hidden',
        }}
      >
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
          <strong style={{ fontSize: 15 }}>도감</strong>
          <button onClick={() => setOpen(false)} style={btn()}>닫기 [{toggleKey.toUpperCase()}]</button>
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
          {CATALOG_CATEGORIES.map((c) => {
            const items = itemsByCategory.get(c) ?? [];
            if (items.length === 0) return null;
            const collected = items.filter((d) => entries[d.id]).length;
            return (
              <button
                key={c}
                onClick={() => setTab(c)}
                style={{
                  flex: 1, padding: '8px 4px',
                  background: tab === c ? '#262626' : 'transparent',
                  color: tab === c ? '#7adf90' : '#ddd',
                  border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12,
                }}
              >
                {labelOf(c)} ({collected}/{items.length})
              </button>
            );
          })}
        </div>
        <div style={{ padding: '6px 14px', fontSize: 12, opacity: 0.7 }}>
          {labelOf(tab)} — {collectedInTab}/{list.length} 수집
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {list.map((def) => {
            const entry = entries[def.id];
            const seen = !!entry;
            return (
              <div key={def.id} style={{
                padding: 10, borderRadius: 8,
                background: seen ? '#222' : '#181818',
                border: seen ? '1px solid #2e3' : '1px solid #2a2a2a',
                opacity: seen ? 1 : 0.4,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ width: 16, height: 16, borderRadius: 4, background: def.color ?? '#888' }} />
                  <strong style={{ fontSize: 13 }}>{seen ? def.name : '???'}</strong>
                </div>
                {seen && (
                  <div style={{ fontSize: 11, opacity: 0.7 }}>
                    수집 {entry.totalCollected} · day {entry.firstSeenDay}
                  </div>
                )}
              </div>
            );
          })}
          {list.length === 0 && <div style={{ opacity: 0.6 }}>이 카테고리에는 항목이 없습니다.</div>}
        </div>
      </div>
    </div>
  );
}

function labelOf(c: ItemCategory): string {
  switch (c) {
    case 'fish': return '물고기';
    case 'bug': return '곤충';
    case 'food': return '음식';
    case 'material': return '재료';
    case 'furniture': return '가구';
    case 'tool': return '도구';
    case 'misc': return '기타';
  }
}

function btn(): React.CSSProperties {
  return {
    padding: '4px 10px', background: '#444', color: '#fff',
    border: 'none', borderRadius: 6, cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 12,
  };
}

export default CatalogUI;
