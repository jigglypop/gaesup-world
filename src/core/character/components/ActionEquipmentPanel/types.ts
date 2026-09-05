import type { CSSProperties, ReactNode } from 'react';

import type { CharacterEquipmentPreset } from '../../actionEquipment';
import type { FaceStyle, OutfitSlot } from '../../types';

export type ActionEquipmentPanelClassNameSlot =
  | 'root'
  | 'header'
  | 'title'
  | 'meta'
  | 'actionRow'
  | 'presetRow'
  | 'button'
  | 'activeButton'
  | 'faceButton'
  | 'weaponButton'
  | 'presetButton'
  | 'resetButton'
  | 'emptyPresets';
export type ActionEquipmentPanelClassNames = Partial<
  Record<ActionEquipmentPanelClassNameSlot, string>
>;
export type ActionEquipmentPanelStyles = Partial<
  Record<ActionEquipmentPanelClassNameSlot, CSSProperties>
>;
export type ActionEquipmentPanelLabels = {
  title: string;
  face: string;
  equipWeapon: string;
  unequipWeapon: string;
  reset: string;
  emptyPresets: string;
};
export type ActionEquipmentPanelLabelMaps = {
  face?: Partial<Record<FaceStyle, string>>;
};
export type ActionEquipmentPanelFeatures = {
  header?: boolean;
  meta?: boolean;
  faceCycle?: boolean;
  weaponToggle?: boolean;
  presets?: boolean;
  reset?: boolean;
};
export type ActionEquipmentPanelActions = {
  cycleFace: () => void;
  toggleWeapon: () => void;
  applyPreset: (preset: CharacterEquipmentPreset) => void;
  reset: () => void;
};
export type ActionEquipmentPanelRenderContext = {
  face: FaceStyle;
  faceLabel: string;
  faceButtonLabel: ReactNode;
  weaponButtonLabel: ReactNode;
  metaLabel: ReactNode;
  outfits: Record<OutfitSlot, string | null>;
  equippedCount: number;
  outfitSlotCount: number;
  weaponItemId: string;
  weaponEquipped: boolean;
  presets: readonly CharacterEquipmentPreset[];
  faceSequence: readonly FaceStyle[];
  labels: ActionEquipmentPanelLabels;
  faceLabels: Record<FaceStyle, string>;
  features: Required<ActionEquipmentPanelFeatures>;
  classNameFor: (slot: ActionEquipmentPanelClassNameSlot, extra?: string) => string;
  styleFor: (slot: ActionEquipmentPanelClassNameSlot, base?: CSSProperties) => CSSProperties;
  actions: ActionEquipmentPanelActions;
};
export type ActionEquipmentPanelRenderers = {
  root?: (context: ActionEquipmentPanelRenderContext, children: ReactNode) => ReactNode;
  header?: (context: ActionEquipmentPanelRenderContext) => ReactNode;
  actionRow?: (context: ActionEquipmentPanelRenderContext, children: ReactNode) => ReactNode;
  presetRow?: (context: ActionEquipmentPanelRenderContext, children: ReactNode) => ReactNode;
  faceButton?: (context: ActionEquipmentPanelRenderContext) => ReactNode;
  weaponButton?: (context: ActionEquipmentPanelRenderContext) => ReactNode;
  presetButton?: (
    context: ActionEquipmentPanelRenderContext,
    preset: CharacterEquipmentPreset,
  ) => ReactNode;
  resetButton?: (context: ActionEquipmentPanelRenderContext) => ReactNode;
  emptyPresets?: (context: ActionEquipmentPanelRenderContext) => ReactNode;
};
export type ActionEquipmentPanelProps = {
  presets?: readonly CharacterEquipmentPreset[];
  weaponItemId?: string;
  outfitSlotCount?: number;
  faceSequence?: readonly FaceStyle[];
  className?: string;
  style?: CSSProperties;
  classNames?: ActionEquipmentPanelClassNames;
  styles?: ActionEquipmentPanelStyles;
  labels?: Partial<ActionEquipmentPanelLabels>;
  labelMaps?: ActionEquipmentPanelLabelMaps;
  features?: ActionEquipmentPanelFeatures;
  renderers?: ActionEquipmentPanelRenderers;
  formatFaceLabel?: (face: FaceStyle, label: string) => ReactNode;
  formatWeaponLabel?: (weaponEquipped: boolean, labels: ActionEquipmentPanelLabels) => ReactNode;
  formatMetaLabel?: (equippedCount: number, outfitSlotCount: number) => ReactNode;
  children?: ReactNode;
};
