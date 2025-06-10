import { getTiles } from "@api/tile";
import { min } from "@constants/time";
import { useQuery } from "@tanstack/react-query";
import { tilesByParentsIdType, tileType } from "./type";

export function useTileQuery() {
  const { data, isSuccess, isLoading } = useQuery({
    queryKey: ["tiles"],
    queryFn: getTiles,
    staleTime: 10 * min,
  });
  const getTilesByParentsId = (tiles: tileType[] | undefined) => {
    if (!tiles) return {};
    return tiles.reduce((acc, tile) => {
      const parentId = tile.tile_parent_id || "root";
      if (!acc[parentId]) {
        acc[parentId] = [];
      }
      acc[parentId].push(tile);
      return acc;
    }, {} as tilesByParentsIdType);
  };

  return {
    tiles: data,
    isTileSuccess: isSuccess,
    isTileLoading: isLoading,
    getTilesByParentsId,
  };
}
