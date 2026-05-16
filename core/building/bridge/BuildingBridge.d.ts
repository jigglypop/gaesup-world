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
export declare class BuildingBridge {
    static convertLegacyPosition(position: LegacyPosition): Position3D;
    static convertLegacyRotation(rotation: LegacyRotation): Rotation3D;
    static convertToLegacyPosition(position: Position3D): LegacyPosition;
    static convertToLegacyRotation(rotation: Rotation3D): LegacyRotation;
    static convertLegacyWall(legacyWall: LegacyWall): WallConfig;
    static convertLegacyTile(legacyTile: LegacyTile): TileConfig;
    static convertLegacyMesh(legacyMesh: LegacyMesh): MeshConfig;
}
export {};
