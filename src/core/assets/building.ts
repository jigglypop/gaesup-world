import type { AssetRecord } from './types';
import type { MeshConfig } from '../building/types';

const sanitizeId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '-');

const stringMeta = (asset: AssetRecord, key: string): string | undefined => {
  const value = asset.metadata?.[key];
  return typeof value === 'string' ? value : undefined;
};

const numberMeta = (asset: AssetRecord, key: string): number | undefined => {
  const value = asset.metadata?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
};

const booleanMeta = (asset: AssetRecord, key: string): boolean | undefined => {
  const value = asset.metadata?.[key];
  return typeof value === 'boolean' ? value : undefined;
};

export function assetToMeshConfig(asset: AssetRecord): Partial<MeshConfig> {
  const textureUrl = stringMeta(asset, 'textureUrl');
  const normalTextureUrl = stringMeta(asset, 'normalTextureUrl');
  const material = stringMeta(asset, 'material');
  const roughness = numberMeta(asset, 'roughness');
  const metalness = numberMeta(asset, 'metalness');
  const opacity = numberMeta(asset, 'opacity');
  const transparent = booleanMeta(asset, 'transparent');

  return {
    assetId: asset.id,
    ...(asset.colors?.primary ? { color: asset.colors.primary } : {}),
    ...(material === 'GLASS' || material === 'METAL' || material === 'STANDARD' ? { material } : {}),
    ...(textureUrl ? { textureUrl, mapTextureUrl: textureUrl } : {}),
    ...(normalTextureUrl ? { normalTextureUrl } : {}),
    ...(roughness !== undefined ? { roughness } : {}),
    ...(metalness !== undefined ? { metalness } : {}),
    ...(opacity !== undefined ? { opacity } : {}),
    ...(transparent !== undefined ? { transparent } : {}),
    materialParams: {
      ...(asset.colors?.primary ? { color: asset.colors.primary } : {}),
      ...(textureUrl ? { mapTextureUrl: textureUrl } : {}),
      ...(normalTextureUrl ? { normalTextureUrl } : {}),
      ...(roughness !== undefined ? { roughness } : {}),
      ...(metalness !== undefined ? { metalness } : {}),
      ...(opacity !== undefined ? { opacity } : {}),
      ...(transparent !== undefined ? { transparent } : {}),
    },
  };
}

export function createScopedBuildingMeshId(scopeId: string, surface: string, assetId: string): string {
  return `asset-${sanitizeId(scopeId)}-${sanitizeId(surface)}-${sanitizeId(assetId)}`;
}

export function createScopedAssetMeshConfig(
  id: string,
  asset: AssetRecord,
  base?: MeshConfig,
): MeshConfig {
  return {
    ...(base ?? {}),
    ...assetToMeshConfig(asset),
    id,
  };
}
