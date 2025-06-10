"use client";

import useGltfList from "@store/gltfList";
import useModal from "@store/modal";
import useUpdateRoom from "@store/update";
import { buttonRecipe } from "@styles/recipe/button.css";
import * as S from "./styles.css";

export default function SaveRoomModal() {
  const { closeModal } = useModal();
  const { saveRoomAll } = useUpdateRoom();
  const { object_type, toName } = useGltfList();

  return (
    <div className={S.modalOuter}>
      <div className={S.modalInner}>
        <div className={S.modalTitle}>{toName[object_type]} 상태 저장하기</div>
        <div className={S.modalSubtitle}>현재 편집을 저장하시겠습니까?</div>

        <div className={S.modalButtons}>
          <div
            className={buttonRecipe({
              color: "gray",
            })}
            onClick={closeModal}>
            취소
          </div>
          <div
            className={buttonRecipe({
              color: "green",
            })}
            onClick={() => saveRoomAll(object_type)}>
            확인
          </div>
        </div>
      </div>
    </div>
  );
}
