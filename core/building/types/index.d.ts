import type { CellCoord, EdgeCoord } from '../../grid';
export interface Position3D {
    x: number;
    y: number;
    z: number;
}
export interface Rotation3D {
    x: number;
    y: number;
    z: number;
}
export interface MeshConfig {
    id: string;
    assetId?: string;
    color?: string;
    material?: 'STANDARD' | 'GLASS' | 'METAL';
    textureUrl?: string;
    mapTextureUrl?: string;
    normalTextureUrl?: string;
    materialParams?: {
        color?: string;
        mapTextureUrl?: string;
        normalTextureUrl?: string;
        roughness?: number;
        metalness?: number;
        opacity?: number;
        transparent?: boolean;
    };
    roughness?: number;
    metalness?: number;
    opacity?: number;
    transparent?: boolean;
}
export type BuildingWallKind = 'solid' | 'window' | 'door' | 'arch' | 'half' | 'railing' | 'glass';
export type BuildingWallPreset = {
    id: string;
    categoryId: string;
    categoryName: string;
    labelEn: string;
    labelKo: string;
    exteriorColor: string;
    interiorColor: string;
    sideColor: string;
    defaultKind: BuildingWallKind;
    roughness?: number;
    metalness?: number;
};
export interface WallConfig {
    id: string;
    position: Position3D;
    rotation: Rotation3D;
    wallGroupId: string;
    materialId?: string;
    edge?: EdgeCoord;
    width?: number;
    height?: number;
    depth?: number;
    wallKind?: BuildingWallKind;
    flipSides?: boolean;
}
export interface WallGroupConfig {
    id: string;
    name: string;
    frontMeshId?: string;
    backMeshId?: string;
    sideMeshId?: string;
    defaultWallKind?: BuildingWallKind;
    walls: WallConfig[];
}
export type TileObjectType = 'water' | 'grass' | 'sand' | 'snowfield' | 'none';
export type BuildingTreeKind = 'sakura' | 'oak' | 'pine' | 'maple' | 'birch' | 'willow' | 'cypress' | 'dead';
export type PlacedObjectType = 'tree' | 'sakura' | 'flag' | 'fire' | 'billboard' | 'model';
export type TileShapeType = 'box' | 'stairs' | 'round' | 'ramp';
export type BuildingModelFallbackKind = 'door' | 'window' | 'fence' | 'lamp' | 'chair' | 'table' | 'bed' | 'storage' | 'mailbox' | 'crafting' | 'shop' | 'generic';
export interface ObjectConfig {
    size?: number;
    primaryColor?: string;
    secondaryColor?: string;
    treeKind?: BuildingTreeKind;
    flagTexture?: string;
    flagWidth?: number;
    flagHeight?: number;
    flagStyle?: FlagStyle;
    fireIntensity?: number;
    fireWidth?: number;
    fireHeight?: number;
    fireColor?: string;
    billboardText?: string;
    billboardImageUrl?: string;
    billboardColor?: string;
    billboardWidth?: number;
    billboardHeight?: number;
    billboardScale?: number;
    billboardOffsetY?: number;
    billboardElevation?: number;
    billboardIntensity?: number;
    modelId?: string;
    modelLabel?: string;
    modelUrl?: string;
    modelScale?: number;
    modelColor?: string;
    modelFallbackKind?: BuildingModelFallbackKind;
}
export interface PlacedObject {
    id: string;
    type: PlacedObjectType;
    position: Position3D;
    rotation?: number;
    config?: ObjectConfig;
}
export interface BillboardConfig {
    id: string;
    position: Position3D;
    width: number;
    height: number;
    rotation?: Partial<Rotation3D>;
    text?: string;
    imageUrl?: string;
    color?: string;
}
export interface BloomConfig {
    id: string;
    position: Position3D;
    intensity?: number;
    color?: string;
}
export interface TileConfig {
    id: string;
    position: Position3D;
    tileGroupId: string;
    materialId?: string;
    cell?: CellCoord;
    footprint?: CellCoord[];
    size?: number;
    rotation?: number;
    shape?: TileShapeType;
    objectType?: TileObjectType;
    objectConfig?: {
        /** Blades per square meter. The mesh layer multiplies this by tile area. */
        grassDensity?: number;
        waterScale?: number;
        terrainColor?: string;
        terrainAccentColor?: string;
    };
}
export interface BuildingBlockConfig {
    id: string;
    position: Position3D;
    cell?: CellCoord;
    size?: {
        x?: number;
        y?: number;
        z?: number;
    };
    materialId?: string;
    tags?: string[];
}
export interface BuildingSerializedState {
    version: 1;
    meshes: MeshConfig[];
    wallGroups: WallGroupConfig[];
    tileGroups: TileGroupConfig[];
    blocks: BuildingBlockConfig[];
    objects: PlacedObject[];
    showSnow: boolean;
    showFog: boolean;
    fogColor: string;
    weatherEffect: BuildingWeatherEffect;
}
export type BuildingWeatherEffect = 'none' | 'snow' | 'rain' | 'storm' | 'wind';
export declare const BUILDING_WEATHER_EFFECT_OPTIONS: BuildingOptionMeta<BuildingWeatherEffect>[];
export declare const BUILDING_WALL_KIND_OPTIONS: BuildingOptionMeta<BuildingWallKind>[];
export type FlagStyle = 'flag' | 'banner' | 'panel' | 'placard';
export declare const FLAG_STYLE_META: Record<FlagStyle, {
    label: string;
    defaultWidth: number;
    defaultHeight: number;
    windStrength: number;
    poleType: 'side' | 'top' | 'frame' | 'both';
}>;
export type BuildingOptionMeta<T extends string> = {
    type: T;
    labelEn: string;
    labelKo: string;
};
export type BuildingTilePreset = {
    id: string;
    categoryId: string;
    categoryName: string;
    labelEn: string;
    labelKo: string;
    color: string;
    material?: MeshConfig['material'];
    roughness?: number;
    metalness?: number;
    opacity?: number;
    transparent?: boolean;
    mapTextureUrl?: string;
};
export declare const BUILDING_WALL_PRESETS: BuildingWallPreset[];
export declare const BUILDING_TILE_PRESETS: BuildingTilePreset[];
export declare const BUILDING_TREE_OPTIONS: BuildingOptionMeta<BuildingTreeKind>[];
export declare const BUILDING_TREE_COLOR_PRESETS: Record<BuildingTreeKind, {
    primaryColor: string;
    secondaryColor: string;
}>;
export declare const BUILDING_TILE_OBJECT_OPTIONS: BuildingOptionMeta<TileObjectType>[];
export declare const BUILDING_TILE_SHAPE_OPTIONS: BuildingOptionMeta<TileShapeType>[];
export declare const BUILDING_BASIC_OBJECT_OPTIONS: BuildingOptionMeta<Exclude<PlacedObjectType, 'model' | 'sakura'>>[];
export declare const BUILDING_PLACED_OBJECT_OPTIONS: BuildingOptionMeta<PlacedObjectType | 'none'>[];
export declare const BUILDING_FLAG_STYLE_OPTIONS: {
    style: FlagStyle;
    meta: typeof FLAG_STYLE_META[FlagStyle];
}[];
export interface TileGroupConfig {
    id: string;
    name: string;
    floorMeshId: string;
    tiles: TileConfig[];
}
export interface WallCategory {
    id: string;
    name: string;
    description?: string;
    wallGroupIds: string[];
}
export interface TileCategory {
    id: string;
    name: string;
    description?: string;
    tileGroupIds: string[];
}
export interface BuildingSystemState {
    meshes: Map<string, MeshConfig>;
    wallGroups: Map<string, WallGroupConfig>;
    tileGroups: Map<string, TileGroupConfig>;
    blocks: BuildingBlockConfig[];
    wallCategories: Map<string, WallCategory>;
    tileCategories: Map<string, TileCategory>;
    objects: PlacedObject[];
    selectedWallGroupId?: string;
    selectedTileGroupId?: string;
    selectedWallCategoryId?: string;
    selectedTileCategoryId?: string;
    editMode: 'none' | 'wall' | 'world' | 'tile' | 'block' | 'npc' | 'object';
    showGrid: boolean;
    gridSize: number;
    snapToGrid: boolean;
    showSnow: boolean;
    showFog: boolean;
    fogColor: string;
    weatherEffect: BuildingWeatherEffect;
}
