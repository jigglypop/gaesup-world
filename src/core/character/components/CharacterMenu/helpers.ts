import type { CSSProperties } from 'react';

import {
  CHARACTER_MENU_DEFAULT_FEATURES,
  CHARACTER_MENU_DEFAULT_LABEL_MAPS,
  CHARACTER_MENU_DEFAULT_SECTIONS,
  CHARACTER_MENU_DEFAULT_SLOTS,
  MENU_PRESETS,
} from './config';
import { getAllPresets } from './presetManager';
import type {
  CharacterMenuClassNameSlot,
  CharacterMenuFeatures,
  CharacterMenuLabelMaps,
  CharacterMenuPreset,
  CharacterMenuProps,
  CharacterMenuSection,
  CharacterMenuStyles,
} from './types';
import type { AssetRecord } from '../../../assets';
import type { OutfitSlot } from '../../types';

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}
export function mergeFeatures(
  preset: CharacterMenuPreset,
  overrides?: CharacterMenuFeatures,
): Required<CharacterMenuFeatures> {
  return {
    ...CHARACTER_MENU_DEFAULT_FEATURES,
    ...preset.features,
    ...overrides,
  };
}
export function mergeStyles(
  slot: CharacterMenuClassNameSlot,
  preset: CharacterMenuPreset,
  overrides?: CharacterMenuStyles,
  base?: CSSProperties,
): CSSProperties {
  return {
    ...base,
    ...preset.styles?.[slot],
    ...overrides?.[slot],
  };
}
export function resolvePreset(
  presetInput: CharacterMenuProps['preset'],
  customPresets: CharacterMenuProps['customPresets'],
): CharacterMenuPreset {
  if (typeof presetInput === 'object' && presetInput) return presetInput;
  const presets = getAllPresets(customPresets);
  return presets[presetInput ?? 'default'] ?? MENU_PRESETS.default;
}
export function mergeLabelMaps(
  overrides?: CharacterMenuProps['labelMaps'],
): CharacterMenuLabelMaps {
  return {
    colors: { ...CHARACTER_MENU_DEFAULT_LABEL_MAPS.colors, ...overrides?.colors },
    hair: { ...CHARACTER_MENU_DEFAULT_LABEL_MAPS.hair, ...overrides?.hair },
    face: { ...CHARACTER_MENU_DEFAULT_LABEL_MAPS.face, ...overrides?.face },
    slots: { ...CHARACTER_MENU_DEFAULT_LABEL_MAPS.slots, ...overrides?.slots },
  };
}
export function filterSections(
  sections: CharacterMenuSection[],
  hidden: CharacterMenuSection[] | undefined,
  features: Required<CharacterMenuFeatures>,
): CharacterMenuSection[] {
  return sections.filter((section) => {
    if (hidden?.includes(section)) return false;
    if (section === 'colors') return features.colorPicker;
    if (section === 'outfits') return features.assetBrowser;
    if (section === 'identity') return features.nameEditor || features.hairPicker || features.facePicker;
    return true;
  });
}
export function resolveSections(
  sections: CharacterMenuSection[] | undefined,
  preset: CharacterMenuPreset,
  hiddenSections: CharacterMenuSection[] | undefined,
  features: Required<CharacterMenuFeatures>,
): CharacterMenuSection[] {
  return filterSections(sections ?? preset.sections ?? CHARACTER_MENU_DEFAULT_SECTIONS, hiddenSections, features);
}
export function resolveSlots(
  slots: OutfitSlot[] | undefined,
  preset: CharacterMenuPreset,
  hiddenSlots: OutfitSlot[] | undefined,
): OutfitSlot[] {
  const rawSlots = slots ?? preset.slots ?? CHARACTER_MENU_DEFAULT_SLOTS;
  return rawSlots.filter((slot) => !hiddenSlots?.includes(slot));
}
export function matchesSlot(asset: AssetRecord, slot: OutfitSlot): boolean {
  if (slot === 'weapon') return asset.kind === 'weapon' || asset.slot === 'weapon';
  return asset.slot === slot && (asset.kind === 'characterPart' || asset.kind === 'weapon');
}
export function isOwnedAsset(asset: AssetRecord): boolean {
  const owned = asset.metadata?.['owned'];
  return owned === undefined || owned === true;
}
export function getAssetInitial(asset: AssetRecord): string {
  return asset.name.trim().charAt(0).toUpperCase() || '?';
}
