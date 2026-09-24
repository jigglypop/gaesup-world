import type { AssetKind, AssetSlot } from '../types';

export type AssetBudgetProfile = {
  id: 'mobile' | 'desktop';
  policyVersion: 1;
  fps: number;
  triangles: number;
  mainDrawCalls: number;
  totalDrawCalls: number;
  textureBytes: number;
  renderPixels: number;
  initialTransferBytes: number;
};

export type AssetArtifact = {
  path: string;
  sha256: string;
  bytes: number;
};

/** Generation/authoring contract. Legacy outfit saves still use AssetSlot. */
export type CharacterPartSpecification = {
  schemaVersion: 1;
  role: 'base' | 'part';
  slot: AssetSlot | 'eyes' | 'eyebrows' | 'mouth';
  bodyProfile: string;
  deformation: 'skinned' | 'rigid';
  variant?: 'pants' | 'skirt';
  attachmentSocket?: string;
  meshes: string[];
  hideBodyRegions: string[];
  colorChannels: { id: string; materials: string[] }[];
  morphControls: { id: string; target: string; min: number; max: number; default: number }[];
};

export type AssetManifest = {
  schemaVersion: 1;
  id: string;
  version: string;
  name: string;
  kind: AssetKind;
  slot?: AssetSlot;
  source: { author: string; license: string; sourcePath: string; generator: string };
  artifacts: AssetArtifact[];
  bounds: { min: [number, number, number]; max: [number, number, number] };
  lods: {
    level: 0 | 1 | 2;
    path: string;
    fallbackPath?: string;
    triangles: number;
    minScreenPixels: number;
  }[];
  materials: { name: string; alphaMode: 'OPAQUE' | 'MASK' | 'BLEND'; texturePaths: string[] }[];
  colliders: { type: 'box'; center: [number, number, number]; size: [number, number, number] }[];
  sockets: { name: string; bone?: string; position: [number, number, number] }[];
  rig?: { id: string; bindPoseHash: string; joints: string[]; clips: Record<string, string> };
  character?: CharacterPartSpecification;
};

export type AssetEvidence = {
  subject: string;
  decision: 'approved' | 'rejected';
  reviewer: string;
  recordedAt: string;
  evidence: string[];
};

export type AssetBrowserEvidence = AssetEvidence & {
  device: 'android' | 'iphone' | 'integrated-gpu';
  model: string;
  os: string;
  browser: string;
  backend: 'webgpu' | 'webgl';
  profile: AssetBudgetProfile['id'];
  policyVersion: 1;
  sceneVersion: string;
  metrics: Omit<AssetBudgetProfile, 'id' | 'policyVersion'>;
  durationMinutes: number;
  roomTransitions: number;
  outfitSwaps: number;
  contextRecovery: boolean;
};

export type AssetQualityReport = {
  provenance?: AssetEvidence;
  technical?: AssetEvidence;
  art?: AssetEvidence;
  browser: AssetBrowserEvidence[];
};

export type ProductionAsset = { manifest: AssetManifest; quality: AssetQualityReport };
