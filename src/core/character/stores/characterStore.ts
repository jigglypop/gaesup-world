import { create } from 'zustand';

import {
  DEFAULT_APPEARANCE,
  type Appearance,
  type AppearanceColors,
  type CharacterSerialized,
  type CharacterSerializedV1,
  type FaceStyle,
  type HairStyle,
  type OutfitSlot,
} from '../types';

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

const EMPTY_OUTFITS: Record<OutfitSlot, string | null> = {
  hat: null,
  top: null,
  bottom: null,
  shoes: null,
  face: null,
  weapon: null,
  accessory: null,
};

export const useCharacterStore = create<CharacterState>((set, get) => ({
  appearance: { ...DEFAULT_APPEARANCE, colors: { ...DEFAULT_APPEARANCE.colors } },
  outfits: { ...EMPTY_OUTFITS },

  setName: (name) =>
    set((s) => ({ appearance: { ...s.appearance, name: name.slice(0, 16) || '플레이어' } })),

  setColor: (key, value) =>
    set((s) => ({
      appearance: {
        ...s.appearance,
        colors: { ...s.appearance.colors, [key]: value },
      },
    })),

  setFace: (face) => set((s) => ({ appearance: { ...s.appearance, face } })),
  setHair: (hair) => set((s) => ({ appearance: { ...s.appearance, hair } })),

  equipOutfit: (slot, itemId) =>
    set((s) => ({ outfits: { ...s.outfits, [slot]: itemId } })),

  resetAppearance: () =>
    set({
      appearance: { ...DEFAULT_APPEARANCE, colors: { ...DEFAULT_APPEARANCE.colors } },
      outfits: { ...EMPTY_OUTFITS },
    }),

  getEquippedAssetIds: () =>
    Object.values(get().outfits).filter((id): id is string => typeof id === 'string' && id.length > 0),

  serialize: () => {
    const s = get();
    return {
      version: 2,
      appearance: {
        ...s.appearance,
        colors: { ...s.appearance.colors },
      },
      outfits: { ...s.outfits },
    };
  },

  hydrate: (data) => {
    if (!data || (data.version !== 1 && data.version !== 2)) return;
    set({
      appearance: {
        ...DEFAULT_APPEARANCE,
        ...data.appearance,
        colors: { ...DEFAULT_APPEARANCE.colors, ...data.appearance.colors },
      },
      outfits: { ...EMPTY_OUTFITS, ...data.outfits },
    });
  },
}));
