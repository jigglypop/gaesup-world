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

export { CharacterMenu } from './components/CharacterMenu';
export type { CharacterMenuProps } from './components/CharacterMenu';

export { OutfitAvatar } from './components/OutfitAvatar';
export type { OutfitAvatarProps } from './components/OutfitAvatar';
export { ActionEquipmentPanel } from './components/ActionEquipmentPanel';
export type { ActionEquipmentPanelProps } from './components/ActionEquipmentPanel';
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
