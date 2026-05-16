import type { AssetRecord } from './types';
import type { MeshConfig } from '../building/types';
export declare function assetToMeshConfig(asset: AssetRecord): Partial<MeshConfig>;
export declare function createScopedBuildingMeshId(scopeId: string, surface: string, assetId: string): string;
export declare function createScopedAssetMeshConfig(id: string, asset: AssetRecord, base?: MeshConfig): MeshConfig;
