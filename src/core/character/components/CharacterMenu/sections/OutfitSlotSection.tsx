import { useMemo } from 'react';
import {
  AssetPreviewCanvas,
  type AssetRecord,
} from '../../../../assets';
import { OUTFIT_SLOT_LABEL } from '../../../types';
import type { OutfitSlot } from '../../../types';
import type { CharacterMenuPreset } from '../types';

type OutfitSlotSectionProps = {
  slots: OutfitSlot[];
  outfits: Record<OutfitSlot, string | null>;
  assetsBySlot: Record<OutfitSlot, AssetRecord[]>;
  onEquip: (slot: OutfitSlot, assetId: string | null) => void;
  tagFilter: string;
  onTagFilterChange: (filter: string) => void;
  ownedOnly: boolean;
  onOwnedOnlyChange: (owned: boolean) => void;
  preset: CharacterMenuPreset;
  compact?: boolean;
};

export function OutfitSlotSection({
  slots,
  outfits,
  assetsBySlot,
  onEquip,
  tagFilter,
  onTagFilterChange,
  ownedOnly,
  onOwnedOnlyChange,
  preset,
  compact,
}: OutfitSlotSectionProps) {
  const totalAssets = useMemo(
    () => Object.values(assetsBySlot).reduce((sum, arr) => sum + arr.length, 0),
    [assetsBySlot],
  );

  return (
    <div className="space-y-3">
      <div
        className="p-3 rounded-lg border"
        style={{
          background: 'rgba(0,0,0,0.2)',
          borderColor: preset.theme.borderColor,
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs font-bold uppercase opacity-60">🎽 장비 슬롯</p>
          <span
            className="text-xs px-2 py-1 rounded"
            style={{
              background: preset.theme.accentColor + '20',
              color: preset.theme.accentColor,
            }}
          >
            {totalAssets}개
          </span>
        </div>

        <div className="flex gap-2 flex-wrap mb-3">
          <input
            value={tagFilter}
            onChange={(e) => onTagFilterChange(e.target.value)}
            placeholder="태그 검색..."
            className="flex-1 min-w-32 px-2 py-1 rounded border text-xs"
            style={{
              background: 'rgba(255,255,255,0.06)',
              borderColor: preset.theme.borderColor,
              color: preset.theme.textColor,
            }}
          />
          <label className="flex items-center gap-2 text-xs px-2 py-1 rounded cursor-pointer"
            style={{
              background: ownedOnly ? preset.theme.accentColor + '20' : 'rgba(255,255,255,0.06)',
              borderColor: ownedOnly ? preset.theme.accentColor : preset.theme.borderColor,
              border: '1px solid',
              color: preset.theme.textColor,
            }}>
            <input
              type="checkbox"
              checked={ownedOnly}
              onChange={(e) => onOwnedOnlyChange(e.target.checked)}
              className="w-3 h-3"
            />
            보유만
          </label>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {slots.map((slot) => (
            <div key={slot}
              className="p-3 rounded-lg border"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderColor: preset.theme.borderColor,
              }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{OUTFIT_SLOT_LABEL[slot]}</span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: outfits[slot]
                        ? preset.theme.accentColor + '30'
                        : 'rgba(255,255,255,0.08)',
                      color: outfits[slot]
                        ? preset.theme.accentColor
                        : 'rgba(243,244,248,0.5)',
                    }}
                  >
                    {outfits[slot] ? '✓' : '비움'}
                  </span>
                  {outfits[slot] && (
                    <button
                      onClick={() => onEquip(slot, null)}
                      className="text-xs px-2 py-0.5 rounded border transition-colors hover:opacity-80"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        borderColor: preset.theme.borderColor,
                        color: preset.theme.textColor,
                      }}
                    >
                      비우기
                    </button>
                  )}
                </div>
              </div>

              {assetsBySlot[slot].length > 0 ? (
                <div className={compact ? 'flex flex-wrap gap-2' : 'grid gap-2'} style={{
                  gridTemplateColumns: compact ? undefined : 'repeat(auto-fill, minmax(60px, 1fr))',
                }}>
                  {assetsBySlot[slot].map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => onEquip(slot, asset.id)}
                      className="relative rounded-lg overflow-hidden transition-all hover:opacity-90"
                      style={{
                        border: '2px solid',
                        borderColor:
                          outfits[slot] === asset.id
                            ? preset.theme.accentColor
                            : preset.theme.borderColor,
                        background:
                          outfits[slot] === asset.id
                            ? preset.theme.accentColor + '20'
                            : 'rgba(255,255,255,0.04)',
                      }}
                      title={asset.name}
                    >
                      <div className="aspect-square p-1">
                        <AssetPreviewCanvas asset={asset} size={compact ? 48 : 56} />
                      </div>
                      {!compact && (
                        <div
                          className="text-xs font-semibold p-1 truncate"
                          style={{
                            background: 'rgba(0,0,0,0.4)',
                            color: preset.theme.textColor,
                          }}
                        >
                          {asset.name}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  className="text-center py-3 text-xs rounded"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(243,244,248,0.5)',
                  }}
                >
                  사용 가능한 에셋 없음
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
