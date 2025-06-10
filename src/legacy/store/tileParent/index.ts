import { patchTileParent, postTileParent, removeTileParent } from "@api/tile";
import useModal from "@store/modal";
import { useToast } from "@store/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { ChangeEventHandler } from "react";
import { defaultNewTileParent, tileParentAtom } from "./atom";
import { useTileParentQuery } from "./query";
import { tileParentResponseType } from "./type";

export default function useTileParent() {
  const queryClient = useQueryClient();
  const [{ tile_parent_id, meshType, newTileParent }, setTileParent] =
    useAtom(tileParentAtom);
  const { addToast, addToastAsync } = useToast();
  const { closeModal } = useModal();
  const { tileParentMap } = useTileParentQuery();

  const { mutateAsync: onTileParentCreate } = useMutation({
    mutationKey: ["tile_parent"],
    mutationFn: async (): Promise<tileParentResponseType> => {
      const tileParents = await postTileParent(newTileParent);
      return tileParents;
    },
    onSuccess: async (res: tileParentResponseType) => {
      await queryClient.setQueryData(["tile_parent"], res);
      await queryClient.invalidateQueries({ queryKey: ["meshes"] });
      await addToastAsync({ text: "저장되었습니다." });
      closeModal();
    },
    onError: async (error) => {
      addToast({ text: "저장 실패: " + error.message });
    },
  });

  const { mutateAsync: onTileParentUpdate } = useMutation({
    mutationKey: ["tile_parent"],
    mutationFn: async (): Promise<tileParentResponseType> => {
      return await patchTileParent([newTileParent]);
    },
    onSuccess: async (res: tileParentResponseType) => {
      await queryClient.setQueryData(["tile_parent"], res);
      await queryClient.invalidateQueries({ queryKey: ["meshes"] });
      await addToastAsync({ text: "저장되었습니다." });
      closeModal();
    },
    onError: async (error) => {
      addToast({ text: "업데이트 실패: " + error.message });
    },
  });

  const { mutateAsync: onTileParentDelete } = useMutation({
    mutationKey: ["tile_parent"],
    mutationFn: async (): Promise<tileParentResponseType> => {
      const tileParents = await removeTileParent(newTileParent.tile_parent_id);
      return tileParents;
    },
    onSuccess: async (res: tileParentResponseType) => {
      await queryClient.setQueryData(["tile_parent"], res);
      await queryClient.invalidateQueries({ queryKey: ["meshes"] });
      await addToastAsync({ text: "삭제 되었습니다." });
      closeModal();
    },
    onError: async (error) => {
      addToast({ text: "삭제 실패: " + error.message });
    },
  });

  // name 바꾸기
  const onChangeName: ChangeEventHandler<HTMLInputElement> = (e) => {
    setTileParent((prev) => {
      prev.newTileParent.map_text = e.target.value;
      return {
        ...prev,
      };
    });
  };

  const selectTileParent = ({ id }: { id: string }) => {
    setTileParent((prev) => {
      prev.tile_parent_id = id;
      prev.meshType = "floor";
      if (prev.tileParents.hasOwnProperty(id)) {
        prev.newTileParent = {
          ...defaultNewTileParent,
          tile_parent_id: id,
          map_text: prev.tileParents[id].map_text,
        };
      }
      return {
        ...prev,
      };
    });
  };

  return {
    tile_parent_id,
    newTileParent,
    setTileParent,
    selectTileParent,
    onTileParentCreate,
    onTileParentUpdate,
    onTileParentDelete,
    onChangeName,
    meshType,
    tileParent: tile_parent_id ? tileParentMap?.[tile_parent_id] : null,
  };
}
