import { useCharacterStore } from './stores/characterStore';
import type { AppearanceColors, FaceStyle, HairStyle, OutfitSlot } from './types';

export type CharacterEquipmentPreset = {
  id: string;
  label: string;
  face?: FaceStyle;
  hair?: HairStyle;
  colors?: Partial<AppearanceColors>;
  outfits?: Partial<Record<OutfitSlot, string | null>>;
};

export const DEFAULT_CHARACTER_EQUIPMENT_PRESETS: CharacterEquipmentPreset[] = [
  {
    id: 'starter-adventurer',
    label: '모험가',
    face: 'smile',
    hair: 'cap',
    outfits: {
      hat: 'ally-hat',
      top: 'warrior-cloth-basic',
      bottom: 'starter-bottom-layer',
      shoes: 'starter-shoes-layer',
      glasses: 'ally-glasses',
      weapon: 'starter-weapon-layer',
      accessory: 'starter-accessory-ring',
    },
  },
  {
    id: 'rabbit-warrior',
    label: '토끼 전사',
    face: 'wink',
    hair: 'spiky',
    outfits: {
      top: 'warrior-cloth-rabbit',
      bottom: 'starter-bottom-layer',
      shoes: 'starter-shoes-layer',
      weapon: 'starter-weapon-layer',
    },
  },
];

export function applyCharacterEquipmentPreset(preset: CharacterEquipmentPreset): void {
  const store = useCharacterStore.getState();
  if (preset.face) store.setFace(preset.face);
  if (preset.hair) store.setHair(preset.hair);
  if (preset.colors) {
    Object.entries(preset.colors).forEach(([key, value]) => {
      if (value) store.setColor(key as keyof AppearanceColors, value);
    });
  }
  if (preset.outfits) {
    Object.entries(preset.outfits).forEach(([slot, itemId]) => {
      store.equipOutfit(slot as OutfitSlot, itemId ?? null);
    });
  }
}

export function toggleCharacterWeapon(itemId = 'starter-weapon-layer'): void {
  const store = useCharacterStore.getState();
  store.equipOutfit('weapon', store.outfits.weapon === itemId ? null : itemId);
}
