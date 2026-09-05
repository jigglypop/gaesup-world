import {
  assetToMeshConfig,
  createScopedAssetMeshConfig,
  createScopedBuildingMeshId,
} from '../building';
import type { AssetRecord } from '../types';

describe('assetToMeshConfig', () => {
  it('maps building asset fields to mesh updates', () => {
    const asset: AssetRecord = {
      id: 'glass',
      name: 'Glass',
      kind: 'material',
      url: 'glass.png',
      colors: { primary: '#99ddff' },
      metadata: {
        material: 'GLASS',
        textureUrl: 'glass.png',
        normalTextureUrl: 'normal.png',
        roughness: 0.1,
        opacity: 0.45,
        transparent: true,
      },
    };

    expect(assetToMeshConfig(asset)).toEqual({
      assetId: 'glass',
      color: '#99ddff',
      material: 'GLASS',
      textureUrl: 'glass.png',
      mapTextureUrl: 'glass.png',
      normalTextureUrl: 'normal.png',
      roughness: 0.1,
      opacity: 0.45,
      transparent: true,
      materialParams: {
        color: '#99ddff',
        mapTextureUrl: 'glass.png',
        normalTextureUrl: 'normal.png',
        roughness: 0.1,
        opacity: 0.45,
        transparent: true,
      },
    });
  });

  it('does not treat generic asset url as a building texture', () => {
    const asset: AssetRecord = {
      id: 'wall',
      name: 'Wall',
      kind: 'wall',
      url: 'preview-or-model.png',
      colors: { primary: '#b8795f' },
      metadata: {
        material: 'STANDARD',
      },
    };

    expect(assetToMeshConfig(asset)).toEqual({
      assetId: 'wall',
      color: '#b8795f',
      material: 'STANDARD',
      materialParams: {
        color: '#b8795f',
      },
    });
  });

  it('creates scoped mesh ids and configs without mutating shared source ids', () => {
    const asset: AssetRecord = {
      id: 'tile-warm-wood',
      name: 'Warm Wood',
      kind: 'tile',
      colors: { primary: '#8b5a35' },
    };
    const id = createScopedBuildingMeshId('oak-floor', 'floor', asset.id);

    expect(id).toBe('asset-oak-floor-floor-tile-warm-wood');
    expect(createScopedAssetMeshConfig(id, asset, {
      id: 'wood-floor',
      color: '#111111',
      roughness: 0.9,
    })).toEqual({
      id,
      assetId: 'tile-warm-wood',
      color: '#8b5a35',
      roughness: 0.9,
      materialParams: {
        color: '#8b5a35',
      },
    });
  });
});
