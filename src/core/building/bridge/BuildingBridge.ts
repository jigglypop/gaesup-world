import { Position3D, Rotation3D, WallConfig, TileConfig, MeshConfig } from '../types';

export class BuildingBridge {
  static convertLegacyPosition(position: [number, number, number]): Position3D {
    return { x: position[0], y: position[1], z: position[2] };
  }

  static convertLegacyRotation(rotation: [number, number, number]): Rotation3D {
    return { x: rotation[0], y: rotation[1], z: rotation[2] };
  }

  static convertToLegacyPosition(position: Position3D): [number, number, number] {
    return [position.x, position.y, position.z];
  }

  static convertToLegacyRotation(rotation: Rotation3D): [number, number, number] {
    return [rotation.x, rotation.y, rotation.z];
  }

  static convertLegacyWall(legacyWall: any): WallConfig {
    return {
      id: legacyWall.id || `wall-${Date.now()}`,
      position: this.convertLegacyPosition(legacyWall.position),
      rotation: this.convertLegacyRotation(legacyWall.rotation),
      wallGroupId: legacyWall.wall_parent_id || 'default',
      width: 4,
      height: 4,
      depth: 0.5,
    };
  }

  static convertLegacyTile(legacyTile: any): TileConfig {
    return {
      id: legacyTile.id || `tile-${Date.now()}`,
      position: this.convertLegacyPosition(legacyTile.position),
      tileGroupId: legacyTile.tile_parent_id || 'default',
      size: 4,
    };
  }

  static convertLegacyMesh(legacyMesh: any): MeshConfig {
    return {
      id: legacyMesh.id || `mesh-${Date.now()}`,
      color: legacyMesh.color || '#ffffff',
      material: legacyMesh.material === 'GLASS' ? 'GLASS' : 'STANDARD',
      mapTextureUrl: legacyMesh.map_texture_url,
      normalTextureUrl: legacyMesh.normal_texture_url,
      roughness: legacyMesh.roughness || 0.5,
      metalness: legacyMesh.metalness || 0,
      opacity: legacyMesh.opacity || 1,
      transparent: legacyMesh.transparent || false,
    };
  }
} 