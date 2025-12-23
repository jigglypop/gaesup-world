  import { StateCreator } from 'zustand';

import { WorldSlice, MeshType, TileType, WallType, NpcType, InteractableObjectType, TileGroupType, WallGroupType } from './types';

export const createWorldSlice: StateCreator<WorldSlice, [], [], WorldSlice> = (set) => ({
  meshes: new Map(),
  currentMeshId: null,
  addMesh: (mesh: MeshType) => {
    set((state) => {
      const newMeshes = new Map(state.meshes);
      newMeshes.set(mesh.id, mesh);
      return { meshes: newMeshes };
    });
  },
  removeMesh: (id: string) => {
    set((state) => {
      const newMeshes = new Map(state.meshes);
      newMeshes.delete(id);
      return { meshes: newMeshes };
    });
  },
  updateMesh: (id: string, newMesh: Partial<MeshType>) => {
    set((state) => {
      const currentMesh = state.meshes.get(id);
      if (currentMesh) {
        const updatedMesh = { ...currentMesh, ...newMesh };
        const newMeshes = new Map(state.meshes);
        newMeshes.set(id, updatedMesh);
        return { meshes: newMeshes };
      }
      return state;
    });
  },
  setCurrentMeshId: (id: string | null) => {
    set({ currentMeshId: id });
  },

  tiles: new Map(),
  addTile: (tile: TileType) => {
    set((state) => {
      const newTiles = new Map(state.tiles);
      newTiles.set(tile.id, tile);
      return { tiles: newTiles };
    });
  },
  removeTile: (id: string) => {
    set((state) => {
      const newTiles = new Map(state.tiles);
      newTiles.delete(id);
      return { tiles: newTiles };
    });
  },
  updateTile: (id: string, newTile: Partial<TileType>) => {
    set((state) => {
      const currentTile = state.tiles.get(id);
      if (currentTile) {
        const updatedTile = { ...currentTile, ...newTile };
        const newTiles = new Map(state.tiles);
        newTiles.set(id, updatedTile);
        return { tiles: newTiles };
      }
      return state;
    });
  },

  tileGroups: new Map(),
  addTileGroup: (group: TileGroupType) => {
    set((state) => {
      const newGroups = new Map(state.tileGroups);
      newGroups.set(group.id, group);
      return { tileGroups: newGroups };
    });
  },
  removeTileGroup: (groupId: string) => {
    set((state) => {
      const newGroups = new Map(state.tileGroups);
      newGroups.delete(groupId);
      const newTiles = new Map(state.tiles);
      newTiles.forEach((tile) => {
        if (tile.groupId === groupId) {
          const { groupId: _groupId, ...rest } = tile;
          void _groupId;
          newTiles.set(tile.id, rest);
        }
      });
      return { tileGroups: newGroups, tiles: newTiles };
    });
  },
  updateTileGroup: (groupId: string, newGroup: Partial<TileGroupType>) => {
    set((state) => {
      const currentGroup = state.tileGroups.get(groupId);
      if (currentGroup) {
        const updatedGroup = { ...currentGroup, ...newGroup };
        const newGroups = new Map(state.tileGroups);
        newGroups.set(groupId, updatedGroup);
        return { tileGroups: newGroups };
      }
      return state;
    });
  },
  addTileToGroup: (groupId: string, tileId: string) => {
    set((state) => {
      const tile = state.tiles.get(tileId);
      if (tile && state.tileGroups.has(groupId)) {
        const newTiles = new Map(state.tiles);
        newTiles.set(tileId, { ...tile, groupId });
        return { tiles: newTiles };
      }
      return state;
    });
  },
  removeTileFromGroup: (tileId: string) => {
    set((state) => {
      const tile = state.tiles.get(tileId);
      if (tile?.groupId) {
        const newTiles = new Map(state.tiles);
        const { groupId: _groupId, ...rest } = tile;
        void _groupId;
        newTiles.set(tileId, rest);
        return { tiles: newTiles };
      }
      return state;
    });
  },

  walls: new Map(),
  addWall: (wall: WallType) => {
    set((state) => {
      const newWalls = new Map(state.walls);
      newWalls.set(wall.id, wall);
      return { walls: newWalls };
    });
  },
  removeWall: (id: string) => {
    set((state) => {
      const newWalls = new Map(state.walls);
      newWalls.delete(id);
      return { walls: newWalls };
    });
  },
  updateWall: (id: string, newWall: Partial<WallType>) => {
    set((state) => {
      const currentWall = state.walls.get(id);
      if (currentWall) {
        const updatedWall = { ...currentWall, ...newWall };
        const newWalls = new Map(state.walls);
        newWalls.set(id, updatedWall);
        return { walls: newWalls };
      }
      return state;
    });
  },

  wallGroups: new Map(),
  addWallGroup: (group: WallGroupType) => {
    set((state) => {
      const newGroups = new Map(state.wallGroups);
      newGroups.set(group.id, group);
      return { wallGroups: newGroups };
    });
  },
  removeWallGroup: (groupId: string) => {
    set((state) => {
      const newGroups = new Map(state.wallGroups);
      newGroups.delete(groupId);
      const newWalls = new Map(state.walls);
      newWalls.forEach((wall) => {
        if (wall.groupId === groupId) {
          const { groupId: _groupId, ...rest } = wall;
          void _groupId;
          newWalls.set(wall.id, rest);
        }
      });
      return { wallGroups: newGroups, walls: newWalls };
    });
  },
  updateWallGroup: (groupId: string, newGroup: Partial<WallGroupType>) => {
    set((state) => {
      const currentGroup = state.wallGroups.get(groupId);
      if (currentGroup) {
        const updatedGroup = { ...currentGroup, ...newGroup };
        const newGroups = new Map(state.wallGroups);
        newGroups.set(groupId, updatedGroup);
        return { wallGroups: newGroups };
      }
      return state;
    });
  },
  addWallToGroup: (groupId: string, wallId: string) => {
    set((state) => {
      const wall = state.walls.get(wallId);
      if (wall && state.wallGroups.has(groupId)) {
        const newWalls = new Map(state.walls);
        newWalls.set(wallId, { ...wall, groupId });
        return { walls: newWalls };
      }
      return state;
    });
  },
  removeWallFromGroup: (wallId: string) => {
    set((state) => {
      const wall = state.walls.get(wallId);
      if (wall?.groupId) {
        const newWalls = new Map(state.walls);
        const { groupId: _groupId, ...rest } = wall;
        void _groupId;
        newWalls.set(wallId, rest);
        return { walls: newWalls };
      }
      return state;
    });
  },

  npcs: new Map(),
  addNpc: (npc: NpcType) => {
    set((state) => {
      const newNpcs = new Map(state.npcs);
      newNpcs.set(npc.id, npc);
      return { npcs: newNpcs };
    });
  },
  removeNpc: (id: string) => {
    set((state) => {
      const newNpcs = new Map(state.npcs);
      newNpcs.delete(id);
      return { npcs: newNpcs };
    });
  },
  updateNpc: (id: string, newNpc: Partial<NpcType>) => {
    set((state) => {
      const currentNpc = state.npcs.get(id);
      if (currentNpc) {
        const updatedNpc = { ...currentNpc, ...newNpc };
        const newNpcs = new Map(state.npcs);
        newNpcs.set(id, updatedNpc);
        return { npcs: newNpcs };
      }
      return state;
    });
  },

  interactableObjects: new Map(),
  addInteractableObject: (obj: InteractableObjectType) => {
    set((state) => {
      const newObjects = new Map(state.interactableObjects);
      newObjects.set(obj.id, obj);
      return { interactableObjects: newObjects };
    });
  },
  removeInteractableObject: (id: string) => {
    set((state) => {
      const newObjects = new Map(state.interactableObjects);
      newObjects.delete(id);
      return { interactableObjects: newObjects };
    });
  },
  updateInteractableObject: (
    id: string,
    newObj: Partial<InteractableObjectType>
  ) => {
    set((state) => {
      const currentObj = state.interactableObjects.get(id);
      if (currentObj) {
        const updatedObj = { ...currentObj, ...newObj };
        const newObjects = new Map(state.interactableObjects);
        newObjects.set(id, updatedObj);
        return { interactableObjects: newObjects };
      }
      return state;
    });
  },
}); 