export const AVATAR_SLOTS = [
  'body',
  'face',
  'hair',
  'top',
  'bottom',
  'onepiece',
  'shoes',
  'hat',
  'ear',
  'back',
  'bag',
  'hand',
  'faceAccessory',
  'neckAccessory',
] as const;
export type AvatarSlot = (typeof AVATAR_SLOTS)[number];
export type EquipmentSlot = Exclude<AvatarSlot, 'body'>;
export const BODY_REGIONS = [
  'head',
  'neck',
  'torsoUpper',
  'torsoLower',
  'armUpperL',
  'armLowerL',
  'handL',
  'armUpperR',
  'armLowerR',
  'handR',
  'legUpperL',
  'legLowerL',
  'footL',
  'legUpperR',
  'legLowerR',
  'footR',
] as const;
export type BodyRegion = (typeof BODY_REGIONS)[number];
export const HUMANOID_BONES = [
  'root',
  'hips',
  'spine',
  'chest',
  'upperChest',
  'neck',
  'head',
  'shoulderL',
  'upperArmL',
  'lowerArmL',
  'handL',
  'shoulderR',
  'upperArmR',
  'lowerArmR',
  'handR',
  'upperLegL',
  'lowerLegL',
  'footL',
  'toeL',
  'upperLegR',
  'lowerLegR',
  'footR',
  'toeR',
] as const;
export type HumanoidBone = (typeof HUMANOID_BONES)[number];
export type AvatarRigId = 'gaesup-humanoid-v1';
export type AvatarSocket = 'head' | 'face' | 'handL' | 'handR' | 'back' | 'waist' | 'chest';
export type AvatarTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};
export type AvatarAttachment =
  | { mode: 'skinned' }
  | { mode: 'bone'; bone: HumanoidBone; transform?: AvatarTransform }
  | { mode: 'socket'; socket: AvatarSocket; transform?: AvatarTransform };
/** Stable glTF indices, resolved through GLTFParser associations; never mesh names. */
export type AvatarMeshReference = { node: number; primitive: number };
export type AvatarManifest = {
  schemaVersion: 1;
  assetId: string;
  version: number;
  kind: 'avatar-body' | 'avatar-part' | 'avatar-animation';
  slot: AvatarSlot;
  rig: AvatarRigId;
  bodyArchetypes: string[];
  source: { uri: string };
  meshes: AvatarMeshReference[];
  bones: Record<HumanoidBone, number>;
  attachment: AvatarAttachment;
  bodyRegions?: Partial<Record<BodyRegion, AvatarMeshReference[]>>;
  hideBodyRegions?: BodyRegion[];
  conflictsWith?: EquipmentSlot[];
  requires?: EquipmentSlot[];
  lods?: {
    level: number;
    source: { uri: string };
    meshes: AvatarMeshReference[];
    bones: Record<HumanoidBone, number>;
    bodyRegions?: Partial<Record<BodyRegion, AvatarMeshReference[]>>;
  }[];
  tags?: string[];
};
export type AvatarEquipmentState = Partial<Record<EquipmentSlot, string>>;
export type AvatarState = { body: string; equipment: AvatarEquipmentState };
export class AvatarCompatibilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AvatarCompatibilityError';
  }
}
