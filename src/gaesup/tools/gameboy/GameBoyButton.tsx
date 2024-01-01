import { CSSProperties } from "react";
import { usePushKey } from "../pushKey/index.js";
import "./style.css";

export type gameBoyButtonType = {
  tag: "up" | "down" | "left" | "right";
  value: string;
  icon: JSX.Element;
  gameboyButtonStyle: CSSProperties;
};

export default function GameBoyButton({
  tag,
  value,
  icon,
  gameboyButtonStyle,
}: gameBoyButtonType) {
  const { pushKey } = usePushKey();

  const onMouseDown = () => {
    pushKey(value, true);
  };

  const onMouseLeave = () => {
    pushKey(value, false);
  };

  return (
    <button
      className={`gameboy-button ${tag}`}
      onMouseDown={() => onMouseDown()}
      onMouseUp={() => onMouseLeave()}
      onMouseLeave={() => onMouseLeave()}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      onPointerDown={() => onMouseDown()}
      onPointerUp={() => onMouseLeave()}
      style={gameboyButtonStyle}
    >
      {icon}
    </button>
  );
}
