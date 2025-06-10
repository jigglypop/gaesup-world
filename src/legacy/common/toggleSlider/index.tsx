import { IoIosArrowForward } from "@react-icons/all-files/io/IoIosArrowForward";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useState } from "react";
import * as S from "./styles.css";

export default function ToggleSlider({
  children,
  tag,
  widthArray = [10, 20],
  heightArray = [4, 20],
  left = true,
}: {
  children?: React.ReactNode;
  tag?: string;
  widthArray?: [number, number];
  heightArray?: [number, number];
  left?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={S.toggleSliderOuter}
      style={assignInlineVars({
        width: open ? `${widthArray[1]}rem` : `${widthArray[0]}rem`,
        height: open ? `${heightArray[1]}rem` : `${heightArray[0]}rem`,
      })}>
      <div
        className={S.sliderHeader}
        style={assignInlineVars({
          justifyContent: left ? "flex-start" : "flex-end",
        })}>
        <div
          className={S.sliderButton}
          onClick={() => setOpen(!open)}>
          <IoIosArrowForward
            style={assignInlineVars({
              transition: "all 0.2s ease-in",
              transform: open
                ? left
                  ? "rotate(180deg)"
                  : "rotate(0deg)"
                : left
                  ? "rotate(0deg)"
                  : "rotate(180deg)",
            })}
          />
        </div>
        <div className={S.sliderTag}>{tag}</div>
      </div>
      <div
        className={S.sliderInner}
        style={assignInlineVars({
          display: open ? "flex" : "none",
          height: `${heightArray[1] - 4}rem`,
        })}>
        {children}
      </div>
    </div>
  );
}
