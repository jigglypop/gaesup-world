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
  title: '캐릭터 메뉴',
  close: '닫기',
  reset: '초기화',
  preview: '미리보기',
  zoom: '확대',
  rotate: '회전',
  rotateLeft: '왼쪽 회전',
  rotateRight: '오른쪽 회전',
  closeUp: '클로즈업',
  exitCloseUp: '클로즈업 해제',
  name: '이름',
  hair: '헤어',
  face: '표정',
  colors: '색상',
  outfits: '의상',
  tagFilter: '태그 필터',
  ownedOnly: '보유만',
  clearSlot: '비우기',
  emptyAssets: '에셋 없음',
};
export const CHARACTER_MENU_DEFAULT_LABEL_MAPS: CharacterMenuLabelMaps = {
  colors: {
    body: '피부',
    hair: '머리카락',
    hat: '모자',
    top: '상의',
    bottom: '하의',
    shoes: '신발',
  },
  hair: {
    short: '짧은 머리',
    long: '긴 머리',
    cap: '캡',
    bun: '올림머리',
    spiky: '뾰족 머리',
  },
  face: {
    default: '기본',
    smile: '미소',
    wink: '윙크',
    sleepy: '졸림',
    surprised: '놀람',
  },
  slots: {
    hat: '모자',
    top: '상의',
    bottom: '하의',
    shoes: '신발',
    face: '표정',
    glasses: '안경',
    weapon: '무기',
    accessory: '액세서리',
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
