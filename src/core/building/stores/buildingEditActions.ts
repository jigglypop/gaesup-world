import type { BuildingGet, BuildingSet, BuildingStore } from './buildingStoreTypes';
import { ensureTileCategory, ensureTileGroupInCategory, installTilePreset, installWallPreset } from './catalogInstall';
import {
  BUILDING_TILE_PRESETS,
  BUILDING_TREE_COLOR_PRESETS,
  BUILDING_WALL_PRESETS,
  FLAG_STYLE_META,
} from '../types';

const CUSTOM_TILE_CATEGORY_ID = 'custom-tiles';

/** The editor's tool state: mode, hover, current tile, wall and object options, presets, selection and weather. */
export function createBuildingEditActions(set: BuildingSet, get: BuildingGet) {
  return {
    setEditMode: (mode) =>
      set((state) => {
        state.editMode = mode;
        if (mode !== 'none') {
          state.showGrid = true;
        }
      }),

    setShowGrid: (show) =>
      set((state) => {
        state.showGrid = show;
      }),

    setGridSize: (size) =>
      set((state) => {
        state.gridSize = size;
      }),

    setSnapToGrid: (snap) =>
      set((state) => {
        state.snapToGrid = snap;
      }),

    setHoverPosition: (position) => {
      const current = get().hoverPosition;
      if (current === position) return;
      if (
        current &&
        position &&
        current.x === position.x &&
        current.y === position.y &&
        current.z === position.z
      ) {
        return;
      }
      set((state) => {
        state.hoverPosition = position;
      });
    },

    setTileMultiplier: (multiplier) =>
      set((state) => {
        state.currentTileMultiplier = multiplier;
      }),

    setTileHeight: (height) =>
      set((state) => {
        const nextHeight = Math.max(0, Math.min(6, Math.round(height)));
        state.currentTileHeight =
          state.currentTileShape === 'stairs' || state.currentTileShape === 'ramp'
            ? Math.max(1, nextHeight)
            : nextHeight;
      }),

    setTileShape: (shape) =>
      set((state) => {
        state.currentTileShape = shape;
        if ((shape === 'stairs' || shape === 'ramp') && state.currentTileHeight === 0) {
          state.currentTileHeight = 1;
        }
      }),

    setTileRotation: (rotation) =>
      set((state) => {
        state.currentTileRotation = rotation;
      }),

    setCurrentTileMaterialId: (materialId) =>
      set((state) => {
        state.currentTileMaterialId = materialId;
      }),

    setCustomTileDraft: (draft) =>
      set((state) => {
        if (draft.name !== undefined) state.currentCustomTileName = draft.name;
        if (draft.color !== undefined) state.currentCustomTileColor = draft.color;
        if (draft.textureUrl !== undefined) state.currentCustomTileTextureUrl = draft.textureUrl;
      }),

    applyTilePreset: (presetId) =>
      set((state) => {
        const preset = BUILDING_TILE_PRESETS.find((item) => item.id === presetId);
        if (!preset) return;
        state.selectedTileCategoryId = preset.categoryId;
        state.selectedTileGroupId = installTilePreset(state, preset);
        state.currentTileMaterialId = null;
      }),

    applyCustomTile: () =>
      set((state) => {
        const name = state.currentCustomTileName.trim() || '사용자 지정 바닥';
        const color = state.currentCustomTileColor || '#8f8f8f';
        const textureUrl = state.currentCustomTileTextureUrl.trim();
        const idPart = encodeURIComponent(JSON.stringify([name, color, textureUrl]));
        const meshId = `custom-tile-${idPart}`;
        const groupId = `custom-tile-group-${idPart}`;
        ensureTileCategory(
          state,
          CUSTOM_TILE_CATEGORY_ID,
          '사용자 지정 바닥',
          '직접 만든 바닥 맵',
        );
        ensureTileGroupInCategory(state, CUSTOM_TILE_CATEGORY_ID, groupId);
        state.meshes.set(meshId, {
          id: meshId,
          color,
          material: 'STANDARD',
          roughness: 0.62,
          metalness: 0.02,
          ...(textureUrl ? { mapTextureUrl: textureUrl, textureUrl } : {}),
        });
        if (!state.tileGroups.has(groupId)) {
          state.tileGroups.set(groupId, {
            id: groupId,
            name,
            floorMeshId: meshId,
            tiles: [],
          });
        }
        state.selectedTileCategoryId = CUSTOM_TILE_CATEGORY_ID;
        state.selectedTileGroupId = groupId;
        state.currentTileMaterialId = null;
      }),

    setWallRotation: (rotation) =>
      set((state) => {
        state.currentWallRotation = rotation;
      }),

    setCurrentWallMaterialId: (materialId) =>
      set((state) => {
        state.currentWallMaterialId = materialId;
      }),

    setWallKind: (kind) =>
      set((state) => {
        state.currentWallKind = kind;
        if (!state.selectedWallId) return;
        for (const group of state.wallGroups.values()) {
          const wall = group.walls.find((entry) => entry.id === state.selectedWallId);
          if (wall) {
            wall.wallKind = kind;
            return;
          }
        }
      }),

    applyWallPreset: (presetId) =>
      set((state) => {
        const preset = BUILDING_WALL_PRESETS.find((item) => item.id === presetId);
        if (!preset) return;
        state.selectedWallCategoryId = preset.categoryId;
        state.selectedWallGroupId = installWallPreset(state, preset);
        state.currentWallKind = preset.defaultKind;
        state.currentWallMaterialId = null;
      }),

    isInEditMode: () => {
      const { editMode } = get();
      return editMode !== 'none';
    },

    setSelectedWallCategory: (id) =>
      set((state) => {
        state.selectedWallCategoryId = id;
        const category = state.wallCategories.get(id);
        if (category && category.wallGroupIds.length > 0) {
          const firstWallGroupId = category.wallGroupIds[0];
          if (firstWallGroupId) {
            state.selectedWallGroupId = firstWallGroupId;
          }
        }
      }),

    setSelectedTileCategory: (id) =>
      set((state) => {
        state.selectedTileCategoryId = id;
        const category = state.tileCategories.get(id);
        if (category && category.tileGroupIds.length > 0) {
          const firstTileGroupId = category.tileGroupIds[0];
          if (firstTileGroupId) {
            state.selectedTileGroupId = firstTileGroupId;
          }
        }
      }),

    setSelectedTileObjectType: (type) =>
      set((state) => {
        state.selectedTileObjectType = type;
        if (type === 'grass') {
          state.currentTerrainColor = '#5a7a35';
          state.currentTerrainAccentColor = '#8fbc5a';
        } else if (type === 'water') {
          state.currentTerrainColor = '#2f8dbd';
          state.currentTerrainAccentColor = '#9ed6c8';
        } else if (type === 'sand') {
          state.currentTerrainColor = '#b89b66';
          state.currentTerrainAccentColor = '#e0c27a';
        } else if (type === 'snowfield') {
          state.currentTerrainColor = '#dcecff';
          state.currentTerrainAccentColor = '#ffffff';
        }
      }),

    setTerrainColors: (color, accentColor) =>
      set((state) => {
        state.currentTerrainColor = color;
        if (accentColor !== undefined) {
          state.currentTerrainAccentColor = accentColor;
        }
      }),

    setSelectedPlacedObjectType: (type) =>
      set((state) => {
        state.selectedPlacedObjectType = type;
      }),

    setSelectedModelObjectId: (id) =>
      set((state) => {
        state.selectedModelObjectId = id;
      }),

    setModelUrl: (url) =>
      set((state) => {
        state.currentModelUrl = url;
      }),

    setModelScale: (scale) =>
      set((state) => {
        state.currentModelScale = Math.max(0.1, Math.min(10, scale));
      }),

    setModelColor: (color) =>
      set((state) => {
        state.currentModelColor = color;
      }),

    setSelectedWallId: (id) =>
      set((state) => {
        state.selectedWallId = id;
        if (id) {
          state.selectedTileId = null;
          state.selectedBlockId = null;
        }
      }),

    setSelectedTileId: (id) =>
      set((state) => {
        state.selectedTileId = id;
        if (id) {
          state.selectedWallId = null;
          state.selectedBlockId = null;
        }
      }),

    setSelectedBlockId: (id) =>
      set((state) => {
        state.selectedBlockId = id;
        if (id) {
          state.selectedWallId = null;
          state.selectedTileId = null;
        }
      }),

    setFlagWidth: (width) =>
      set((state) => {
        state.currentFlagWidth = width;
      }),

    setFlagHeight: (height) =>
      set((state) => {
        state.currentFlagHeight = height;
      }),

    setFlagImageUrl: (url) =>
      set((state) => {
        state.currentFlagImageUrl = url;
      }),

    setFlagStyle: (style) =>
      set((state) => {
        state.currentFlagStyle = style;
        const meta = FLAG_STYLE_META[style];
        state.currentFlagWidth = meta.defaultWidth;
        state.currentFlagHeight = meta.defaultHeight;
      }),

    setFireIntensity: (intensity) =>
      set((state) => {
        state.currentFireIntensity = intensity;
      }),

    setFireWidth: (width) =>
      set((state) => {
        state.currentFireWidth = width;
      }),

    setFireHeight: (height) =>
      set((state) => {
        state.currentFireHeight = height;
      }),

    setFireColor: (color) =>
      set((state) => {
        state.currentFireColor = color;
      }),

    setObjectRotation: (rotation) =>
      set((state) => {
        state.currentObjectRotation = rotation;
      }),

    setObjectPrimaryColor: (color) =>
      set((state) => {
        state.currentObjectPrimaryColor = color;
      }),

    setObjectSecondaryColor: (color) =>
      set((state) => {
        state.currentObjectSecondaryColor = color;
      }),

    setTreeKind: (kind) =>
      set((state) => {
        const preset = BUILDING_TREE_COLOR_PRESETS[kind];
        state.currentTreeKind = kind;
        state.currentObjectPrimaryColor = preset.primaryColor;
        state.currentObjectSecondaryColor = preset.secondaryColor;
      }),

    setBillboardText: (text) =>
      set((state) => {
        state.currentBillboardText = text;
      }),

    setBillboardImageUrl: (url) =>
      set((state) => {
        state.currentBillboardImageUrl = url;
      }),

    setBillboardColor: (color) =>
      set((state) => {
        state.currentBillboardColor = color;
      }),

    setBillboardWidth: (width) =>
      set((state) => {
        state.currentBillboardWidth = width;
      }),

    setBillboardHeight: (height) =>
      set((state) => {
        state.currentBillboardHeight = height;
      }),

    setBillboardScale: (scale) =>
      set((state) => {
        state.currentBillboardScale = scale;
      }),

    setBillboardOffsetY: (offsetY) =>
      set((state) => {
        state.currentBillboardOffsetY = offsetY;
      }),

    setBillboardElevation: (elevation) =>
      set((state) => {
        state.currentBillboardElevation = elevation;
      }),

    setBillboardIntensity: (intensity) =>
      set((state) => {
        state.currentBillboardIntensity = intensity;
      }),

    setShowSnow: (show) =>
      set((state) => {
        state.showSnow = show;
        state.weatherEffect = show ? 'snow' : 'none';
      }),

    setShowFog: (show) =>
      set((state) => {
        state.showFog = show;
      }),

    setFogColor: (color) =>
      set((state) => {
        state.fogColor = color;
      }),

    setWeatherEffect: (effect) =>
      set((state) => {
        state.weatherEffect = effect;
        state.showSnow = effect === 'snow';
      }),

    setWorldSurface: (surface) =>
      set((state) => {
        state.worldSurface = surface;
      }),
  } satisfies Partial<BuildingStore>;
}
