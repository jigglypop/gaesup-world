"use client";

import useModal from "@store/modal";
import { buttonRecipe } from "@styles/recipe/button.css";
import * as S from "./styles.css";

export default function DeleteNormalModal() {
  const { closeModal } = useModal();

  return (
    <div className={S.modalOuter}>
      <div className={S.modalInner}>
        <div className={S.modalTitle}>일반 원본 삭제하기</div>
        <div className={S.modalSubtitle}>
          기존 일반 원본을 삭제하시겠습니까?
        </div>
        <div className={S.modalButtons}>
          <div
            className={buttonRecipe({
              color: "gray",
            })}
            onClick={closeModal}>
            취소
          </div>
        </div>
      </div>
    </div>
  );
}
