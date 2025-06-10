import { getMeshes } from "@api/mesh";
import { minute } from "@constants/time";
import { meshAtom } from "@store/mesh/atom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useCallback } from "react";
import { meshType } from "./type";

export default function useMesh() {
  const { data: meshes } = useQuery({
    queryKey: ["meshes"],
    queryFn: getMeshes,
    staleTime: 10 * minute,
  });
  const queryClient = useQueryClient();
  const [mesh, setMesh] = useAtom(meshAtom);
  const [{ current_id, mesh_list }] = useAtom(meshAtom);

  // setCurrentId
  const setCurrentId = (id: string | null) => {
    setMesh((prev) => {
      if (id === null || !meshes?.hasOwnProperty(id)) {
        prev.current_id = null;
        return {
          ...prev,
        };
      } else {
        prev.current_id = id;
        return {
          ...prev,
        };
      }
    });
  };

  // 탭네임 선택하기
  const selectTapName = useCallback(
    (name: "기존" | "신규") => {
      setMesh((prev) => {
        prev.tapName = name;
        prev.current_id = null;
        return {
          ...prev,
        };
      });
    },
    [setMesh]
  );

  // 현재 선택된 메쉬 가져오기
  const getCurrentMesh = (mesh_id: string) => {
    if (!meshes?.hasOwnProperty(mesh_id)) return null;
    setMesh((prev) => {
      prev.current_id = mesh_id;
      prev.current = { ...meshes[mesh_id] };
      return {
        ...prev,
      };
    });
    return meshes[mesh_id];
  };

  // 현재 선택된 메쉬만 편집하기
  const getIdAndUpdateAsync = async (mesh_id: string, mesh: meshType) => {
    if (meshes?.hasOwnProperty(mesh_id)) meshes[mesh_id] = mesh;
    return meshes?.[mesh_id];
  };
  // 현재 선택된 메쉬 편집하기
  const onMeshUpdateAtom = useCallback(
    (newMesh: Partial<meshType>) => {
      const mesh_id = mesh.current_id;
      if (!mesh_id) return;
      if (meshes?.hasOwnProperty(mesh_id)) {
        const oldMesh = meshes[mesh_id];
        meshes[mesh_id] = {
          ...oldMesh,
          ...newMesh,
        };
        queryClient.setQueryData(
          ["meshes"],
          (prev: { [key: string]: meshType }) => {
            return {
              ...prev,
              [mesh_id]: { ...meshes[mesh_id] },
            };
          }
        );
        setMesh((prev) => {
          prev.current = { ...meshes[mesh_id] };
          return {
            ...prev,
          };
        });
      }
    },
    [queryClient, setMesh, meshes, current_id]
  );

  const setMeshList = useCallback(
    (mesh_list: { [key: string]: string }) => {
      setMesh((prev) => {
        prev.mesh_list = mesh_list;
        return {
          ...prev,
        };
      });
    },
    [setMesh]
  );

  return {
    setCurrentId,
    getCurrentMesh,
    setMeshList,
    setMesh,
    mesh: meshes?.current,
    meshes,
    current_id,
    onMeshUpdateAtom,
    getIdAndUpdateAsync,
    selectTapName,
    mesh_list,
  };
}
