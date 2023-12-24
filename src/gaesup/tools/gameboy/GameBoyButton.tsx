import { assignInlineVars } from "@vanilla-extract/dynamic";
import { usePushKey } from "../pushKey/index.js";
import { VECssType } from "../type.js";
import * as style from "./style.css";

export type gameBoyButtonType = {
  tag: "up" | "down" | "left" | "right";
  value: string;
  icon: JSX.Element;
  gameboyButtonStyle: Partial<VECssType>;
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
      style={assignInlineVars(gameboyButtonStyle)}
    >
      {icon}
    </button>
  );
}
