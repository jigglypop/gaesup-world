export type OutfitSlot = 'hat' | 'top' | 'bottom' | 'shoes' | 'face';

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

export type CharacterSerialized = {
  version: 1;
  appearance: Appearance;
  outfits: Record<OutfitSlot, string | null>;
};

export const DEFAULT_APPEARANCE: Appearance = {
  name: '플레이어',
  colors: {
    body: '#ffd9b8',
    hair: '#3a2a1a',
    hat: '#5a8acf',
    top: '#f0e0c8',
    bottom: '#3a4a6a',
    shoes: '#3a2a1a',
  },
  face: 'default',
  hair: 'short',
};

export const OUTFIT_SLOT_LABEL: Record<OutfitSlot, string> = {
  hat: '모자',
  top: '상의',
  bottom: '하의',
  shoes: '신발',
  face: '표정',
};

export const HAIR_STYLE_LABEL: Record<HairStyle, string> = {
  short: '단발',
  long: '긴머리',
  cap: '모자머리',
  bun: '쪽머리',
  spiky: '뻗친머리',
};

export const FACE_STYLE_LABEL: Record<FaceStyle, string> = {
  default: '기본',
  smile: '미소',
  wink: '윙크',
  sleepy: '졸림',
  surprised: '놀람',
};
