import { FC, useMemo, useState } from 'react';

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

const SLOTS = Object.keys(OUTFIT_SLOT_LABEL) as OutfitSlot[];

const matchesSlot = (asset: AssetRecord, slot: OutfitSlot) => {
  if (slot === 'weapon') return asset.kind === 'weapon' || asset.slot === 'weapon';
  return asset.slot === slot && (asset.kind === 'characterPart' || asset.kind === 'weapon');
};

export const CharacterAssetPanel: FC<EditorPanelBaseProps> = ({ className = '', style, children }) => {
  const activeCharacterId = useCharacterStore((state) => state.activeCharacterId);
  const outfits = useCharacterStore((state) => state.outfits);
  const equipOutfit = useCharacterStore((state) => state.equipOutfit);
  const resetAppearance = useCharacterStore((state) => state.resetAppearance);
  const assetIds = useAssetStore((state) => state.ids);
  const assetRecords = useAssetStore((state) => state.records);
  const isLoading = useAssetStore((state) => state.isLoading);
  const error = useAssetStore((state) => state.error);
  const [selectedSlot, setSelectedSlot] = useState<OutfitSlot>('top');
  const [query, setQuery] = useState('');
  const [ownedOnly, setOwnedOnly] = useState(false);

  const slotAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return assetIds
      .map((id) => assetRecords[id])
      .filter((asset): asset is AssetRecord => Boolean(asset))
      .filter((asset) => matchesSlot(asset, selectedSlot))
      .filter((asset) => {
        if (!normalizedQuery) return true;
        return asset.name.toLowerCase().includes(normalizedQuery)
          || asset.id.toLowerCase().includes(normalizedQuery)
          || (asset.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ?? false);
      })
      .filter((asset) => !ownedOnly || asset.metadata?.['owned'] !== false);
  }, [assetIds, assetRecords, ownedOnly, selectedSlot, query]);

  return (
    <div className={`character-asset-panel ${className}`} style={style}>
      <section className="character-asset-panel__section">
        <div className="character-asset-panel__header">
          <span className="character-asset-panel__section-title">캐릭터 에셋</span>
          <button
            className="character-asset-panel__ghost-btn"
            onClick={() => resetAppearance(activeCharacterId)}
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
              aria-pressed={selectedSlot === slot}
              className={`character-asset-panel__slot-btn ${selectedSlot === slot ? 'character-asset-panel__slot-btn--active' : ''}`}
              onClick={() => setSelectedSlot(slot)}
            >
              <span>{OUTFIT_SLOT_LABEL[slot]}</span>
              <small>{outfits[slot] ? assetRecords[outfits[slot]]?.name ?? '에셋 정보 없음' : '비어 있음'}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="character-asset-panel__section">
        <div className="character-asset-panel__filters">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="이름 또는 태그 검색"
            aria-label="캐릭터 에셋 검색"
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

        {error && !isLoading && (
          <p className="character-asset-panel__notice" role="alert">
            새 에셋 목록을 불러오지 못했습니다. 현재 사용 가능한 에셋을 표시합니다.
          </p>
        )}
        {isLoading && <p className="character-asset-panel__notice" role="status">에셋을 불러오고 있습니다.</p>}

        <div className="character-asset-panel__asset-list">
          <button
            type="button"
            aria-pressed={outfits[selectedSlot] === null}
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
              aria-pressed={outfits[selectedSlot] === asset.id}
              className={`character-asset-panel__asset-card ${outfits[selectedSlot] === asset.id ? 'character-asset-panel__asset-card--active' : ''}`}
              onClick={() => equipOutfit(selectedSlot, asset.id)}
            >
              <AssetPreviewCanvas asset={asset} size={58} />
              <span>{asset.name}</span>
            </button>
          ))}

          {slotAssets.length === 0 && !isLoading && !error && (
            <p className="character-asset-panel__notice" role="status">
              {query.trim() || ownedOnly ? '검색 조건에 맞는 에셋이 없습니다.' : '선택한 부위에 사용할 에셋이 없습니다.'}
            </p>
          )}
        </div>
      </section>
      {children}
    </div>
  );
};
