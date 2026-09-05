import { useEffect, useMemo, useState } from 'react';

import { getItemRegistry } from '../../../items/registry/ItemRegistry';
import type { ItemCategory } from '../../../items/types';
import { canHandleOverlayShortcut } from '../../../ui/overlayKeyboard';
import {
  OVERLAY_BACKDROP_STYLE,
  OVERLAY_BORDER_COLOR,
  OVERLAY_CARD_STYLE,
  OVERLAY_FONT_FAMILY,
  OVERLAY_GOOD_COLOR,
  OVERLAY_HEADER_STYLE,
  OVERLAY_PANEL_STYLE,
  OVERLAY_SURFACE_ACTIVE_COLOR,
  OVERLAY_TEXT_DIM_COLOR,
  overlayButtonStyle,
} from '../../../ui/overlayStyles';
import { useCatalogStore } from '../../stores/catalogStore';
import { CATALOG_CATEGORIES } from '../../types';

export type CatalogUIProps = {
  toggleKey?: string;
};

const PANEL_WIDTH = 760;
const PANEL_HEIGHT = 520;
const UNSEEN_OPACITY = 0.4;

export function CatalogUI({ toggleKey = 'k' }: CatalogUIProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ItemCategory>('fish');
  const entries = useCatalogStore((s) => s.entries);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!canHandleOverlayShortcut(e)) return;
      if (e.key.toLowerCase() === toggleKey.toLowerCase()) setOpen((v) => !v);
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleKey]);

  const allItems = useMemo(() => open ? getItemRegistry().all() : [], [open]);
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
  const selectedTab = itemsByCategory.get(tab)?.length
    ? tab
    : CATALOG_CATEGORIES.find((category) => itemsByCategory.get(category)?.length) ?? tab;
  const list = itemsByCategory.get(selectedTab) ?? [];
  const collectedInTab = list.filter((d) => entries[d.id]).length;

  return (
    <div style={OVERLAY_BACKDROP_STYLE} onClick={() => setOpen(false)}>
      <div
        data-world-overlay="catalog"
        onClick={(e) => e.stopPropagation()}
        style={{
          ...OVERLAY_PANEL_STYLE,
          width: PANEL_WIDTH,
          height: PANEL_HEIGHT,
          maxWidth: 'calc(100vw - 24px)',
          maxHeight: 'calc(100dvh - 32px)',
          boxSizing: 'border-box',
          overflowWrap: 'anywhere',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ ...OVERLAY_HEADER_STYLE, flexShrink: 0 }}>
          <strong style={{ fontSize: 15 }}>도감</strong>
          <button onClick={() => setOpen(false)} style={overlayButtonStyle()}>
            닫기 [{toggleKey.toUpperCase()}]
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', flexShrink: 0, borderBottom: `1px solid ${OVERLAY_BORDER_COLOR}` }}>
          {CATALOG_CATEGORIES.map((c) => {
            const items = itemsByCategory.get(c) ?? [];
            if (items.length === 0) return null;
            const collected = items.filter((d) => entries[d.id]).length;
            return (
              <button
                key={c}
                aria-pressed={selectedTab === c}
                onClick={() => setTab(c)}
                style={{
                  flex: '1 0 90px',
                  padding: '8px 4px',
                  background: selectedTab === c ? OVERLAY_SURFACE_ACTIVE_COLOR : 'transparent',
                  color: selectedTab === c ? OVERLAY_GOOD_COLOR : '#ddd',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: OVERLAY_FONT_FAMILY,
                  fontSize: 12,
                }}
              >
                {labelOf(c)} ({collected}/{items.length})
              </button>
            );
          })}
        </div>
        <div style={{ padding: '6px 14px', fontSize: 12, color: OVERLAY_TEXT_DIM_COLOR }}>
          {labelOf(selectedTab)} · {collectedInTab}/{list.length} 수집
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: 10,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))',
            alignContent: 'start',
            gap: 8,
          }}
        >
          {list.map((def) => {
            const entry = entries[def.id];
            const seen = !!entry;
            return (
              <div
                key={def.id}
                style={{
                  ...OVERLAY_CARD_STYLE,
                  padding: 10,
                  borderColor: seen ? 'rgba(122, 223, 144, 0.45)' : 'rgba(255, 255, 255, 0.08)',
                  opacity: seen ? 1 : UNSEEN_OPACITY,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      background: def.color ?? '#888',
                    }}
                  />
                  <strong style={{ fontSize: 13 }}>{seen ? def.name : '???'}</strong>
                </div>
                {seen && (
                  <div style={{ fontSize: 11, color: OVERLAY_TEXT_DIM_COLOR }}>
                    수집 {entry.totalCollected} · {entry.firstSeenDay}일차
                  </div>
                )}
              </div>
            );
          })}
          {list.length === 0 && (
            <div style={{ color: OVERLAY_TEXT_DIM_COLOR }}>이 카테고리에는 항목이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function labelOf(c: ItemCategory): string {
  switch (c) {
    case 'fish':
      return '물고기';
    case 'bug':
      return '곤충';
    case 'food':
      return '음식';
    case 'material':
      return '재료';
    case 'furniture':
      return '가구';
    case 'tool':
      return '도구';
    case 'misc':
      return '기타';
  }
}

export default CatalogUI;
