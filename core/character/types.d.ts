export type OutfitSlot = 'hat' | 'top' | 'bottom' | 'shoes' | 'face' | 'weapon' | 'accessory';
export type LegacyOutfitSlot = Exclude<OutfitSlot, 'weapon' | 'accessory'>;
export type AppearanceColors = {
    body: string;
    hair: string;
    hat: string;
    top: string;
    bottom: string;
    shoes: string;
};
export type FaceStyle = 'default' | 'smile' | 'wink' | 'sleepy' | 'surprised';
export type HairStyle = 'short' | 'long' | 'cap' | 'bun' | 'spiky';
export type Appearance = {
    name: string;
    colors: AppearanceColors;
    face: FaceStyle;
    hair: HairStyle;
};
export type CharacterSerializedV1 = {
    version: 1;
    appearance: Appearance;
    outfits: Record<LegacyOutfitSlot, string | null>;
};
export type CharacterSerialized = {
    version: 2;
    appearance: Appearance;
    outfits: Record<OutfitSlot, string | null>;
};
export declare const DEFAULT_APPEARANCE: Appearance;
export declare const OUTFIT_SLOT_LABEL: Record<OutfitSlot, string>;
export declare const HAIR_STYLE_LABEL: Record<HairStyle, string>;
export declare const FACE_STYLE_LABEL: Record<FaceStyle, string>;
