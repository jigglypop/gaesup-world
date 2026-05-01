import React, { FC, useMemo, useState } from 'react';

import {
  AssetPreviewCanvas,
  type AssetRecord,
  useAssetStore,
} from '../../../../assets';
import { useCharacterStore } from '../../../../character/stores/characterStore';
import {
  OUTFIT_SLOT_LABEL,
  type OutfitSlot,
} from '../../../../character/types';
import type { EditorPanelBaseProps } from '../types';
import './styles.css';

const SLOTS: OutfitSlot[] = ['hat', 'top', 'bottom', 'shoes', 'face', 'weapon', 'accessory'];

const matchesSlot = (asset: AssetRecord, slot: OutfitSlot) => {
  if (slot === 'weapon') return asset.kind === 'weapon' || asset.slot === 'weapon';
  return asset.slot === slot && (asset.kind === 'characterPart' || asset.kind === 'weapon');
};

export const CharacterAssetPanel: FC<EditorPanelBaseProps> = ({ className = '', style, children }) => {
  const outfits = useCharacterStore((state) => state.outfits);
  const equipOutfit = useCharacterStore((state) => state.equipOutfit);
  const resetAppearance = useCharacterStore((state) => state.resetAppearance);
  const assetIds = useAssetStore((state) => state.ids);
  const assetRecords = useAssetStore((state) => state.records);
  const isLoading = useAssetStore((state) => state.isLoading);
  const error = useAssetStore((state) => state.error);
  const [selectedSlot, setSelectedSlot] = useState<OutfitSlot>('top');
  const [tagFilter, setTagFilter] = useState('');
  const [ownedOnly, setOwnedOnly] = useState(false);

  const slotAssets = useMemo(() => {
    const normalizedTag = tagFilter.trim().toLowerCase();
    return assetIds
      .map((id) => assetRecords[id])
      .filter((asset): asset is AssetRecord => Boolean(asset))
      .filter((asset) => matchesSlot(asset, selectedSlot))
      .filter((asset) => {
        if (!normalizedTag) return true;
        return asset.tags?.some((tag) => tag.toLowerCase().includes(normalizedTag)) ?? false;
      })
      .filter((asset) => !ownedOnly || asset.metadata?.['owned'] !== false);
  }, [assetIds, assetRecords, ownedOnly, selectedSlot, tagFilter]);

  return (
    <div className={`character-asset-panel ${className}`} style={style}>
      <section className="character-asset-panel__section">
        <div className="character-asset-panel__header">
          <span className="character-asset-panel__section-title">캐릭터 에셋</span>
          <button
            className="character-asset-panel__ghost-btn"
            onClick={resetAppearance}
            type="button"
          >
            초기화
          </button>
        </div>

        <div className="character-asset-panel__slot-grid">
          {SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              className={`character-asset-panel__slot-btn ${selectedSlot === slot ? 'character-asset-panel__slot-btn--active' : ''}`}
              onClick={() => setSelectedSlot(slot)}
            >
              <span>{OUTFIT_SLOT_LABEL[slot]}</span>
              <small>{outfits[slot] ?? '비어있음'}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="character-asset-panel__section">
        <div className="character-asset-panel__filters">
          <input
            value={tagFilter}
            onChange={(event) => setTagFilter(event.target.value)}
            placeholder="태그 검색"
            className="character-asset-panel__input"
          />
          <label className="character-asset-panel__check">
            <input
              type="checkbox"
              checked={ownedOnly}
              onChange={(event) => setOwnedOnly(event.target.checked)}
            />
            보유만
          </label>
        </div>

        {error && <p className="character-asset-panel__notice">{error}</p>}
        {isLoading && <p className="character-asset-panel__notice">에셋 로딩 중</p>}

        <div className="character-asset-panel__asset-list">
          <button
            type="button"
            className={`character-asset-panel__asset-card ${outfits[selectedSlot] === null ? 'character-asset-panel__asset-card--active' : ''}`}
            onClick={() => equipOutfit(selectedSlot, null)}
          >
            <div className="character-asset-panel__empty-preview" />
            <span>비우기</span>
          </button>

          {slotAssets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className={`character-asset-panel__asset-card ${outfits[selectedSlot] === asset.id ? 'character-asset-panel__asset-card--active' : ''}`}
              onClick={() => equipOutfit(selectedSlot, asset.id)}
            >
              <AssetPreviewCanvas asset={asset} size={58} />
              <span>{asset.name}</span>
            </button>
          ))}

          {slotAssets.length === 0 && (
            <p className="character-asset-panel__notice">선택한 슬롯에 사용할 에셋이 없습니다.</p>
          )}
        </div>
      </section>
      {children}
    </div>
  );
};
