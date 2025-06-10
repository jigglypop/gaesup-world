"use client";

import useModal from "@store/modal";
import useWallParent from "@store/wallParent";
import { buttonRecipe } from "@styles/recipe/button.css";
import * as S from "./styles.css";

export default function DeleteWallParentModal() {
  const { closeModal } = useModal();
  const { onWallParentDelete } = useWallParent();

  return (
    <div className={S.modalOuter}>
      <div className={S.modalInner}>
        <div className={S.modalTitle}>삭제하기</div>
        <div className={S.modalSubtitle}>기존 벽 원본을 삭제하시겠습니까?</div>
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
            onClick={async () => await onWallParentDelete()}>
            확인
          </div>
        </div>
      </div>
    </div>
  );
}
