import { getMeshes } from "@api/mesh";
import { getWallParent } from "@api/wall";
import { min } from "@constants/time";
import { wallType } from "@store/wall/type";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useWallParentQuery() {
  const { data, isSuccess, isLoading } = useQuery({
    queryKey: ["wall_parent"],
    queryFn: getWallParent,
    staleTime: 10 * min,
  });
  const {} = useQuery({
    queryKey: ["meshes"],
    queryFn: getMeshes,
    staleTime: 10 * min,
  });
  const queryClient = useQueryClient();

  const updateWalls = (parentId: string, newWalls: wallType[]) => {
    queryClient.setQueryData(
      ["wall_parent"],
      (oldData: {
        wallsByParentsId: {
          [key: string]: wallType[];
        };
      }) => ({
        ...oldData,
        wallsByParentsId: {
          ...oldData.wallsByParentsId,
          [parentId]: newWalls,
        },
      })
    );
  };

  return {
    wallParentResponse: data,
    wallParentMap: data?.wallParentMap,
    wallsByParentsId: data?.wallsByParentsId,
    isWallParentsLoading: isLoading,
    isWallParentsSuccess: isSuccess,
    updateWalls,
  };
}
