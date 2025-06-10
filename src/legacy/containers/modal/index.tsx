"use client";

import Cancel from "@common/cancel";
import InfoModal from "@components/modals/infoModal";
import MessageModal from "@components/modals/message";
import ObjectModal from "@components/modals/object";
import SaveRoomModal from "@components/modals/saveRoom";

import DeleteNormalModal from "@components/modals/deleteNormal";
import DeleteTileParentModal from "@components/modals/deleteTileParent";
import DeleteWallParentModal from "@components/modals/deleteWallParent";
import WriteMessage from "@components/modals/write";
import { MdCancel } from "@react-icons/all-files/md/MdCancel";
import useModal from "@store/modal";
import { createPortal } from "react-dom";
import { modalOuterRecipe, modalRecipe } from "./recipe.css";
import * as S from "./styles.css";

export default function ModalContainer() {
  const { closeModal, isOpen, type, username, gltf_url } = useModal();

  const closeOuter = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    closeModal();
  };

  const renderModalContent = () => {
    switch (type) {
      case "message":
        return <MessageModal />;
      case "write":
        return <WriteMessage />;
      case "info":
        return <InfoModal />;
      case "notify":
        return <InfoModal />;
      case "save_room":
        return <SaveRoomModal />;
      case "delete_wall_parent":
        return <DeleteWallParentModal />;
      case "delete_normal":
        return <DeleteNormalModal />;
      case "delete_tile_parent":
        return <DeleteTileParentModal />;
      case "object":
        return username && gltf_url ? (
          <ObjectModal
            username={username}
            gltf_url={gltf_url}
          />
        ) : null;
      default:
        return null;
    }
  };

  return createPortal(
    <>
      <div
        className={modalOuterRecipe({ isOpen })}
        onClick={closeOuter}></div>
      <div
        className={modalRecipe({
          isOpen,
          full: [
            "object",
            "write",
            "save_room",
            "info",
            "delete_wall_parent",
            "delete_tile_parent",
            "delete_normal",
          ].includes(type),
          half: type === "update_room",
        })}>
        <div
          className={S.cancelStyle}
          onMouseUp={closeModal}>
          <MdCancel />
        </div>
        <Cancel
          onMouseUp={closeModal}
          onClick={closeModal}
          varients={{ color: "gray" }}
        />
        {renderModalContent()}
      </div>
    </>,
    document.getElementById("modal-root") as HTMLElement
  );
}
