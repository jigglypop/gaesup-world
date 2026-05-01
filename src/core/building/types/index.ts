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
}

export interface WallGroupConfig {
  id: string;
  name: string;
  frontMeshId?: string;
  backMeshId?: string;
  sideMeshId?: string;
  walls: WallConfig[];
}

export type TileObjectType = 'water' | 'grass' | 'sand' | 'snowfield' | 'none';
export type BuildingTreeKind = 'sakura' | 'oak' | 'pine' | 'maple' | 'birch' | 'willow' | 'cypress' | 'dead';
export type PlacedObjectType = 'tree' | 'sakura' | 'flag' | 'fire' | 'billboard' | 'model';
export type TileShapeType = 'box' | 'stairs' | 'round' | 'ramp';
export type BuildingModelFallbackKind =
  | 'door'
  | 'window'
  | 'fence'
  | 'lamp'
  | 'chair'
  | 'table'
  | 'bed'
  | 'storage'
  | 'mailbox'
  | 'crafting'
  | 'shop'
  | 'generic';

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

export const BUILDING_WEATHER_EFFECT_OPTIONS: BuildingOptionMeta<BuildingWeatherEffect>[] = [
  { type: 'none', labelEn: 'None', labelKo: '없음' },
  { type: 'snow', labelEn: 'Snow', labelKo: '눈' },
  { type: 'rain', labelEn: 'Rain', labelKo: '비' },
  { type: 'storm', labelEn: 'Storm', labelKo: '폭풍' },
  { type: 'wind', labelEn: 'Wind', labelKo: '바람' },
];

export type FlagStyle = 'flag' | 'banner' | 'panel' | 'placard';

export const FLAG_STYLE_META: Record<FlagStyle, {
  label: string;
  defaultWidth: number;
  defaultHeight: number;
  windStrength: number;
  poleType: 'side' | 'top' | 'frame' | 'both';
}> = {
  flag:    { label: 'Flag',    defaultWidth: 1.5, defaultHeight: 1.0, windStrength: 1.0, poleType: 'side' },
  banner:  { label: 'Banner',  defaultWidth: 1.2, defaultHeight: 3.0, windStrength: 0.3, poleType: 'top' },
  panel:   { label: 'Panel',   defaultWidth: 2.0, defaultHeight: 1.5, windStrength: 0.0, poleType: 'frame' },
  placard: { label: 'Placard', defaultWidth: 4.0, defaultHeight: 1.0, windStrength: 0.5, poleType: 'both' },
};

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

export const BUILDING_TILE_PRESETS: BuildingTilePreset[] = [
  { id: 'oak-planks', categoryId: 'wood-floors', categoryName: 'Wood Floors', labelEn: 'Oak Planks', labelKo: '오크 판자', color: '#8b5a2b', roughness: 0.58 },
  { id: 'pine-planks', categoryId: 'wood-floors', categoryName: 'Wood Floors', labelEn: 'Pine Planks', labelKo: '소나무 판자', color: '#b88952', roughness: 0.62 },
  { id: 'walnut-planks', categoryId: 'wood-floors', categoryName: 'Wood Floors', labelEn: 'Walnut Planks', labelKo: '월넛 판자', color: '#4b2f22', roughness: 0.64 },
  { id: 'bamboo-floor', categoryId: 'wood-floors', categoryName: 'Wood Floors', labelEn: 'Bamboo Floor', labelKo: '대나무 바닥', color: '#c2a15b', roughness: 0.55 },
  { id: 'herringbone-wood', categoryId: 'wood-floors', categoryName: 'Wood Floors', labelEn: 'Herringbone', labelKo: '헤링본 목재', color: '#9a6a3a', roughness: 0.5 },
  { id: 'white-marble', categoryId: 'stone-floors', categoryName: 'Stone Floors', labelEn: 'White Marble', labelKo: '화이트 대리석', color: '#f0f0ec', roughness: 0.22, metalness: 0.05 },
  { id: 'black-marble', categoryId: 'stone-floors', categoryName: 'Stone Floors', labelEn: 'Black Marble', labelKo: '블랙 대리석', color: '#25252a', roughness: 0.2, metalness: 0.08 },
  { id: 'granite', categoryId: 'stone-floors', categoryName: 'Stone Floors', labelEn: 'Granite', labelKo: '화강암', color: '#77746f', roughness: 0.42, metalness: 0.03 },
  { id: 'slate', categoryId: 'stone-floors', categoryName: 'Stone Floors', labelEn: 'Slate', labelKo: '슬레이트', color: '#3f4a4d', roughness: 0.62 },
  { id: 'basalt', categoryId: 'stone-floors', categoryName: 'Stone Floors', labelEn: 'Basalt', labelKo: '현무암', color: '#2c2f31', roughness: 0.72 },
  { id: 'limestone', categoryId: 'stone-floors', categoryName: 'Stone Floors', labelEn: 'Limestone', labelKo: '석회암', color: '#c8bea8', roughness: 0.66 },
  { id: 'cobblestone', categoryId: 'masonry-floors', categoryName: 'Masonry Floors', labelEn: 'Cobblestone', labelKo: '자갈석', color: '#6f6b60', roughness: 0.82 },
  { id: 'brick-pavers', categoryId: 'masonry-floors', categoryName: 'Masonry Floors', labelEn: 'Brick Pavers', labelKo: '벽돌 포장', color: '#9a4f37', roughness: 0.78 },
  { id: 'terracotta', categoryId: 'masonry-floors', categoryName: 'Masonry Floors', labelEn: 'Terracotta', labelKo: '테라코타', color: '#b85f3c', roughness: 0.76 },
  { id: 'concrete', categoryId: 'urban-floors', categoryName: 'Urban Floors', labelEn: 'Concrete', labelKo: '콘크리트', color: '#8b8d8c', roughness: 0.86 },
  { id: 'asphalt', categoryId: 'urban-floors', categoryName: 'Urban Floors', labelEn: 'Asphalt', labelKo: '아스팔트', color: '#242629', roughness: 0.9 },
  { id: 'ceramic-white', categoryId: 'decor-floors', categoryName: 'Decor Floors', labelEn: 'White Ceramic', labelKo: '화이트 세라믹', color: '#f7f7f2', roughness: 0.28 },
  { id: 'checker-tile', categoryId: 'decor-floors', categoryName: 'Decor Floors', labelEn: 'Checker Tile', labelKo: '체커 타일', color: '#d9d9d2', roughness: 0.32 },
  { id: 'mosaic-blue', categoryId: 'decor-floors', categoryName: 'Decor Floors', labelEn: 'Blue Mosaic', labelKo: '블루 모자이크', color: '#3b78a0', roughness: 0.34 },
  { id: 'metal-grate', categoryId: 'special-floors', categoryName: 'Special Floors', labelEn: 'Metal Grate', labelKo: '금속 그레이팅', color: '#5c6268', material: 'METAL', roughness: 0.38, metalness: 0.75 },
  { id: 'glass-tile', categoryId: 'special-floors', categoryName: 'Special Floors', labelEn: 'Glass Tile', labelKo: '유리 타일', color: '#9ed8ff', material: 'GLASS', roughness: 0.08, opacity: 0.42, transparent: true },
  { id: 'sandstone', categoryId: 'natural-floors', categoryName: 'Natural Floors', labelEn: 'Sandstone', labelKo: '사암', color: '#c9ab75', roughness: 0.88 },
  { id: 'snow-ice', categoryId: 'natural-floors', categoryName: 'Natural Floors', labelEn: 'Snow Ice', labelKo: '눈 얼음', color: '#eef5ff', roughness: 0.5, metalness: 0.02 },
  { id: 'moss-stone', categoryId: 'natural-floors', categoryName: 'Natural Floors', labelEn: 'Moss Stone', labelKo: '이끼 낀 돌', color: '#60704a', roughness: 0.84 },
];

export const BUILDING_TREE_OPTIONS: BuildingOptionMeta<BuildingTreeKind>[] = [
  { type: 'sakura', labelEn: 'Sakura', labelKo: '벚꽃나무' },
  { type: 'oak', labelEn: 'Oak', labelKo: '참나무' },
  { type: 'pine', labelEn: 'Pine', labelKo: '소나무' },
  { type: 'maple', labelEn: 'Maple', labelKo: '단풍나무' },
  { type: 'birch', labelEn: 'Birch', labelKo: '자작나무' },
  { type: 'willow', labelEn: 'Willow', labelKo: '버드나무' },
  { type: 'cypress', labelEn: 'Cypress', labelKo: '사이프러스' },
  { type: 'dead', labelEn: 'Dead Tree', labelKo: '고목' },
];

export const BUILDING_TREE_COLOR_PRESETS: Record<BuildingTreeKind, { primaryColor: string; secondaryColor: string }> = {
  sakura: { primaryColor: '#f7bfd2', secondaryColor: '#5e3d30' },
  oak: { primaryColor: '#4f8f3a', secondaryColor: '#6b4a2a' },
  pine: { primaryColor: '#2f6f45', secondaryColor: '#5b3b24' },
  maple: { primaryColor: '#d05a2d', secondaryColor: '#654126' },
  birch: { primaryColor: '#87b95a', secondaryColor: '#e8e1cf' },
  willow: { primaryColor: '#7fae55', secondaryColor: '#6a5635' },
  cypress: { primaryColor: '#315f3a', secondaryColor: '#59402d' },
  dead: { primaryColor: '#8b7a61', secondaryColor: '#4b392c' },
};

export const BUILDING_TILE_OBJECT_OPTIONS: BuildingOptionMeta<TileObjectType>[] = [
  { type: 'none', labelEn: 'None', labelKo: '없음' },
  { type: 'water', labelEn: 'Water', labelKo: '물' },
  { type: 'grass', labelEn: 'Grass', labelKo: '잔디' },
  { type: 'sand', labelEn: 'Sand', labelKo: '모래' },
  { type: 'snowfield', labelEn: 'Snowfield', labelKo: '눈밭' },
];

export const BUILDING_TILE_SHAPE_OPTIONS: BuildingOptionMeta<TileShapeType>[] = [
  { type: 'box', labelEn: 'Box', labelKo: '박스' },
  { type: 'stairs', labelEn: 'Stairs', labelKo: '계단' },
  { type: 'round', labelEn: 'Round', labelKo: '원형' },
  { type: 'ramp', labelEn: 'Ramp', labelKo: '경사' },
];

export const BUILDING_BASIC_OBJECT_OPTIONS: BuildingOptionMeta<Exclude<PlacedObjectType, 'model' | 'sakura'>>[] = [
  { type: 'tree', labelEn: 'Tree', labelKo: '나무' },
  { type: 'flag', labelEn: 'Flag', labelKo: '깃발' },
  { type: 'fire', labelEn: 'Fire', labelKo: '불' },
  { type: 'billboard', labelEn: 'Billboard', labelKo: '간판' },
];

export const BUILDING_PLACED_OBJECT_OPTIONS: BuildingOptionMeta<PlacedObjectType | 'none'>[] = [
  { type: 'none', labelEn: 'None', labelKo: '없음' },
  ...BUILDING_BASIC_OBJECT_OPTIONS,
  { type: 'model', labelEn: 'Model', labelKo: '기본 기물' },
];

export const BUILDING_FLAG_STYLE_OPTIONS: { style: FlagStyle; meta: typeof FLAG_STYLE_META[FlagStyle] }[] =
  (Object.keys(FLAG_STYLE_META) as FlagStyle[]).map((style) => ({
    style,
    meta: FLAG_STYLE_META[style],
  }));

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
  editMode: 'none' | 'wall' | 'tile' | 'block' | 'npc' | 'object';
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  showSnow: boolean;
  showFog: boolean;
  fogColor: string;
  weatherEffect: BuildingWeatherEffect;
}
