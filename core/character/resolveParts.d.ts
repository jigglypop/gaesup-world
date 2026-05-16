import type { AssetRecord } from '../assets';
import type { OutfitSlot } from './types';
import type { Part } from '../motions/entities/types';
type CharacterPartRecord = Record<string, AssetRecord | undefined>;
export type ResolveCharacterPartsInput = {
    baseParts?: Part[];
    outfits: Record<OutfitSlot, string | null>;
    assets: CharacterPartRecord;
};
export declare function resolveCharacterParts({ baseParts, outfits, assets, }: ResolveCharacterPartsInput): Part[];
export {};
