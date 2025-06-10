"use client";

import { FaArrowCircleUp } from "@react-icons/all-files/fa/FaArrowCircleUp";
import { useJumpPoint } from "@store/jumpPoint";
import usePortal from "@store/portal";
import { useToast } from "@store/toast";
import { convertV3 } from "@utils/convertor";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useTeleport } from "gaesup-world";
import * as S from "./styles.css";

export default function Moving() {
  const { Teleport } = useTeleport();
  const { jumpPoint, toggleJumpPoints, setJumpPoint } = useJumpPoint();
  const { portals } = usePortal();
  const { addToast } = useToast();
  return (
    <>
      <div className={S.header}>
        <div
          className={S.headerInner}
          style={assignInlineVars({
            width: jumpPoint.on ? "16rem" : "30rem",
            height: jumpPoint.on ? "4.5rem" : "40rem",
            background: jumpPoint.on
              ? "rgba(0, 0, 0, 0.8)"
              : "rgba(255, 255, 255, 0.2)",
            boxShadow: jumpPoint.on
              ? "0 0 10px rgba(0, 0, 0, 0.8)"
              : "0 0 10px rgba(255, 255, 255, 0.2)",
            cursor: "pointer",
          })}>
          {
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
          }
          {portals &&
            portals.map((portal) => {
              const toast_text = `장소 이동 (${portal.title})`;
              return (
                <div
                  className={S.button}
                  onClick={() => {
                    setJumpPoint((_jumpPoint) => ({
                      ..._jumpPoint,
                      on: true,
                    }));
                    Teleport(convertV3(portal.position));
                    addToast({ text: toast_text });
                  }}
                  style={assignInlineVars({
                    display: jumpPoint.on ? "none" : "flex",
                  })}
                  key={portal.title}>
                  {portal.title}
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}
