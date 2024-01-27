import { assignInlineVars } from "@vanilla-extract/dynamic";
import { CSSProperties, MouseEvent, useState } from "react";
import * as style from "./style.css";

export const Icon = ({
  children,
  ToolTip,
  onClick,
  id,
  toolTipStyles,
  iconStyle,
}: {
  children: JSX.Element;
  ToolTip: JSX.Element;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  id?: string;
  toolTipStyles?: { [K in keyof CSSProperties]: string };
  iconStyle?: { [K in keyof CSSProperties]: string };
}) => {
  const [closet, setCloset] = useState(true);
  return (
    <div
      className={style.icon}
      onMouseOver={() => setCloset(false)}
      onMouseLeave={() => setCloset(true)}
      onClick={(e) => {
        onClick && onClick(e);
      }}
      style={assignInlineVars({
        ...iconStyle,
      })}
      id={id}
    >
      <div className={style.iconInner}>{children}</div>
      <div
        className={style.tooltip}
        style={assignInlineVars({
          opacity: closet ? "0" : "1",
          ...toolTipStyles,
        })}
      >
        {ToolTip}
      </div>
    </div>
  );
};
