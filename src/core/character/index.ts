export * from './types';
export {
  characterPlugin,
  createCharacterPlugin,
  hydrateCharacterState,
  serializeCharacterState,
} from './plugin';
export type { CharacterPluginOptions } from './plugin';
export { useCharacterStore } from './stores/characterStore';
export { CharacterCreator } from './components/CharacterCreator';
export type { CharacterCreatorProps } from './components/CharacterCreator';

export { CharacterMenu, useCharacterMenuController } from './components/CharacterMenu';
export {
  CHARACTER_MENU_DEFAULT_FEATURES,
  CHARACTER_MENU_DEFAULT_SECTIONS,
  CHARACTER_MENU_DEFAULT_SLOTS,
  MENU_PRESETS,
} from './components/CharacterMenu';
export type {
  CharacterMenuClassNameSlot,
  CharacterMenuCloseUpController,
  CharacterMenuFeatures,
  CharacterMenuLabelMaps,
  CharacterMenuLabels,
  CharacterMenuOption,
  CharacterMenuPreset,
  CharacterMenuProps,
  CharacterMenuRenderContext,
  CharacterMenuRenderers,
  CharacterMenuSection,
  CharacterMenuStyles,
  CharacterPreviewMode,
} from './components/CharacterMenu';

export { OutfitAvatar } from './components/OutfitAvatar';
export type { OutfitAvatarProps } from './components/OutfitAvatar';
export {
  ACTION_EQUIPMENT_PANEL_DEFAULT_CLASSES,
  ACTION_EQUIPMENT_PANEL_DEFAULT_FACE_LABELS,
  ACTION_EQUIPMENT_PANEL_DEFAULT_FACE_SEQUENCE,
  ACTION_EQUIPMENT_PANEL_DEFAULT_FEATURES,
  ACTION_EQUIPMENT_PANEL_DEFAULT_LABELS,
  ACTION_EQUIPMENT_PANEL_DEFAULT_SLOT_COUNT,
  ActionEquipmentPanel,
} from './components/ActionEquipmentPanel';
export type {
  ActionEquipmentPanelActions,
  ActionEquipmentPanelClassNameSlot,
  ActionEquipmentPanelClassNames,
  ActionEquipmentPanelFeatures,
  ActionEquipmentPanelLabelMaps,
  ActionEquipmentPanelLabels,
  ActionEquipmentPanelProps,
  ActionEquipmentPanelRenderContext,
  ActionEquipmentPanelRenderers,
  ActionEquipmentPanelStyles,
} from './components/ActionEquipmentPanel';
export {
  DEFAULT_CHARACTER_EQUIPMENT_PRESETS,
  applyCharacterEquipmentPreset,
  toggleCharacterWeapon,
} from './actionEquipment';
export type { CharacterEquipmentPreset } from './actionEquipment';
export {
  DEFAULT_CHARACTER_ATTACHMENT_SOCKETS,
  resolveCharacterAttachment,
  resolveEquippedCharacterAttachments,
} from './attachments';
export type {
  CharacterAttachment,
  CharacterAttachmentSocket,
  CharacterAttachmentTransform,
  ResolveEquippedCharacterAttachmentsInput,
} from './attachments';
export { resolveCharacterBaseNodeExclusions, resolveCharacterParts } from './resolveParts';
export type { ResolveCharacterPartsInput } from './resolveParts';
