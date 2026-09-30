import type { BuildingOptionMeta } from './index';

/** Bare earth of a farm plot. `paddy` holds shallow water between its rows; `fallow` grows weeds. */
export type FarmSoil = 'tilled' | 'watered' | 'dry' | 'paddy' | 'fallow';
/** What grows in the rows; `none` leaves the soil bare. */
export type FarmCrop =
  | 'none' | 'lettuce' | 'cabbage' | 'carrot' | 'potato' | 'tomato' | 'corn' | 'wheat' | 'rice'
  | 'pumpkin' | 'melon' | 'strawberry' | 'sunflower' | 'tulip' | 'lavender' | 'herb';
/** `sprout`: a pair of seed leaves. `young`: leafy, no fruit or flowers. `ripe`: grown, with fruit, heads or flowers. */
export type FarmStage = 'sprout' | 'young' | 'ripe';
/** World axis the rows run along. */
export type FarmRows = 'x' | 'z';
/** A plot's open border: a low earth bank, wooden boards, or soil settling into the ground. */
export type FarmEdge = 'ridge' | 'wood' | 'none';

/**
 * A farm tile's plot (`objectConfig.farm`). Every field is optional: the soil follows the crop (rice in a paddy), the
 * stage is ripe, rows follow the tile's quarter turn and the edge is a ridge. Neighboring tiles with the same plot join
 * into one bed whose rows run on across them.
 */
export type FarmPlotConfig = {
  crop?: FarmCrop;
  soil?: FarmSoil;
  stage?: FarmStage;
  rows?: FarmRows;
  edge?: FarmEdge;
};

export const BUILDING_FARM_CROP_OPTIONS: BuildingOptionMeta<FarmCrop>[] = [
  { type: 'none', labelEn: 'Bare soil', labelKo: '빈 밭' },
  { type: 'lettuce', labelEn: 'Lettuce', labelKo: '상추' },
  { type: 'cabbage', labelEn: 'Cabbage', labelKo: '양배추' },
  { type: 'carrot', labelEn: 'Carrot', labelKo: '당근' },
  { type: 'potato', labelEn: 'Potato', labelKo: '감자' },
  { type: 'tomato', labelEn: 'Tomato', labelKo: '토마토' },
  { type: 'corn', labelEn: 'Corn', labelKo: '옥수수' },
  { type: 'wheat', labelEn: 'Wheat', labelKo: '밀' },
  { type: 'rice', labelEn: 'Rice', labelKo: '벼' },
  { type: 'pumpkin', labelEn: 'Pumpkin', labelKo: '호박' },
  { type: 'melon', labelEn: 'Melon', labelKo: '멜론' },
  { type: 'strawberry', labelEn: 'Strawberry', labelKo: '딸기' },
  { type: 'sunflower', labelEn: 'Sunflower', labelKo: '해바라기' },
  { type: 'tulip', labelEn: 'Tulips', labelKo: '튤립' },
  { type: 'lavender', labelEn: 'Lavender', labelKo: '라벤더' },
  { type: 'herb', labelEn: 'Herbs', labelKo: '허브' },
];

export const BUILDING_FARM_SOIL_OPTIONS: BuildingOptionMeta<FarmSoil>[] = [
  { type: 'tilled', labelEn: 'Tilled', labelKo: '갈아엎은 흙' },
  { type: 'watered', labelEn: 'Watered', labelKo: '물 준 흙' },
  { type: 'dry', labelEn: 'Dry', labelKo: '마른 흙' },
  { type: 'paddy', labelEn: 'Paddy', labelKo: '논' },
  { type: 'fallow', labelEn: 'Fallow', labelKo: '묵은 밭' },
];

export const BUILDING_FARM_STAGE_OPTIONS: BuildingOptionMeta<FarmStage>[] = [
  { type: 'sprout', labelEn: 'Sprouts', labelKo: '새싹' },
  { type: 'young', labelEn: 'Growing', labelKo: '자라는 중' },
  { type: 'ripe', labelEn: 'Ripe', labelKo: '다 자람' },
];

export const BUILDING_FARM_ROWS_OPTIONS: BuildingOptionMeta<FarmRows>[] = [
  { type: 'x', labelEn: 'East–west rows', labelKo: '가로 이랑' },
  { type: 'z', labelEn: 'North–south rows', labelKo: '세로 이랑' },
];

export const BUILDING_FARM_EDGE_OPTIONS: BuildingOptionMeta<FarmEdge>[] = [
  { type: 'ridge', labelEn: 'Earth ridge', labelKo: '흙두둑' },
  { type: 'wood', labelEn: 'Wooden edging', labelKo: '나무 테두리' },
  { type: 'none', labelEn: 'Open', labelKo: '테두리 없음' },
];
