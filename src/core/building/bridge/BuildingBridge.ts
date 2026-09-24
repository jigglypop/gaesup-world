import { reportError } from '@/core/utils/reportError';

import { Position3D, Rotation3D, WallConfig, TileConfig, MeshConfig } from '../types';

type LegacyPosition = [number, number, number];
type LegacyRotation = [number, number, number];

type LegacyWall = {
  id?: string;
  position: LegacyPosition;
  rotation: LegacyRotation;
  wall_parent_id?: string;
};

type LegacyTile = {
  id?: string;
  position: LegacyPosition;
  tile_parent_id?: string;
};

type LegacyMesh = {
  id?: string;
  color?: string;
  material?: string;
  map_texture_url?: string;
  normal_texture_url?: string;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  transparent?: boolean;
};

/** Legacy converters return undefined for malformed input instead of throwing; the failure is still reported. */
function convertLegacy<T>(label: string, convert: () => T): T {
  try {
    return convert();
  } catch (error) {
    reportError(error, { source: 'building-bridge', label });
    return undefined as T;
  }
}

/** @deprecated Legacy array-format adapters with no internal callers; scheduled for removal in 2.0 (PRD 24). */
export class BuildingBridge {
  static convertLegacyPosition(position: LegacyPosition): Position3D {
    return convertLegacy('convertLegacyPosition', () => ({ x: position[0], y: position[1], z: position[2] }));
  }

  static convertLegacyRotation(rotation: LegacyRotation): Rotation3D {
    return convertLegacy('convertLegacyRotation', () => ({ x: rotation[0], y: rotation[1], z: rotation[2] }));
  }

  static convertToLegacyPosition(position: Position3D): LegacyPosition {
    return convertLegacy('convertToLegacyPosition', () => [position.x, position.y, position.z]);
  }

  static convertToLegacyRotation(rotation: Rotation3D): LegacyRotation {
    return convertLegacy('convertToLegacyRotation', () => [rotation.x, rotation.y, rotation.z]);
  }

  static convertLegacyWall(legacyWall: LegacyWall): WallConfig {
    return convertLegacy('convertLegacyWall', () => ({
      id: legacyWall.id || `wall-${Date.now()}`,
      position: this.convertLegacyPosition(legacyWall.position),
      rotation: this.convertLegacyRotation(legacyWall.rotation),
      wallGroupId: legacyWall.wall_parent_id || 'default',
      width: 4,
      height: 4,
      depth: 0.5,
    }));
  }

  static convertLegacyTile(legacyTile: LegacyTile): TileConfig {
    return convertLegacy('convertLegacyTile', () => ({
      id: legacyTile.id || `tile-${Date.now()}`,
      position: this.convertLegacyPosition(legacyTile.position),
      tileGroupId: legacyTile.tile_parent_id || 'default',
      size: 4,
    }));
  }

  static convertLegacyMesh(legacyMesh: LegacyMesh): MeshConfig {
    return convertLegacy('convertLegacyMesh', () => {
      const mesh: MeshConfig = {
        id: legacyMesh.id || `mesh-${Date.now()}`,
        color: legacyMesh.color || '#ffffff',
        material: legacyMesh.material === 'GLASS' ? 'GLASS' : 'STANDARD',
        roughness: legacyMesh.roughness ?? 0.5,
        metalness: legacyMesh.metalness ?? 0,
        opacity: legacyMesh.opacity ?? 1,
        transparent: legacyMesh.transparent ?? false,
      };
      if (legacyMesh.map_texture_url) {
        mesh.mapTextureUrl = legacyMesh.map_texture_url;
      }
      if (legacyMesh.normal_texture_url) {
        mesh.normalTextureUrl = legacyMesh.normal_texture_url;
      }
      return mesh;
    });
  }
}
