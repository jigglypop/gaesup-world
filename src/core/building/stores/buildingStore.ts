import { enableMapSet } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { runtimeStoreServiceKey } from '../../plugins/serviceKey';
import { useGaesupRuntime } from '../../runtime/runtimeContext';
import { lazyScopedStore } from '../../stores/scopedStore';
import type { FlagStyle } from '../types';
import { seedBuildingDefaults } from './buildingDefaults';
import { createBuildingEditActions } from './buildingEditActions';
import { createBuildingModelActions } from './buildingModelActions';
import type { BuildingStore } from './buildingStoreTypes';
import { BuildingSpatialIndex } from './spatialIndex';

export function createBuildingStore() {
  enableMapSet();
  return create<BuildingStore>()(
  immer((set, get) => ({
    initialized: false,
    spatialIndex: new BuildingSpatialIndex(),
    meshes: new Map(),
    wallGroups: new Map(),
    tileGroups: new Map(),
    blocks: [],
    wallCategories: new Map(),
    tileCategories: new Map(),
    editMode: 'none',
    // The grid is an editing aid; entering an edit mode turns it on.
    showGrid: false,
    gridSize: 100,
    snapToGrid: true,
    hoverPosition: null,
    currentTileMultiplier: 1,
    currentTileHeight: 0,
    currentTileShape: 'box',
    currentTileRotation: 0,
    currentTileMaterialId: null,
    currentCustomTileName: '사용자 지정 바닥',
    currentCustomTileColor: '#8f8f8f',
    currentCustomTileTextureUrl: '',
    currentWallRotation: 0,
    currentWallMaterialId: null,
    currentWallKind: 'solid',
    objects: [],
    selectedTileObjectType: 'none',
    currentTerrainColor: '#5a7a35',
    currentTerrainAccentColor: '#8fbc5a',
    currentFarm: {},
    selectedPlacedObjectType: 'none',
    selectedModelObjectId: 'door-basic',
    currentModelUrl: '',
    currentModelScale: 1,
    currentModelColor: '#9b7653',
    selectedWallId: null,
    selectedTileId: null,
    selectedBlockId: null,
    buildingTool: 'place',
    currentFlagWidth: 1.5,
    currentFlagHeight: 1.0,
    currentFlagImageUrl: '',
    currentFlagStyle: 'flag' as FlagStyle,
    currentFireIntensity: 1.5,
    currentFireWidth: 1.0,
    currentFireHeight: 1.5,
    currentFireColor: '#ff6622',
    currentObjectRotation: 0,
    currentObjectPrimaryColor: '#f7bfd2',
    currentObjectSecondaryColor: '#5e3d30',
    currentTreeKind: 'sakura',
    currentBillboardText: 'HELLO',
    currentBillboardImageUrl: '',
    currentBillboardColor: '#00ff88',
    currentBillboardWidth: 0,
    currentBillboardHeight: 1.5,
    currentBillboardScale: 1,
    currentBillboardOffsetY: 0,
    currentBillboardElevation: 1,
    currentBillboardIntensity: 2,
    showSnow: false,
    showFog: false,
    fogColor: '#cfd8e3',
    weatherEffect: 'none',
    climate: 'off',
    worldSurface: 'ground',

    initializeDefaults: () => set(seedBuildingDefaults),
    ...createBuildingModelActions(set, get),
    ...createBuildingEditActions(set, get),
  })),
);
}

export type BuildingStoreApi = ReturnType<typeof createBuildingStore>;
export const BUILDING_STORE_SERVICE = runtimeStoreServiceKey<BuildingStoreApi>('building');
/** React uses the nearest runtime; static methods retain the legacy default. */
export const { useStore: useBuildingStore, useStoreApi: useBuildingStoreApi } = lazyScopedStore(
  'useBuildingStore', createBuildingStore, () => useGaesupRuntime()?.buildingStore,
);
