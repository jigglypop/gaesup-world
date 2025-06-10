"use client";

import AuthHeader from "@common/authHeader";
import { ET_LABS } from "@constants/url";
import { FaArrowCircleUp } from "@react-icons/all-files/fa/FaArrowCircleUp";
import { useJumpPoint } from "@store/jumpPoint";
import useModal from "@store/modal";
import { useToast } from "@store/toast";
import { buttonRecipe } from "@styles/recipe/button.css";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useTeleport } from "gaesup-world";
import { isMobile, isTablet } from "react-device-detect";
import { Link } from "react-router-dom";
import initHeaderOptionEffect from "./option";
import * as S from "./styles.css";

export default function Headers() {
  const { Teleport } = useTeleport();
  const { jumpPoint, toggleJumpPoints, setJumpPoint } = useJumpPoint();
  const { addToast } = useToast();
  const { openModal } = useModal();
  const { isOn, fontSize, size } = initHeaderOptionEffect();
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
                color: "sunrise",
              })}`}
              onClick={() => {
                window.open(ET_LABS, "_blank");
              }}>
              창의그룹
            </div>
            <div
              key={"write-board"}
              className={`${S.leftButton} ${buttonRecipe({
                color: "sunrise",
              })}`}
              onClick={() => {
                openModal({ type: "write" });
              }}>
              방명록 작성
            </div>
          </>
        )}
      </div>

      <div className={S.header}>
        <div
          className={S.headerInner}
          style={assignInlineVars({
            width: jumpPoint.on
              ? "16rem"
              : size > 1024
                ? "30rem"
                : size > 768
                  ? "28rem"
                  : "28rem",
            height: jumpPoint.on ? "4.5rem" : "26rem",
            background: jumpPoint.on
              ? "rgba(0, 0, 0, 0.8)"
              : "rgba(255, 255, 255, 0.2)",
            boxShadow: jumpPoint.on
              ? "0 0 10px rgba(0, 0, 0, 0.8)"
              : "0 0 10px rgba(255, 255, 255, 0.2)",
            cursor: "pointer",
          })}>
          <h2
            className={`${S.buttonText}`}
            onClick={toggleJumpPoints}>
            바로 이동하기
            <FaArrowCircleUp
              className={S.arrow}
              style={assignInlineVars({
                transform: jumpPoint.on ? "rotate(180deg)" : "rotate(0deg)",
                color: jumpPoint.on
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(0, 0, 0, 0.7)",
                textShadow: jumpPoint.on
                  ? "0 0 10px rgba(255, 255, 255, 0.7)"
                  : "0 0 10px rgba(0, 0, 0, 0.7)",
              })}
            />
          </h2>
          {jumpPoint.points &&
            Object.keys(jumpPoint.points).map((key) => {
              const toast_text = `장소 이동 (${jumpPoint.points[key].tag})`;
              return (
                <div
                  className={S.button}
                  onClick={() => {
                    setJumpPoint((_jumpPoint) => ({
                      ..._jumpPoint,
                      on: true,
                    }));
                    Teleport(jumpPoint.points[key].position);
                    addToast({ text: toast_text });
                  }}
                  style={assignInlineVars({
                    display: jumpPoint.on ? "none" : "flex",
                  })}
                  key={key}>
                  {key}
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}
