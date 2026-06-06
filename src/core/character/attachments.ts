import type { AssetRecord } from '../assets';
import type { OutfitSlot } from './types';

export type CharacterAttachmentSocket =
  | 'head'
  | 'face'
  | 'chest'
  | 'hips'
  | 'leftFoot'
  | 'rightFoot'
  | 'leftHand'
  | 'rightHand'
  | 'back';

export type CharacterAttachmentTransform = {
  socket: CharacterAttachmentSocket;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
};

export type CharacterAttachment = CharacterAttachmentTransform & {
  assetId: string;
  assetName: string;
  slot: OutfitSlot;
  kind: AssetRecord['kind'];
};

export type ResolveEquippedCharacterAttachmentsInput = {
  outfits: Record<OutfitSlot, string | null>;
  assets: Record<string, AssetRecord | undefined>;
};

export const DEFAULT_CHARACTER_ATTACHMENT_SOCKETS: Record<OutfitSlot, CharacterAttachmentTransform> = {
  hat: { socket: 'head', position: [0, 0.18, 0], scale: [1, 1, 1] },
  top: { socket: 'chest', position: [0, -0.58, 0], scale: [1, 1, 1] },
  bottom: { socket: 'hips', position: [0, -0.82, 0], scale: [1, 1, 1] },
  shoes: { socket: 'leftFoot', position: [0, -1.12, 0.04], scale: [1, 1, 1] },
  face: { socket: 'face', position: [0, -0.18, 0.32], scale: [1, 1, 1] },
  glasses: { socket: 'face', position: [0, -0.08, 0.32], scale: [1, 1, 1] },
  weapon: { socket: 'rightHand', position: [0.48, -0.55, 0.02], rotation: [0, 0, -0.55], scale: [1, 1, 1] },
  accessory: { socket: 'face', position: [0.36, -0.08, 0.1], rotation: [Math.PI / 2, 0, 0], scale: [1, 1, 1] },
};

function isNumberTuple(value: unknown): value is [number, number, number] {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((entry) => typeof entry === 'number' && Number.isFinite(entry))
  );
}

function isAttachmentSocket(value: unknown): value is CharacterAttachmentSocket {
  return (
    value === 'head' ||
    value === 'face' ||
    value === 'chest' ||
    value === 'hips' ||
    value === 'leftFoot' ||
    value === 'rightFoot' ||
    value === 'leftHand' ||
    value === 'rightHand' ||
    value === 'back'
  );
}

function readAssetAttachment(asset: AssetRecord): Partial<CharacterAttachmentTransform> {
  const metadata = asset.metadata;
  if (!metadata || typeof metadata !== 'object') return {};
  const raw = metadata['attachment'];
  if (!raw || typeof raw !== 'object') return {};
  const attachment = raw as Record<string, unknown>;

  return {
    ...(isAttachmentSocket(attachment['socket']) ? { socket: attachment['socket'] } : {}),
    ...(isNumberTuple(attachment['position']) ? { position: attachment['position'] } : {}),
    ...(isNumberTuple(attachment['rotation']) ? { rotation: attachment['rotation'] } : {}),
    ...(isNumberTuple(attachment['scale']) ? { scale: attachment['scale'] } : {}),
  };
}

function cloneTransform(transform: CharacterAttachmentTransform): CharacterAttachmentTransform {
  return {
    socket: transform.socket,
    position: [...transform.position],
    ...(transform.rotation ? { rotation: [...transform.rotation] } : {}),
    ...(transform.scale ? { scale: [...transform.scale] } : {}),
  };
}

export function resolveCharacterAttachment(
  asset: AssetRecord,
  slot: OutfitSlot,
): CharacterAttachment {
  const base = cloneTransform(DEFAULT_CHARACTER_ATTACHMENT_SOCKETS[slot]);
  const override = readAssetAttachment(asset);
  const transform: CharacterAttachmentTransform = {
    ...base,
    ...override,
  };

  return {
    assetId: asset.id,
    assetName: asset.name,
    slot,
    kind: asset.kind,
    socket: transform.socket,
    position: [...transform.position],
    ...(transform.rotation ? { rotation: [...transform.rotation] } : {}),
    ...(transform.scale ? { scale: [...transform.scale] } : {}),
  };
}

export function resolveEquippedCharacterAttachments({
  outfits,
  assets,
}: ResolveEquippedCharacterAttachmentsInput): CharacterAttachment[] {
  return Object.entries(outfits).flatMap(([slot, assetId]) => {
    if (!assetId) return [];
    const asset = assets[assetId];
    if (!asset) return [];
    return [resolveCharacterAttachment(asset, slot as OutfitSlot)];
  });
}
