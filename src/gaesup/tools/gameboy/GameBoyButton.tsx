import { useContext } from "react";
import { GaesupWorldContext } from "../../stores/context/gaesupworld";
import { usePushKey } from "../../stores/control";
import * as style from "./style.css";

export type gameBoyButtonType = {
  tag: "up" | "down" | "left" | "right";
  value: string;
  icon: JSX.Element;
};

export default function GameBoyButton({ tag, value, icon }: gameBoyButtonType) {
  const { gameboy } = useContext(GaesupWorldContext);

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
      style={gameboy.gameboyButtonStyle}
    >
      {icon}
    </button>
  );
}
