import type { AssetQuery, AssetRecord, AssetSource } from '../types';
import type {
  AssetBudgetProfile,
  AssetEvidence,
  AssetManifest,
  AssetQualityReport,
  ProductionAsset,
} from './types';

export * from './types';

export const ASSET_BUDGET_PROFILES: Readonly<Record<'mobile' | 'desktop', AssetBudgetProfile>> = {
  mobile: {
    id: 'mobile',
    policyVersion: 1,
    fps: 30,
    triangles: 250000,
    mainDrawCalls: 120,
    totalDrawCalls: 220,
    textureBytes: 128 * 1024 ** 2,
    renderPixels: 1000000,
    initialTransferBytes: 6 * 1024 ** 2,
  },
  desktop: {
    id: 'desktop',
    policyVersion: 1,
    fps: 60,
    triangles: 500000,
    mainDrawCalls: 200,
    totalDrawCalls: 350,
    textureBytes: 256 * 1024 ** 2,
    renderPixels: 2100000,
    initialTransferBytes: 10 * 1024 ** 2,
  },
};

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .filter((key) => record[key] !== undefined)
      .map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

/** Exact canonical manifest identity, including every artifact hash and semantic field. */
export function assetApprovalSubject(manifest: AssetManifest): string {
  return canonical(manifest);
}

function inspectAssetManifest(manifest: AssetManifest): string[] {
  const errors: string[] = [];
  const finiteVector = (values: number[]) => values.length === 3 && values.every(Number.isFinite);
  if (!['characterPart', 'weapon', 'material', 'tile', 'wall', 'object3d'].includes(manifest.kind))
    errors.push('invalid-kind');
  if (
    manifest.slot &&
    ![
      'body',
      'hair',
      'hat',
      'top',
      'bottom',
      'shoes',
      'face',
      'weapon',
      'shield',
      'accessory',
      'glasses',
    ].includes(manifest.slot)
  )
    errors.push('invalid-slot');
  if (
    manifest.schemaVersion !== 1 ||
    !/^[a-z0-9][a-z0-9-]*$/.test(manifest.id) ||
    !/^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(manifest.version)
  )
    errors.push('invalid-identity');
  if (
    !manifest.name.trim() ||
    !manifest.source.author.trim() ||
    !manifest.source.license.trim() ||
    !manifest.source.sourcePath.trim() ||
    !manifest.source.generator.trim()
  )
    errors.push('missing-provenance');
  const paths = new Set<string>();
  for (const artifact of manifest.artifacts) {
    if (
      !/^[a-zA-Z0-9][a-zA-Z0-9_./-]*$/.test(artifact.path) ||
      artifact.path.split('/').some((part) => part === '..' || part === '.' || !part) ||
      paths.has(artifact.path)
    )
      errors.push('invalid-artifact-path');
    if (
      !/^[a-f0-9]{64}$/.test(artifact.sha256) ||
      !Number.isSafeInteger(artifact.bytes) ||
      artifact.bytes <= 0
    )
      errors.push('invalid-artifact-integrity');
    paths.add(artifact.path);
  }
  if (
    !manifest.artifacts.length ||
    manifest.lods.length !== 3 ||
    new Set(manifest.lods.map((lod) => lod.level)).size !== 3
  )
    errors.push('missing-lods');
  for (const lod of manifest.lods) {
    if (lod.fallbackPath && !paths.has(lod.fallbackPath)) errors.push('invalid-lod-fallback');
    if (
      ![0, 1, 2].includes(lod.level) ||
      !paths.has(lod.path) ||
      !Number.isSafeInteger(lod.triangles) ||
      lod.triangles <= 0 ||
      !Number.isFinite(lod.minScreenPixels) ||
      lod.minScreenPixels < 0
    )
      errors.push('invalid-lod');
  }
  if (
    !finiteVector(manifest.bounds.min) ||
    !finiteVector(manifest.bounds.max) ||
    manifest.bounds.min.some((v, i) => v >= manifest.bounds.max[i]!)
  )
    errors.push('invalid-bounds');
  for (const material of manifest.materials) {
    if (
      !['OPAQUE', 'MASK', 'BLEND'].includes(material.alphaMode) ||
      material.texturePaths.some((path) => !paths.has(path))
    )
      errors.push('invalid-material');
  }
  for (const collider of manifest.colliders) {
    if (
      collider.type !== 'box' ||
      !finiteVector(collider.center) ||
      !finiteVector(collider.size) ||
      collider.size.some((v) => v <= 0)
    )
      errors.push('invalid-collider');
  }
  for (const socket of manifest.sockets) {
    if (
      !socket.name.trim() ||
      !finiteVector(socket.position) ||
      (socket.bone && !manifest.rig?.joints.includes(socket.bone))
    )
      errors.push('invalid-socket');
  }
  if (
    manifest.rig &&
    (!manifest.rig.id ||
      !manifest.rig.bindPoseHash ||
      !manifest.rig.joints.length ||
      new Set(manifest.rig.joints).size !== manifest.rig.joints.length)
  )
    errors.push('invalid-rig');
  return errors;
}

export function validateAssetManifest(manifest: AssetManifest): string[] {
  try {
    return inspectAssetManifest(manifest);
  } catch {
    return ['invalid-manifest-schema'];
  }
}

function inspectPublication(manifest: AssetManifest, quality: AssetQualityReport): string[] {
  const blockers = validateAssetManifest(manifest);
  const subject = assetApprovalSubject(manifest);
  const approved = (evidence: AssetEvidence | undefined) =>
    evidence?.decision === 'approved' &&
    evidence.subject === subject &&
    Boolean(evidence.reviewer.trim()) &&
    Number.isFinite(Date.parse(evidence.recordedAt)) &&
    evidence.evidence.length > 0 &&
    evidence.evidence.every((value) => value.trim().length > 0);
  for (const gate of ['provenance', 'technical', 'art'] as const)
    if (!approved(quality[gate])) blockers.push(gate);
  for (const device of ['android', 'iphone', 'integrated-gpu'] as const) {
    const reports = quality.browser.filter((report) => report.device === device);
    const report = reports.at(-1);
    const expectedProfile = device === 'integrated-gpu' ? 'desktop' : 'mobile';
    const budget = ASSET_BUDGET_PROFILES[expectedProfile];
    if (
      !report ||
      !approved(report) ||
      report.profile !== expectedProfile ||
      report.policyVersion !== budget.policyVersion ||
      !report.model.trim() ||
      !report.os.trim() ||
      !report.browser.trim() ||
      !report.sceneVersion.trim() ||
      !['webgpu', 'webgl'].includes(report.backend) ||
      !Number.isFinite(report.durationMinutes) ||
      report.durationMinutes < 15 ||
      report.roomTransitions < 30 ||
      report.outfitSwaps < 100 ||
      !Number.isFinite(report.roomTransitions) ||
      !Number.isFinite(report.outfitSwaps) ||
      !report.contextRecovery ||
      Object.entries(report.metrics).length !== 7 ||
      (
        Object.keys(budget).filter(
          (key) => key !== 'id' && key !== 'policyVersion',
        ) as (keyof typeof report.metrics)[]
      ).some(
        (key) =>
          !Number.isFinite(report.metrics[key]) ||
          report.metrics[key] < 0 ||
          (key === 'fps' ? report.metrics[key] < budget[key] : report.metrics[key] > budget[key]),
      )
    )
      blockers.push(`browser:${device}`);
  }
  return blockers;
}

export function assetPublicationBlockers(
  manifest: AssetManifest,
  quality: AssetQualityReport,
): string[] {
  try {
    return inspectPublication(manifest, quality);
  } catch {
    return ['invalid-quality-schema'];
  }
}

export function assetManifestToRecord(manifest: AssetManifest, baseUrl: string): AssetRecord {
  const lod = manifest.lods.find((entry) => entry.level === 0);
  if (!lod || validateAssetManifest(manifest).length)
    throw new Error('Invalid production asset manifest');
  return {
    id: manifest.id,
    name: manifest.name,
    kind: manifest.kind,
    ...(manifest.slot ? { slot: manifest.slot } : {}),
    url: `${baseUrl.replace(/\/$/, '')}/${manifest.id}/${manifest.version}/${lod.path}`,
    metadata: {
      productionVersion: manifest.version,
      ...(manifest.rig
        ? { skeleton: manifest.rig.id, bindPoseHash: manifest.rig.bindPoseHash }
        : {}),
    },
  };
}

export class ManifestAssetSource implements AssetSource {
  private readonly records: AssetRecord[];
  constructor(entries: ProductionAsset[], baseUrl: string) {
    const ids = new Set<string>();
    this.records = entries
      .filter(({ manifest, quality }) => assetPublicationBlockers(manifest, quality).length === 0)
      .map(({ manifest }) => {
        if (ids.has(manifest.id)) throw new Error(`Duplicate published asset: ${manifest.id}`);
        ids.add(manifest.id);
        return assetManifestToRecord(manifest, baseUrl);
      });
  }
  async listAssets(query?: AssetQuery): Promise<AssetRecord[]> {
    return this.records
      .filter(
        (asset) =>
          (!query?.kind || asset.kind === query.kind) &&
          (!query?.slot || asset.slot === query.slot) &&
          (!query?.tag || asset.tags?.includes(query.tag)),
      )
      .map((asset) => ({ ...asset, metadata: { ...asset.metadata } }));
  }
  async getAsset(id: string): Promise<AssetRecord | undefined> {
    return (await this.listAssets()).find((asset) => asset.id === id);
  }
  listByKind(kind: AssetRecord['kind']): Promise<AssetRecord[]> {
    return this.listAssets({ kind });
  }
  listBySlot(slot: NonNullable<AssetRecord['slot']>): Promise<AssetRecord[]> {
    return this.listAssets({ slot });
  }
}
