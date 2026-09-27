import { produce } from 'immer';

import type { BuildingGet, BuildingSet, BuildingStore } from './buildingStoreTypes';
import { applyBuildingHydration, hydrateBuildingState, serializeBuildingState } from './persistence';
import {
  createBlockFootprint,
  getBuildingSupportHeight,
  hasWallCollision,
  snapBuildingPosition,
  createTileFootprint,
  tilePositionToCell,
} from '../model';
import { snapTilePosition, wallEdge } from '../model/footprint';
import { blockPlacementCells, placeTileOnGrid } from '../model/placement';
import type { TileConfig, TileObjectType, WallConfig, WallGroupConfig } from '../types';

const DEFAULT_GRASS_DENSITY = 90;

function defaultTileObjectConfig(
  objectType: TileObjectType | undefined,
  terrainColor: string,
  terrainAccentColor: string,
): TileConfig['objectConfig'] {
  if (objectType === 'grass') return { grassDensity: DEFAULT_GRASS_DENSITY, terrainColor, terrainAccentColor };
  if (objectType === 'sand' || objectType === 'snowfield' || objectType === 'dirt') return { terrainColor, terrainAccentColor };
  return undefined;
}

/**
 * Meshes, categories, groups, walls, tiles, blocks and placed objects, with the occupancy index kept in step.
 * Callers may replace a group's tile list wholesale; every footprint is validated before occupancy changes.
 */
export function createBuildingModelActions(set: BuildingSet, get: BuildingGet) {
  return {
    addMesh: (mesh) =>
      set((state) => {
        state.meshes.set(mesh.id, mesh);
      }),

    updateMesh: (id, updates) =>
      set((state) => {
        const mesh = state.meshes.get(id);
        if (mesh) {
          state.meshes.set(id, { ...mesh, ...updates });
        }
      }),

    removeMesh: (id) =>
      set((state) => {
        state.meshes.delete(id);
      }),

    addWallGroup: (group) =>
      set((state) => {
        const walls = group.walls.map((wall) => ({ ...wall, edge: wallEdge(wall) }));
        state.spatialIndex.replaceWalls(state.wallGroups.get(group.id)?.walls ?? [], walls);
        state.wallGroups.set(group.id, { ...group, walls });
      }),

    updateWallGroup: (id, updates) =>
      set((state) => {
        const group = state.wallGroups.get(id);
        if (group) {
          const walls = updates.walls?.map((wall) => ({ ...wall, edge: wallEdge(wall) }));
          if (walls) state.spatialIndex.replaceWalls(group.walls, walls);
          state.wallGroups.set(id, { ...group, ...updates, ...(walls ? { walls } : {}) });
        }
      }),

    removeWallGroup: (id) =>
      set((state) => {
        const group = state.wallGroups.get(id);
        if (group) state.spatialIndex.replaceWalls(group.walls, []);
        state.wallGroups.delete(id);
      }),

    addWall: (groupId, wall) =>
      set((state) => {
        const group = state.wallGroups.get(groupId);
        if (group) {
          const materialId = wall.materialId ?? state.currentWallMaterialId;
          const wallKind =
            wall.wallKind ?? state.currentWallKind ?? group.defaultWallKind ?? 'solid';
          const wallWithEdge: WallConfig = {
            ...wall,
            ...(materialId ? { materialId } : {}),
            wallKind,
            edge: wallEdge(wall),
          };
          group.walls.push(wallWithEdge);
          state.spatialIndex.indexWall(wallWithEdge);
        }
      }),

    updateWall: (groupId, wallId, updates) =>
      set((state) => {
        const group = state.wallGroups.get(groupId);
        if (group) {
          const wallIndex = group.walls.findIndex((w) => w.id === wallId);
          if (wallIndex !== -1) {
            const wall = group.walls[wallIndex];
            if (wall) {
              Object.assign(wall, updates);
              if (updates.position !== undefined || updates.rotation !== undefined) {
                wall.edge = wallEdge(wall);
                state.spatialIndex.indexWall(wall);
              }
            }
          }
        }
      }),

    moveWallToGroup: (wallId, targetGroupId) =>
      set((state) => {
        const targetGroup = state.wallGroups.get(targetGroupId);
        if (!targetGroup) return;

        let sourceGroup: WallGroupConfig | undefined;
        let wallIndex = -1;
        for (const group of state.wallGroups.values()) {
          wallIndex = group.walls.findIndex((wall) => wall.id === wallId);
          if (wallIndex !== -1) {
            sourceGroup = group;
            break;
          }
        }
        if (!sourceGroup || wallIndex === -1 || sourceGroup.id === targetGroupId) {
          state.selectedWallGroupId = targetGroupId;
          return;
        }

        const wall = sourceGroup.walls[wallIndex];
        if (!wall) return;
        const { materialId: _materialId, ...wallWithoutMaterial } = wall;
        void _materialId;
        sourceGroup.walls.splice(wallIndex, 1);
        targetGroup.walls.push({
          ...wallWithoutMaterial,
          wallGroupId: targetGroupId,
        });
        state.selectedWallGroupId = targetGroupId;
      }),

    removeWall: (groupId, wallId) =>
      set((state) => {
        const group = state.wallGroups.get(groupId);
        // A wall that lives in another group keeps its index entries.
        if (group?.walls.some((w) => w.id === wallId)) {
          state.spatialIndex.unindexWall(wallId);
          group.walls = group.walls.filter((w) => w.id !== wallId);
          if (state.selectedWallId === wallId) state.selectedWallId = null;
        }
      }),

    addTileGroup: (group) =>
      set((state) => {
        const tiles = group.tiles.map(placeTileOnGrid);
        state.spatialIndex.replaceTiles(state.tileGroups.get(group.id)?.tiles ?? [], tiles);
        state.tileGroups.set(group.id, { ...group, tiles });
      }),

    updateTileGroup: (id, updates) =>
      set((state) => {
        const group = state.tileGroups.get(id);
        if (group) {
          const tiles = updates.tiles?.map(placeTileOnGrid);
          if (tiles) state.spatialIndex.replaceTiles(group.tiles, tiles);
          state.tileGroups.set(id, { ...group, ...updates, ...(tiles ? { tiles } : {}) });
        }
      }),

    removeTileGroup: (id) =>
      set((state) => {
        const group = state.tileGroups.get(id);
        if (group) state.spatialIndex.replaceTiles(group.tiles, []);
        state.tileGroups.delete(id);
      }),

    addTile: (groupId, tile) =>
      set((state) => {
        const group = state.tileGroups.get(groupId);
        if (group) {
          const objectType = tile.objectType ?? state.selectedTileObjectType;
          const objectConfig = tile.objectConfig
            ?? defaultTileObjectConfig(objectType, state.currentTerrainColor, state.currentTerrainAccentColor);
          const materialId = tile.materialId ?? state.currentTileMaterialId;
          const tileWithObject = placeTileOnGrid({
            ...tile,
            ...(materialId ? { materialId } : {}),
            objectType,
            ...(objectConfig ? { objectConfig } : {}),
          });
          group.tiles.push(tileWithObject);
          state.spatialIndex.indexTile(tileWithObject);
        }
      }),

    updateTile: (groupId, tileId, updates) =>
      set((state) => {
        const group = state.tileGroups.get(groupId);
        if (group) {
          const tileIndex = group.tiles.findIndex((t) => t.id === tileId);
          if (tileIndex !== -1) {
            const tile = group.tiles[tileIndex];
            if (tile) {
              Object.assign(tile, updates);
              if (updates.position !== undefined || updates.size !== undefined || updates.cell !== undefined || updates.footprint !== undefined) {
                // Derived fields follow the new position unless the update sets them.
                const { cell: _cell, footprint: _footprint, ...rest } = tile;
                void _cell;
                void _footprint;
                const placed = placeTileOnGrid({
                  ...rest,
                  ...(updates.cell ? { cell: updates.cell } : {}),
                  ...(updates.footprint ? { footprint: updates.footprint } : {}),
                });
                Object.assign(tile, { position: placed.position, cell: placed.cell, footprint: placed.footprint });
                state.spatialIndex.indexTile(placed);
              }
            }
          }
        }
      }),

    removeTile: (groupId, tileId) =>
      set((state) => {
        const group = state.tileGroups.get(groupId);
        if (group) {
          const tiles = group.tiles.filter((t) => t.id !== tileId);
          // A tile that lives in another group keeps its index entries.
          if (tiles.length !== group.tiles.length) {
            state.spatialIndex.unindexTile(tileId);
          }
          group.tiles = tiles;
          if (state.selectedTileId === tileId) state.selectedTileId = null;
        }
      }),

    addBlock: (block) =>
      set((state) => {
        const cell = block.cell ?? tilePositionToCell(block.position);
        state.spatialIndex.occupy(block.id, createBlockFootprint(cell, block.size));
        state.blocks.push({
          ...block,
          cell,
        });
      }),

    updateBlock: (blockId, updates) =>
      set((state) => {
        const index = state.blocks.findIndex((block) => block.id === blockId);
        if (index === -1) return;
        const block = state.blocks[index];
        if (!block) return;
        Object.assign(block, updates);
        if (updates.position !== undefined || updates.cell !== undefined) {
          block.cell = updates.cell ?? tilePositionToCell(block.position);
        }
        state.spatialIndex.occupy(blockId, blockPlacementCells(block));
      }),

    removeBlock: (blockId) =>
      set((state) => {
        const blocks = state.blocks.filter((block) => block.id !== blockId);
        if (blocks.length !== state.blocks.length) state.spatialIndex.vacate(blockId);
        state.blocks = blocks;
        if (state.selectedBlockId === blockId) state.selectedBlockId = null;
      }),

    snapPosition: (position) => {
      const { snapToGrid } = get();
      if (!snapToGrid) return position;

      return snapBuildingPosition(position);
    },

    // Candidate cells are looked up in the incrementally kept occupancy instead of re-indexing every tile, wall
    // and block into a placement engine; walls sit on edges and never share a cell key.

    checkTilePosition: (position) => {
      const { currentTileMultiplier, spatialIndex } = get();
      const cells = createTileFootprint(tilePositionToCell(snapTilePosition(position, currentTileMultiplier)), currentTileMultiplier);
      return spatialIndex.isOccupied(cells, '__candidate_tile__');
    },

    checkBlockPosition: (block) =>
      get().spatialIndex.isOccupied(blockPlacementCells(block), '__candidate_block__'),

    getSupportHeightAt: (position) => {
      const { spatialIndex, blocks, currentTileMultiplier, editMode } = get();
      return getBuildingSupportHeight(
        spatialIndex.tileIndex,
        spatialIndex.tileMeta,
        blocks,
        position,
        currentTileMultiplier,
        editMode === 'block',
      );
    },

    checkWallPosition: (position, rotation) => {
      const { spatialIndex } = get();
      return hasWallCollision(spatialIndex.wallIndex, spatialIndex.wallMeta, position, rotation);
    },

    serialize: () => serializeBuildingState(get()),

    prepareHydrate: (data) => {
      if (data === null || data === undefined) return () => {};
      const prepared = produce(get(), (state) => hydrateBuildingState(state, data));
      return () => set((state) => applyBuildingHydration(state, prepared));
    },

    hydrate: (data) => get().prepareHydrate(data)(),

    addWallCategory: (category) =>
      set((state) => {
        state.wallCategories.set(category.id, category);
      }),

    updateWallCategory: (id, updates) =>
      set((state) => {
        const category = state.wallCategories.get(id);
        if (category) {
          state.wallCategories.set(id, { ...category, ...updates });
        }
      }),

    removeWallCategory: (id) =>
      set((state) => {
        state.wallCategories.delete(id);
      }),

    addTileCategory: (category) =>
      set((state) => {
        state.tileCategories.set(category.id, category);
      }),

    updateTileCategory: (id, updates) =>
      set((state) => {
        const category = state.tileCategories.get(id);
        if (category) {
          state.tileCategories.set(id, { ...category, ...updates });
        }
      }),

    removeTileCategory: (id) =>
      set((state) => {
        state.tileCategories.delete(id);
      }),

    addObject: (obj) =>
      set((state) => {
        state.objects.push(obj);
      }),

    removeObject: (id) =>
      set((state) => {
        state.objects = state.objects.filter((o) => o.id !== id);
      }),

    updateObject: (id, updates) =>
      set((state) => {
        const idx = state.objects.findIndex((o) => o.id === id);
        if (idx !== -1) {
          const object = state.objects[idx];
          if (object) {
            Object.assign(object, updates);
          }
        }
      }),
  } satisfies Partial<BuildingStore>;
}
