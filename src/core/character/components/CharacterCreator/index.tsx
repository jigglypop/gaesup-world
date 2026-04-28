import { useEffect, useMemo, useState } from 'react';

import {
  AssetPreviewCanvas,
  useAssetStore,
  type AssetRecord,
} from '../../../assets';
import { useCharacterStore } from '../../stores/characterStore';
import {
  FACE_STYLE_LABEL,
  HAIR_STYLE_LABEL,
  OUTFIT_SLOT_LABEL,
  type AppearanceColors,
  type FaceStyle,
  type HairStyle,
  type OutfitSlot,
} from '../../types';

export type CharacterCreatorProps = {
  toggleKey?: string;
  open?: boolean;
  onClose?: () => void;
};

const COLOR_KEYS: { key: keyof AppearanceColors; label: string }[] = [
  { key: 'body',   label: '피부' },
  { key: 'hair',   label: '머리' },
  { key: 'hat',    label: '모자' },
  { key: 'top',    label: '상의' },
  { key: 'bottom', label: '하의' },
  { key: 'shoes',  label: '신발' },
];

const HAIR_OPTIONS: HairStyle[] = ['short', 'long', 'cap', 'bun', 'spiky'];
const FACE_OPTIONS: FaceStyle[] = ['default', 'smile', 'wink', 'sleepy', 'surprised'];
const SLOTS: OutfitSlot[] = ['hat', 'top', 'bottom', 'shoes', 'face', 'weapon', 'accessory'];

const matchesSlot = (asset: AssetRecord, slot: OutfitSlot) => {
  if (slot === 'weapon') return asset.kind === 'weapon' || asset.slot === 'weapon';
  return asset.slot === slot && (asset.kind === 'characterPart' || asset.kind === 'weapon');
};

export function CharacterCreator({ toggleKey, open, onClose }: CharacterCreatorProps = {}) {
  const controlled = typeof open === 'boolean';
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlled ? open : internalOpen;

  const appearance = useCharacterStore((s) => s.appearance);
  const outfits = useCharacterStore((s) => s.outfits);
  const setName = useCharacterStore((s) => s.setName);
  const setColor = useCharacterStore((s) => s.setColor);
  const setHair = useCharacterStore((s) => s.setHair);
  const setFace = useCharacterStore((s) => s.setFace);
  const equipOutfit = useCharacterStore((s) => s.equipOutfit);
  const resetAppearance = useCharacterStore((s) => s.resetAppearance);
  const assetIds = useAssetStore((s) => s.ids);
  const assetRecords = useAssetStore((s) => s.records);
  const [tagFilter, setTagFilter] = useState('');
  const [ownedOnly, setOwnedOnly] = useState(false);

  const assetsBySlot = useMemo(() => {
    const normalizedTag = tagFilter.trim().toLowerCase();
    return SLOTS.reduce((acc, slot) => {
      acc[slot] = assetIds
        .map((id) => assetRecords[id])
        .filter((asset): asset is AssetRecord => Boolean(asset))
        .filter((asset) => matchesSlot(asset, slot))
        .filter((asset) => {
          if (!normalizedTag) return true;
          return asset.tags?.some((tag) => tag.toLowerCase().includes(normalizedTag)) ?? false;
        })
        .filter((asset) => !ownedOnly || asset.metadata?.['owned'] !== false);
      return acc;
    }, {} as Record<OutfitSlot, AssetRecord[]>);
  }, [assetIds, assetRecords, ownedOnly, tagFilter]);

  useEffect(() => {
    if (!toggleKey || controlled) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      const wantedKey = toggleKey.toLowerCase();
      const wantedCode = `Key${toggleKey.toUpperCase()}`;
      if (e.code !== wantedCode && e.key.toLowerCase() !== wantedKey) return;
      setInternalOpen((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleKey, controlled]);

  if (!isOpen) return null;

  const close = () => {
    if (controlled) onClose?.();
    else setInternalOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 130,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.32)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(760px, 92vw)',
          maxHeight: '88vh',
          overflowY: 'auto',
          background: 'rgba(18,20,28,0.62)',
          color: '#f3f4f8',
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          fontFamily: "'Pretendard', system-ui, sans-serif",
          fontSize: 13,
          padding: 18,
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, flex: 1 }}>캐릭터 만들기</h2>
          <button
            onClick={resetAppearance}
            style={glassBtn}
          >
            기본값
          </button>
          <button onClick={close} style={glassBtn}>닫기</button>
        </header>

        <section style={{ marginBottom: 16 }}>
          <label style={labelStyle}>이름</label>
          <input
            value={appearance.name}
            onChange={(e) => setName(e.target.value)}
            maxLength={16}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.06)',
              color: '#f3f4f8',
              fontFamily: 'inherit',
              fontSize: 13,
            }}
          />
        </section>

        <section style={{ marginBottom: 16 }}>
          <label style={labelStyle}>색상</label>
          <div style={gridCols}>
            {COLOR_KEYS.map(({ key, label }) => (
              <div key={key} style={colorRow}>
                <span style={{ flex: 1 }}>{label}</span>
                <input
                  type="color"
                  value={appearance.colors[key]}
                  onChange={(e) => setColor(key, e.target.value)}
                  style={{
                    width: 36,
                    height: 28,
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: 6,
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 16 }}>
          <label style={labelStyle}>헤어</label>
          <div style={chipRow}>
            {HAIR_OPTIONS.map((h) => (
              <button
                key={h}
                onClick={() => setHair(h)}
                style={chipStyle(appearance.hair === h)}
              >
                {HAIR_STYLE_LABEL[h]}
              </button>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 16 }}>
          <label style={labelStyle}>표정</label>
          <div style={chipRow}>
            {FACE_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => setFace(f)}
                style={chipStyle(appearance.face === f)}
              >
                {FACE_STYLE_LABEL[f]}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div style={filterHeader}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>장착 슬롯</label>
            <input
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              placeholder="태그 검색"
              style={smallInput}
            />
            <label style={checkLabel}>
              <input
                type="checkbox"
                checked={ownedOnly}
                onChange={(e) => setOwnedOnly(e.target.checked)}
              />
              보유만
            </label>
          </div>
          <div style={gridCols}>
            {SLOTS.map((slot) => (
              <div key={slot} style={slotPanel}>
                <div style={slotHeader}>
                  <span>{OUTFIT_SLOT_LABEL[slot]}</span>
                  <span style={{ color: outfits[slot] ? '#7adf90' : 'rgba(243,244,248,0.45)' }}>
                    {outfits[slot] ?? '비어있음'}
                  </span>
                  <button onClick={() => equipOutfit(slot, null)} style={glassBtn}>
                    비우기
                  </button>
                </div>
                <div style={assetGrid}>
                  {assetsBySlot[slot].map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => equipOutfit(slot, asset.id)}
                      style={assetCard(outfits[slot] === asset.id)}
                    >
                      <AssetPreviewCanvas asset={asset} size={58} />
                      <span style={assetName}>{asset.name}</span>
                    </button>
                  ))}
                  {assetsBySlot[slot].length === 0 && (
                    <span style={emptyText}>사용 가능한 에셋 없음</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  fontSize: 11.5,
  fontWeight: 600,
  letterSpacing: 0.4,
  textTransform: 'uppercase' as const,
  color: 'rgba(243,244,248,0.62)',
};

const gridCols = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 6,
};

const colorRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 10px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 8,
};

const chipRow = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 6,
};

const chipStyle = (active: boolean) => ({
  padding: '6px 12px',
  borderRadius: 999,
  border: active ? '1px solid #ffd84a' : '1px solid rgba(255,255,255,0.14)',
  background: active ? 'rgba(255,216,74,0.12)' : 'rgba(255,255,255,0.04)',
  color: '#f3f4f8',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 12,
  fontWeight: 500,
});

const glassBtn = {
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(255,255,255,0.06)',
  color: '#f3f4f8',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 12,
  fontWeight: 500,
};

const filterHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8,
};

const smallInput = {
  flex: 1,
  minWidth: 120,
  padding: '6px 9px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(255,255,255,0.06)',
  color: '#f3f4f8',
  fontFamily: 'inherit',
  fontSize: 12,
};

const checkLabel = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  color: 'rgba(243,244,248,0.72)',
  fontSize: 12,
};

const slotPanel = {
  padding: 8,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 10,
};

const slotHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8,
};

const assetGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 6,
};

const assetCard = (active: boolean) => ({
  display: 'grid',
  gridTemplateColumns: '58px minmax(0, 1fr)',
  alignItems: 'center',
  gap: 8,
  minHeight: 70,
  padding: 6,
  borderRadius: 10,
  border: active ? '1px solid #7bd3a7' : '1px solid rgba(255,255,255,0.10)',
  background: active ? 'rgba(123,211,167,0.14)' : 'rgba(255,255,255,0.035)',
  color: '#f3f4f8',
  cursor: 'pointer',
  fontFamily: 'inherit',
  textAlign: 'left' as const,
});

const assetName = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
  fontSize: 12,
  fontWeight: 600,
};

const emptyText = {
  gridColumn: '1 / -1',
  padding: '10px 8px',
  color: 'rgba(243,244,248,0.45)',
  fontSize: 12,
};
