import {
  CHARACTER_MENU_DEFAULT_FEATURES,
  CHARACTER_MENU_DEFAULT_SECTIONS,
  CHARACTER_MENU_DEFAULT_SLOTS,
} from './defaults';
import type { CharacterMenuPreset, CharacterMenuTheme } from './types';

const BASE_THEME: CharacterMenuTheme = {
  bgColor: 'rgba(18, 20, 28, 0.94)',
  borderColor: 'rgba(255, 255, 255, 0.16)',
  textColor: '#f3f4f8',
  accentColor: '#7adf90',
  mutedTextColor: 'rgba(243, 244, 248, 0.64)',
  surfaceColor: 'rgba(255, 255, 255, 0.07)',
  blurEffect: true,
};
export const MENU_PRESETS = {
  default: {
    id: 'default',
    name: 'Default',
    layout: 'modal',
    position: {},
    theme: BASE_THEME,
    features: { ...CHARACTER_MENU_DEFAULT_FEATURES },
    sections: CHARACTER_MENU_DEFAULT_SECTIONS,
    slots: CHARACTER_MENU_DEFAULT_SLOTS,
    compact: false,
  },
  compact: {
    id: 'compact',
    name: 'Compact',
    layout: 'sidebar-right',
    position: {
      top: 16,
      right: 16,
      width: 360,
      maxHeight: 'calc(100vh - 32px)',
    },
    theme: {
      ...BASE_THEME,
      bgColor: 'rgba(14, 17, 24, 0.96)',
    },
    features: {
      ...CHARACTER_MENU_DEFAULT_FEATURES,
      previewRotate: false,
      colorPicker: false,
      savePresets: false,
      tagFilter: false,
    },
    sections: ['preview', 'identity', 'outfits'],
    slots: ['hat', 'top', 'bottom', 'shoes', 'weapon'],
    compact: true,
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    layout: 'floating',
    position: {
      right: 16,
      bottom: 16,
      width: 320,
    },
    theme: {
      ...BASE_THEME,
      bgColor: 'rgba(24, 27, 36, 0.9)',
      accentColor: '#ffd84a',
      blurEffect: false,
    },
    features: {
      ...CHARACTER_MENU_DEFAULT_FEATURES,
      closeUpMode: false,
      assetBrowser: false,
      tagFilter: false,
      ownedOnly: false,
      clearSlot: false,
    },
    sections: ['preview', 'identity', 'colors'],
    slots: ['hat', 'top'],
    compact: true,
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    layout: 'modal',
    position: {
      width: 'min(1040px, calc(100vw - 32px))',
    },
    theme: {
      ...BASE_THEME,
      bgColor: 'rgba(16, 20, 32, 0.95)',
      accentColor: '#72d6ff',
      surfaceColor: 'rgba(114, 214, 255, 0.08)',
    },
    features: { ...CHARACTER_MENU_DEFAULT_FEATURES, savePresets: true },
    sections: CHARACTER_MENU_DEFAULT_SECTIONS,
    slots: CHARACTER_MENU_DEFAULT_SLOTS,
    compact: false,
  },
} satisfies Record<string, CharacterMenuPreset>;
