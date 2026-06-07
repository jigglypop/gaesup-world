import type { CharacterMenuPreset } from './types';
import { MENU_PRESETS } from './types';

const STORAGE_KEY = 'gaesup:character-menu-presets';

export function saveCustomPreset(preset: CharacterMenuPreset): void {
  const stored = loadCustomPresets();
  stored[preset.id] = preset;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

export function loadCustomPresets(): Record<string, CharacterMenuPreset> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function deleteCustomPreset(presetId: string): void {
  const stored = loadCustomPresets();
  delete stored[presetId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

export function getAllPresets(
  customPresets?: Record<string, CharacterMenuPreset>,
): Record<string, CharacterMenuPreset> {
  return {
    ...MENU_PRESETS,
    ...loadCustomPresets(),
    ...customPresets,
  };
}

export function createCustomPreset(
  id: string,
  name: string,
  base: CharacterMenuPreset,
): CharacterMenuPreset {
  return {
    ...base,
    id,
    name,
  };
}

export function createPresetFromCurrentState(
  id: string,
  name: string,
  overrides: Partial<CharacterMenuPreset>,
): CharacterMenuPreset {
  return {
    ...MENU_PRESETS.default,
    ...overrides,
    id,
    name,
  };
}
