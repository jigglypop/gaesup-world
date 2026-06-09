import type {
  ActionEquipmentPanelClassNameSlot,
  ActionEquipmentPanelFeatures,
  ActionEquipmentPanelLabels,
} from './types';
import type { FaceStyle } from '../../types';

export const ACTION_EQUIPMENT_PANEL_DEFAULT_FACE_SEQUENCE: FaceStyle[] = [
  'default',
  'smile',
  'wink',
  'surprised',
  'sleepy',
];
export const ACTION_EQUIPMENT_PANEL_DEFAULT_SLOT_COUNT = 8;
export const ACTION_EQUIPMENT_PANEL_DEFAULT_FEATURES: Required<ActionEquipmentPanelFeatures> = {
  header: true,
  meta: true,
  faceCycle: true,
  weaponToggle: true,
  presets: true,
  reset: true,
};
export const ACTION_EQUIPMENT_PANEL_DEFAULT_LABELS: ActionEquipmentPanelLabels = {
  title: 'Action Equipment',
  face: 'Face',
  equipWeapon: 'Equip weapon',
  unequipWeapon: 'Unequip weapon',
  reset: 'Reset',
  emptyPresets: 'No presets',
};
export const ACTION_EQUIPMENT_PANEL_DEFAULT_FACE_LABELS: Record<FaceStyle, string> = {
  default: 'Default',
  smile: 'Smile',
  wink: 'Wink',
  surprised: 'Surprised',
  sleepy: 'Sleepy',
};
export const ACTION_EQUIPMENT_PANEL_DEFAULT_CLASSES: Record<
  ActionEquipmentPanelClassNameSlot,
  string
> = {
  root: 'action-equipment-panel',
  header: 'action-equipment-panel-header',
  title: 'action-equipment-panel-title',
  meta: 'action-equipment-panel-meta',
  actionRow: 'action-equipment-panel-row action-equipment-panel-row--actions',
  presetRow: 'action-equipment-panel-row action-equipment-panel-row--presets',
  button: 'action-equipment-panel-button',
  activeButton: 'action-equipment-panel-button--active',
  faceButton: 'action-equipment-panel-button--face',
  weaponButton: 'action-equipment-panel-button--weapon',
  presetButton: 'action-equipment-panel-button--preset',
  resetButton: 'action-equipment-panel-button--reset',
  emptyPresets: 'action-equipment-panel-empty',
};
