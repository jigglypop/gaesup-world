import type { CSSProperties, ReactNode } from 'react';

import type { AssetRecord } from '../../../assets';
import type { Appearance, AppearanceColors, FaceStyle, HairStyle, OutfitSlot } from '../../types';

export type CharacterPreviewMode = 'normal' | 'closeUp';
export type CharacterMenuLayout = 'modal' | 'sidebar-left' | 'sidebar-right' | 'floating';
export type CharacterMenuSection = 'preview' | 'identity' | 'colors' | 'outfits';
export type CharacterMenuTheme = {
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  blurEffect?: boolean;
  mutedTextColor?: string;
  surfaceColor?: string;
};
export type CharacterMenuFeatures = {
  zoomControl?: boolean;
  closeUpMode?: boolean;
  previewRotate?: boolean;
  colorPicker?: boolean;
  assetBrowser?: boolean;
  savePresets?: boolean;
  nameEditor?: boolean;
  hairPicker?: boolean;
  facePicker?: boolean;
  tagFilter?: boolean;
  ownedOnly?: boolean;
  clearSlot?: boolean;
  resetButton?: boolean;
  closeButton?: boolean;
};
export type CharacterMenuClassNameSlot =
  | 'root'
  | 'backdrop'
  | 'panel'
  | 'header'
  | 'title'
  | 'actions'
  | 'iconButton'
  | 'primaryButton'
  | 'ghostButton'
  | 'body'
  | 'previewSection'
  | 'previewFrame'
  | 'previewGlyph'
  | 'previewControls'
  | 'previewControlGroup'
  | 'controls'
  | 'section'
  | 'sectionStack'
  | 'sectionTitle'
  | 'input'
  | 'optionRow'
  | 'chip'
  | 'activeChip'
  | 'colorGrid'
  | 'colorRow'
  | 'colorLabel'
  | 'colorInput'
  | 'filterRow'
  | 'filterLabel'
  | 'checkbox'
  | 'range'
  | 'slotList'
  | 'slot'
  | 'slotHeader'
  | 'slotTitle'
  | 'assetGrid'
  | 'assetButton'
  | 'activeAssetButton'
  | 'assetImage'
  | 'assetInitial'
  | 'assetName'
  | 'emptyState'
  | 'closeUpOverlay'
  | 'footer';
export type CharacterMenuClassNames = Partial<Record<CharacterMenuClassNameSlot, string>>;
export type CharacterMenuStyles = Partial<Record<CharacterMenuClassNameSlot, CSSProperties>>;
export type CharacterMenuLabels = {
  title: string;
  close: string;
  reset: string;
  preview: string;
  zoom: string;
  rotate: string;
  rotateLeft: string;
  rotateRight: string;
  closeUp: string;
  exitCloseUp: string;
  name: string;
  hair: string;
  face: string;
  colors: string;
  outfits: string;
  tagFilter: string;
  ownedOnly: string;
  clearSlot: string;
  emptyAssets: string;
};
export type CharacterMenuLabelMaps = {
  colors: Record<keyof AppearanceColors, string>;
  hair: Record<HairStyle, string>;
  face: Record<FaceStyle, string>;
  slots: Record<OutfitSlot, string>;
};
export type CharacterMenuOption<TValue extends string> = {
  value: TValue;
  label: string;
};
export type CharacterMenuPreset = {
  id: string;
  name: string;
  layout: CharacterMenuLayout;
  position?: CSSProperties;
  theme: CharacterMenuTheme;
  features: CharacterMenuFeatures;
  sections?: CharacterMenuSection[];
  slots?: OutfitSlot[];
  compact?: boolean;
  classNames?: CharacterMenuClassNames;
  styles?: CharacterMenuStyles;
};
export type CharacterMenuAssetFilterInput = {
  asset: AssetRecord;
  slot: OutfitSlot;
  tagFilter: string;
  ownedOnly: boolean;
  selectedAssetId: string | null;
};
export type CharacterMenuCloseUpController = {
  request: () => void;
  restore: () => void;
};
export type CharacterMenuActions = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  reset: () => void;
  setName: (name: string) => void;
  setColor: (key: keyof AppearanceColors, value: string) => void;
  setHair: (hair: HairStyle) => void;
  setFace: (face: FaceStyle) => void;
  equipOutfit: (slot: OutfitSlot, assetId: string | null) => void;
  setZoom: (zoom: number) => void;
  setRotation: (rotation: number) => void;
  rotatePreview: (delta: number) => void;
  setTagFilter: (value: string) => void;
  setOwnedOnly: (value: boolean) => void;
  toggleCloseUp: () => void;
};
export type CharacterMenuRenderContext = {
  isOpen: boolean;
  controlled: boolean;
  isCloseUp: boolean;
  previewMode: CharacterPreviewMode;
  zoom: number;
  rotation: number;
  tagFilter: string;
  ownedOnly: boolean;
  compact: boolean;
  bodyColumns: string;
  preset: CharacterMenuPreset;
  features: Required<CharacterMenuFeatures>;
  labels: CharacterMenuLabels;
  labelMaps: CharacterMenuLabelMaps;
  selectedSections: CharacterMenuSection[];
  rightSections: CharacterMenuSection[];
  selectedSlots: OutfitSlot[];
  colorOptions: Array<CharacterMenuOption<keyof AppearanceColors>>;
  hairOptions: Array<CharacterMenuOption<HairStyle>>;
  faceOptions: Array<CharacterMenuOption<FaceStyle>>;
  appearance: Appearance;
  outfits: Record<OutfitSlot, string | null>;
  assetsBySlot: Partial<Record<OutfitSlot, AssetRecord[]>>;
  rootClassName: string | undefined;
  classNameFor: (slot: CharacterMenuClassNameSlot, extra?: string) => string;
  styleFor: (slot: CharacterMenuClassNameSlot, base?: CSSProperties) => CSSProperties;
  getButtonStyle: (active?: boolean) => CSSProperties;
  getPanelStyle: () => CSSProperties;
  getSectionStyle: () => CSSProperties;
  getPreviewGlyphStyle: () => CSSProperties;
  getAssetInitial: (asset: AssetRecord) => string;
  actions: CharacterMenuActions;
};
export type CharacterMenuRenderers = {
  root?: (context: CharacterMenuRenderContext, children: ReactNode) => ReactNode;
  backdrop?: (context: CharacterMenuRenderContext) => ReactNode;
  panel?: (context: CharacterMenuRenderContext, children: ReactNode) => ReactNode;
  header?: (context: CharacterMenuRenderContext) => ReactNode;
  preview?: (context: CharacterMenuRenderContext) => ReactNode;
  identity?: (context: CharacterMenuRenderContext) => ReactNode;
  colors?: (context: CharacterMenuRenderContext) => ReactNode;
  outfits?: (context: CharacterMenuRenderContext) => ReactNode;
  outfitSlot?: (
    context: CharacterMenuRenderContext,
    slot: OutfitSlot,
    assets: AssetRecord[],
  ) => ReactNode;
  assetButton?: (
    context: CharacterMenuRenderContext,
    slot: OutfitSlot,
    asset: AssetRecord,
    active: boolean,
  ) => ReactNode;
  emptyAssets?: (context: CharacterMenuRenderContext, slot: OutfitSlot) => ReactNode;
  footer?: (context: CharacterMenuRenderContext, children: ReactNode) => ReactNode;
  closeUpOverlay?: (context: CharacterMenuRenderContext) => ReactNode;
};
export type CharacterMenuProps = {
  toggleKey?: string;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  preset?: string | CharacterMenuPreset;
  customPresets?: Record<string, CharacterMenuPreset>;
  sections?: CharacterMenuSection[];
  hiddenSections?: CharacterMenuSection[];
  slots?: OutfitSlot[];
  hiddenSlots?: OutfitSlot[];
  features?: CharacterMenuFeatures;
  className?: string;
  classNames?: CharacterMenuClassNames;
  styles?: CharacterMenuStyles;
  labels?: Partial<CharacterMenuLabels>;
  labelMaps?: {
    colors?: Partial<Record<keyof AppearanceColors, string>>;
    hair?: Partial<Record<HairStyle, string>>;
    face?: Partial<Record<FaceStyle, string>>;
    slots?: Partial<Record<OutfitSlot, string>>;
  };
  colorOptions?: Array<CharacterMenuOption<keyof AppearanceColors>>;
  hairOptions?: Array<CharacterMenuOption<HairStyle>>;
  faceOptions?: Array<CharacterMenuOption<FaceStyle>>;
  ownedOnlyDefault?: boolean;
  tagFilterDefault?: string;
  renderers?: CharacterMenuRenderers;
  assetFilter?: (input: CharacterMenuAssetFilterInput) => boolean;
  assetSort?: (left: AssetRecord, right: AssetRecord, slot: OutfitSlot) => number;
  isAssetOwned?: (asset: AssetRecord) => boolean;
  closeUpController?: CharacterMenuCloseUpController;
  children?: ReactNode;
};
