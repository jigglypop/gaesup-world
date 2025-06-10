import { patchMesh } from "@api/mesh";
import { meshMap } from "@store/mesh/type";
import useModal from "@store/modal";
import { useToast } from "@store/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useMesh from ".";

export default function useMeshQuery() {
  const queryClient = useQueryClient();
  const { meshes, current_id } = useMesh();
  const { addToast, addToastAsync } = useToast();
  const { closeModal } = useModal();

  const { mutateAsync: onMeshsUpdate } = useMutation({
    mutationKey: ["meshes"],
    mutationFn: async (): Promise<meshMap> => {
      if (!current_id) throw Error("업데이트할 대상이 없습니다.");
      const mesh = meshes?.[current_id];
      if (!mesh) throw Error("업데이트할 대상이 없습니다.");
      mesh.material = mesh.material.toString().toUpperCase();
      mesh.map_texture_url = mesh.map_texture_url || "";
      mesh.normal_texture_url = mesh.normal_texture_url || "";
      return await patchMesh(mesh);
    },
    onSuccess: async (res: meshMap) => {
      await queryClient.setQueryData(["meshes"], res);
      await addToastAsync({ text: "업데이트되었습니다." });
      closeModal();
    },
    onError: async (error) => {
      addToast({ text: "업데이트 실패: " + error.message });
    },
  });

  return {
    onMeshsUpdate,
    meshes,
    current_id,
  };
}
