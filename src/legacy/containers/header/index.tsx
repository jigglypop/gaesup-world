"use client";

import AuthHeader from "@common/authHeader";
import { ET_LABS } from "@constants/url";
import useModal from "@store/modal";
import { buttonRecipe } from "@styles/recipe/button.css";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { isMobile, isTablet } from "react-device-detect";
import { Link } from "react-router-dom";
import initHeaderOptionEffect from "./option";
import * as S from "./styles.css";

export default function Headers() {
  const { openModal } = useModal();
  const { isOn, fontSize } = initHeaderOptionEffect();
  return (
    <>
      <div
        className={S.logo}
        style={assignInlineVars({
          fontSize: "6rem",
          top: "1rem",
          left: "1rem",
        })}>
        {isOn && (
          <div onClick={() => openModal({ file: 1, type: "info" })}>아그작</div>
        )}
      </div>
      {!isOn && (
        <div className={S.headerOuter}>
          <Link
            to={"/aggjack/"}
            style={assignInlineVars({ fontSize: "4rem" })}>
            아그작
          </Link>
          <AuthHeader />
        </div>
      )}
      <div
        className={S.logoRight}
        style={assignInlineVars({
          fontSize,
          top: "1rem",
          right: "1rem",
          flexDirection: "column",
        })}>
        {!isTablet && !isMobile && isOn && (
          <>
            <div
              className={`${S.leftButton} ${buttonRecipe({
                color: "blackGlass",
              })}`}
              onClick={() => {
                window.open(ET_LABS, "_blank");
              }}>
              창의그룹
            </div>
            <div
              key={"write-board"}
              className={`${S.leftButton} ${buttonRecipe({
                color: "blackGlass",
              })}`}
              onClick={() => {
                openModal({ type: "write" });
              }}>
              방명록 작성
            </div>
          </>
        )}
      </div>
    </>
  );
}
