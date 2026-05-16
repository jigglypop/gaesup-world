import { MeshConfig, Position3D, TileGroupConfig, TileObjectType } from '../types';
export declare function createTerrainBlockMaterial(objectType: TileObjectType, color: string, accentColor: string): MeshConfig | null;
export declare function findTerrainBlockMaterial(tileGroups: Iterable<TileGroupConfig>, position: Position3D): MeshConfig | null;
export declare function useBuildingEditor(): {
    updateMousePosition: (event: MouseEvent) => void;
    placeWall: () => void;
    placeTile: () => void;
    placeBlock: () => void;
    placeObject: () => void;
    handleWallClick: (wallId: string) => void;
    handleTileClick: (tileId: string) => void;
    handleBlockClick: (blockId: string) => void;
    getGroundPosition: () => Position3D | null;
};
