import type { AssetDependencyGraph, AssetReference } from './types';
import type { SceneJsonValue, SceneObject } from '../../scene-object/types';

const ASSET_KEYS = new Set(['assetId', 'modelAssetId', 'textureAssetId', 'audioAssetId', 'materialId']);
const MAX_SCAN_DEPTH = 8;

function scanValue(
  value: SceneJsonValue,
  path: string,
  depth: number,
  visit: (assetId: string, path: string) => void,
): void {
  if (depth > MAX_SCAN_DEPTH || value === null || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanValue(entry, `${path}[${index}]`, depth + 1, visit));
    return;
  }
  for (const [key, entry] of Object.entries(value)) {
    const entryPath = path ? `${path}.${key}` : key;
    if (ASSET_KEYS.has(key) && typeof entry === 'string' && entry.trim()) {
      visit(entry, entryPath);
      continue;
    }
    if (entry !== undefined) scanValue(entry, entryPath, depth + 1, visit);
  }
}

export function collectAssetReferences(ownerId: string, objects: readonly SceneObject[]): AssetReference[] {
  const references: AssetReference[] = [];
  for (const object of objects) {
    for (const component of object.components) {
      scanValue(component.data, '', 0, (assetId, path) => {
        references.push({ assetId, ownerId, objectId: object.id, componentId: component.id, path });
      });
    }
  }
  return references;
}

export function buildAssetDependencyGraph(
  owners: ReadonlyArray<{ id: string; objects: readonly SceneObject[] }>,
): AssetDependencyGraph {
  const references = owners.flatMap((owner) => collectAssetReferences(owner.id, owner.objects));
  const usersByAsset = new Map<string, Set<string>>();
  const assetsByOwner = new Map<string, Set<string>>();
  for (const reference of references) {
    const users = usersByAsset.get(reference.assetId) ?? new Set<string>();
    users.add(reference.ownerId);
    usersByAsset.set(reference.assetId, users);
    const assets = assetsByOwner.get(reference.ownerId) ?? new Set<string>();
    assets.add(reference.assetId);
    assetsByOwner.set(reference.ownerId, assets);
  }
  return { references, usersByAsset, assetsByOwner };
}

export function findMissingAssetReferences(
  references: readonly AssetReference[],
  knownAssetIds: ReadonlySet<string> | ((assetId: string) => boolean),
): AssetReference[] {
  const isKnown = typeof knownAssetIds === 'function' ? knownAssetIds : (assetId: string) => knownAssetIds.has(assetId);
  return references.filter((reference) => !isKnown(reference.assetId));
}
