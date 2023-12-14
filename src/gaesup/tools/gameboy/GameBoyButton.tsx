import { useContext } from "react";

import { GaesupToolsContext } from "../context.js";
import { usePushKey } from "../pushKey/index.js";
import * as style from "./style.css";

export type gameBoyButtonType = {
  tag: "up" | "down" | "left" | "right";
  value: string;
  icon: JSX.Element;
};

export default function GameBoyButton({ tag, value, icon }: gameBoyButtonType) {
  const {
    gameboy: { gameboyButtonStyle },
  } = useContext(GaesupToolsContext);

  const { pushKey } = usePushKey();

  const onMouseDown = () => {
    pushKey(value, true);
  };

  const onMouseLeave = () => {
    pushKey(value, false);
  };

  return (
    <button
      className={`${style.gameBoyButtonRecipe({
        tag: tag,
        direction: tag,
      })}`}
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
