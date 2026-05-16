import { type Appearance, type AppearanceColors, type CharacterSerialized, type CharacterSerializedV1, type FaceStyle, type HairStyle, type OutfitSlot } from '../types';
type CharacterState = {
    appearance: Appearance;
    outfits: Record<OutfitSlot, string | null>;
    setName: (name: string) => void;
    setColor: (key: keyof AppearanceColors, value: string) => void;
    setFace: (face: FaceStyle) => void;
    setHair: (hair: HairStyle) => void;
    equipOutfit: (slot: OutfitSlot, itemId: string | null) => void;
    resetAppearance: () => void;
    getEquippedAssetIds: () => string[];
    serialize: () => CharacterSerialized;
    hydrate: (data: CharacterSerialized | CharacterSerializedV1 | null | undefined) => void;
};
export declare const useCharacterStore: import("zustand").UseBoundStore<import("zustand").StoreApi<CharacterState>>;
export {};
