import type { AssetRecord } from '../assets';
import type { OutfitSlot } from './types';
import type { Part } from '../motions/entities/types';

type CharacterPartRecord = Record<string, AssetRecord | undefined>;

export type ResolveCharacterPartsInput = {
  baseParts?: Part[];
  outfits: Record<OutfitSlot, string | null>;
  assets: CharacterPartRecord;
};

const isRenderableAsset = (asset: AssetRecord | undefined): asset is AssetRecord & { url: string } => {
  if (!asset?.url) return false;
  return asset.kind === 'characterPart' || asset.kind === 'weapon';
};

const assetToPart = (asset: AssetRecord & { url: string }): Part => ({
  id: asset.id,
  ...(asset.slot ? { slot: asset.slot } : {}),
  url: asset.url,
  ...(asset.colors?.primary ? { color: asset.colors.primary } : {}),
});

export function resolveCharacterParts({
  baseParts = [],
  outfits,
  assets,
}: ResolveCharacterPartsInput): Part[] {
  const equippedParts = Object.values(outfits)
    .map((assetId) => (assetId ? assets[assetId] : undefined))
    .filter(isRenderableAsset)
    .map(assetToPart);

  if (equippedParts.length === 0) {
    return baseParts.map((part) => ({ ...part }));
  }

  const equippedSlots = new Set(equippedParts.map((part) => part.slot).filter(Boolean));
  const mergedParts = baseParts
    .filter((part) => !part.slot || !equippedSlots.has(part.slot))
    .map((part) => ({ ...part }));

  for (const part of equippedParts) {
    if (!mergedParts.some((existing) => existing.url === part.url && existing.slot === part.slot)) {
      mergedParts.push(part);
    }
  }

  return mergedParts;
}
