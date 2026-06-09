import type {
  CharacterMenuFeatures,
  CharacterMenuLabelMaps,
  CharacterMenuLabels,
  CharacterMenuOption,
  CharacterMenuSection,
} from './types';
import type { AppearanceColors, FaceStyle, HairStyle, OutfitSlot } from '../../types';

export const CHARACTER_MENU_DEFAULT_SECTIONS: CharacterMenuSection[] = [
  'preview',
  'identity',
  'colors',
  'outfits',
];
export const CHARACTER_MENU_DEFAULT_SLOTS: OutfitSlot[] = [
  'hat',
  'top',
  'bottom',
  'shoes',
  'face',
  'glasses',
  'weapon',
  'accessory',
];
export const CHARACTER_MENU_DEFAULT_FEATURES: Required<CharacterMenuFeatures> = {
  zoomControl: true,
  closeUpMode: true,
  previewRotate: true,
  colorPicker: true,
  assetBrowser: true,
  savePresets: false,
  nameEditor: true,
  hairPicker: true,
  facePicker: true,
  tagFilter: true,
  ownedOnly: true,
  clearSlot: true,
  resetButton: true,
  closeButton: true,
};
export const CHARACTER_MENU_ROTATION_STEP = 30;
export const CHARACTER_MENU_SLOT_SURFACE = 'rgba(0, 0, 0, 0.16)';
export const CHARACTER_MENU_DEFAULT_LABELS: CharacterMenuLabels = {
  title: 'Character Menu',
  close: 'Close',
  reset: 'Reset',
  preview: 'Preview',
  zoom: 'Zoom',
  rotate: 'Rotate',
  rotateLeft: 'Rotate left',
  rotateRight: 'Rotate right',
  closeUp: 'Close-up',
  exitCloseUp: 'Exit close-up',
  name: 'Name',
  hair: 'Hair',
  face: 'Face',
  colors: 'Colors',
  outfits: 'Outfits',
  tagFilter: 'Filter tag',
  ownedOnly: 'Owned only',
  clearSlot: 'Clear',
  emptyAssets: 'No assets',
};
export const CHARACTER_MENU_DEFAULT_LABEL_MAPS: CharacterMenuLabelMaps = {
  colors: {
    body: 'Body',
    hair: 'Hair',
    hat: 'Hat',
    top: 'Top',
    bottom: 'Bottom',
    shoes: 'Shoes',
  },
  hair: {
    short: 'Short',
    long: 'Long',
    cap: 'Cap',
    bun: 'Bun',
    spiky: 'Spiky',
  },
  face: {
    default: 'Default',
    smile: 'Smile',
    wink: 'Wink',
    sleepy: 'Sleepy',
    surprised: 'Surprised',
  },
  slots: {
    hat: 'Hat',
    top: 'Top',
    bottom: 'Bottom',
    shoes: 'Shoes',
    face: 'Face',
    glasses: 'Glasses',
    weapon: 'Weapon',
    accessory: 'Accessory',
  },
};
export const CHARACTER_MENU_DEFAULT_COLOR_OPTIONS: Array<
  CharacterMenuOption<keyof AppearanceColors>
> = [
  { value: 'body', label: CHARACTER_MENU_DEFAULT_LABEL_MAPS.colors.body },
  { value: 'hair', label: CHARACTER_MENU_DEFAULT_LABEL_MAPS.colors.hair },
  { value: 'hat', label: CHARACTER_MENU_DEFAULT_LABEL_MAPS.colors.hat },
  { value: 'top', label: CHARACTER_MENU_DEFAULT_LABEL_MAPS.colors.top },
  { value: 'bottom', label: CHARACTER_MENU_DEFAULT_LABEL_MAPS.colors.bottom },
  { value: 'shoes', label: CHARACTER_MENU_DEFAULT_LABEL_MAPS.colors.shoes },
];
export const CHARACTER_MENU_DEFAULT_HAIR_OPTIONS: Array<CharacterMenuOption<HairStyle>> = [
  { value: 'short', label: CHARACTER_MENU_DEFAULT_LABEL_MAPS.hair.short },
  { value: 'long', label: CHARACTER_MENU_DEFAULT_LABEL_MAPS.hair.long },
  { value: 'cap', label: CHARACTER_MENU_DEFAULT_LABEL_MAPS.hair.cap },
  { value: 'bun', label: CHARACTER_MENU_DEFAULT_LABEL_MAPS.hair.bun },
  { value: 'spiky', label: CHARACTER_MENU_DEFAULT_LABEL_MAPS.hair.spiky },
];
export const CHARACTER_MENU_DEFAULT_FACE_OPTIONS: Array<CharacterMenuOption<FaceStyle>> = [
  { value: 'default', label: CHARACTER_MENU_DEFAULT_LABEL_MAPS.face.default },
  { value: 'smile', label: CHARACTER_MENU_DEFAULT_LABEL_MAPS.face.smile },
  { value: 'wink', label: CHARACTER_MENU_DEFAULT_LABEL_MAPS.face.wink },
  { value: 'sleepy', label: CHARACTER_MENU_DEFAULT_LABEL_MAPS.face.sleepy },
  { value: 'surprised', label: CHARACTER_MENU_DEFAULT_LABEL_MAPS.face.surprised },
];
