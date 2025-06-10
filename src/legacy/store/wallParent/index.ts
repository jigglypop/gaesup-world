import { patchWallParent, postWallParent, removeWallParent } from "@api/wall";
import useModal from "@store/modal";
import { useToast } from "@store/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { ChangeEventHandler } from "react";
import { defaultNewWallParent, wallParentAtom } from "./atom";
import { useWallParentQuery } from "./query";
import { wallParentResponseType } from "./type";

export default function useWallParent() {
  const queryClient = useQueryClient();
  const [
    { wall_parent_id, wallParents, meshType, newWallParent },
    setWallParent,
  ] = useAtom(wallParentAtom);
  const { addToast, addToastAsync } = useToast();
  const { closeModal } = useModal();
  const { wallParentMap } = useWallParentQuery();

  const { mutateAsync: onWallParentCreate } = useMutation({
    mutationKey: ["wall_parent"],
    mutationFn: async (): Promise<wallParentResponseType> => {
      const wallParentRequest = {
        name: newWallParent.name,
      };
      const wallParents = await postWallParent(wallParentRequest);
      return wallParents;
    },
    onSuccess: async (res: wallParentResponseType) => {
      await queryClient.setQueryData(["wall_parent"], res);
      await queryClient.invalidateQueries({
        queryKey: ["meshes"],
      });
      await addToastAsync({ text: "저장되었습니다." });
      closeModal();
    },
    onError: async (error) => {
      addToast({ text: "저장 실패: " + error.message });
    },
  });

  const { mutateAsync: onWallParentUpdate } = useMutation({
    mutationKey: ["wall_parent"],
    mutationFn: async (): Promise<wallParentResponseType> => {
      return await patchWallParent([newWallParent]);
    },
    onSuccess: async (res: wallParentResponseType) => {
      await queryClient.setQueryData(["wall_parent"], res);
      await queryClient.invalidateQueries({
        queryKey: ["meshes"],
      });
      await addToastAsync({ text: "저장되었습니다." });
      closeModal();
    },
    onError: async (error) => {
      addToast({ text: "업데이트 실패: " + error.message });
    },
  });

  const { mutateAsync: onWallParentDelete } = useMutation({
    mutationKey: ["wall_parent"],
    mutationFn: async (): Promise<wallParentResponseType> => {
      const wallParents = await removeWallParent(wall_parent_id);
      return wallParents;
    },
    onSuccess: async (res: wallParentResponseType) => {
      await queryClient.setQueryData(["wall_parent"], res);
      await queryClient.invalidateQueries({
        queryKey: ["meshes"],
      });
      await addToastAsync({ text: `삭제 되었습니다.` });
      closeModal();
    },
    onError: async (error) => {
      addToast({ text: "삭제 실패: " + error.message });
    },
  });

  // name 바꾸기
  const onChangeName: ChangeEventHandler<HTMLInputElement> = (e) => {
    setWallParent((prev) => {
      prev.newWallParent.name = e.target.value;
      return {
        ...prev,
      };
    });
  };

  const selectWallParent = ({ id }: { id: string }) => {
    setWallParent((prev) => {
      prev.wall_parent_id = id;
      prev.meshType = "front";
      if (prev.wallParents.hasOwnProperty(id)) {
        prev.newWallParent = {
          ...defaultNewWallParent,
          wall_parent_id: id,
          name: prev.wallParents[id].name,
        };
      }
      return {
        ...prev,
      };
    });
  };

  const getWallParent = (id: number) => {
    return wallParents[id];
  };

  return {
    wall_parent_id,
    newWallParent,
    setWallParent,
    selectWallParent,
    onWallParentCreate,
    wallParents,
    onWallParentUpdate,
    onWallParentDelete,
    onChangeName,
    meshType,
    getWallParent,
    wallParent:
      wall_parent_id && wallParentMap ? wallParentMap[wall_parent_id] : null,
  };
}
