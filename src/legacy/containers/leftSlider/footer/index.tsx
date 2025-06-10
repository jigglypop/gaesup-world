"use client";

import useGltfList from "@store/gltfList";
import { meshMap } from "@store/mesh/type";
import useModal from "@store/modal";
import { buttonRecipe } from "@styles/recipe/button.css";
import { UseMutateAsyncFunction } from "@tanstack/react-query";
import * as S from "./styles.css";

export default function EditorFooter({
  onMeshUpdate,
}: {
  onMeshUpdate?: UseMutateAsyncFunction<meshMap, Error, void, unknown>;
}) {
  const { openModal } = useModal();
  const { object_type, toName } = useGltfList();

  return (
    <div className={S.editorFooter}>
      {!onMeshUpdate ? (
        <div
          key={"save-rooms"}
          className={buttonRecipe({
            color: "pink",
            shape: "smallSquare",
          })}
          onClick={() => {
            openModal({
              type: "save_room",
            });
          }}>
          {toName[object_type]} 저장
        </div>
      ) : (
        <div
          key={"save-rooms"}
          className={buttonRecipe({
            color: "pink",
            shape: "smallSquare",
          })}
          onClick={async () => await onMeshUpdate()}>
          메쉬 요소 저장
        </div>
      )}
    </div>
  );
}
