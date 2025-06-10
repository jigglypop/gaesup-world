import { getTileParent } from "@api/tile";
import { min } from "@constants/time";
import { useQuery } from "@tanstack/react-query";

export function useTileParentQuery() {
  const { data, isSuccess, isLoading } = useQuery({
    queryKey: ["tile_parent"],
    queryFn: getTileParent,
    staleTime: 10 * min,
  });

  return {
    tileParentResponse: data,
    tilesByParentsId: data?.tilesByParentsId,
    tileParentMap: data?.tileParentMap,
    isTileParentsLoading: isLoading,
    isTileParentsSuccess: isSuccess,
  };
}
