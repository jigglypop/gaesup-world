import type { BuildingModelFallbackKind } from '../types';
export type BuildingObjectCatalogItem = {
    id: string;
    label: string;
    category: 'structure' | 'furniture' | 'utility' | 'shop' | 'decor';
    fallbackKind: BuildingModelFallbackKind;
    defaultScale: number;
    defaultColor: string;
    modelUrl?: string;
};
export declare const DEFAULT_BUILDING_OBJECT_CATALOG: BuildingObjectCatalogItem[];
export declare function getDefaultBuildingObject(id: string): BuildingObjectCatalogItem | undefined;
