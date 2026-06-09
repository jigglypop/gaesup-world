import { MENU_PRESETS } from './config';
import type { CharacterMenuPreset } from './types';

const STORAGE_KEY = 'gaesup:character-menu-presets';

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export function saveCustomPreset(preset: CharacterMenuPreset): void {
  const storage = getLocalStorage();
  if (!storage) return;
  const stored = loadCustomPresets();
  stored[preset.id] = preset;
  storage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

export function loadCustomPresets(): Record<string, CharacterMenuPreset> {
  try {
    const storage = getLocalStorage();
    if (!storage) return {};
    const data = storage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function deleteCustomPreset(presetId: string): void {
  const storage = getLocalStorage();
  if (!storage) return;
  const stored = loadCustomPresets();
  delete stored[presetId];
  storage.setItem(STORAGE_KEY, JSON.stringify(stored));
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
