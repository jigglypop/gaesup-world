import { useContext, useState } from "react";

import { GaesupToolsContext } from "../context.js";
import { usePushKey } from "../pushKey/index.js";
import * as style from "./style.css";

export default function GamePadButton({
  value,
  name,
}: {
  value: string;
  name: string;
}) {
  const {
    gamepad: { gamepadButtonStyle },
  } = useContext(GaesupToolsContext);
  const [isClicked, setIsClicked] = useState(false);
  const { pushKey } = usePushKey();

  const onMouseDown = () => {
    pushKey(value, true);
    setIsClicked(true);
  };

  const onMouseLeave = () => {
    pushKey(value, false);
    setIsClicked(false);
  };

  return (
    <button
      className={style.padButton({
        isClicked: isClicked,
      })}
      onMouseDown={() => onMouseDown()}
      onMouseUp={() => onMouseLeave()}
      onMouseLeave={() => onMouseLeave()}
      onContextMenu={(e) => {
        e.preventDefault();
        onMouseLeave();
      }}
      onPointerDown={() => onMouseDown()}
      onPointerUp={() => onMouseLeave()}
      style={gamepadButtonStyle}
    >
      {name}
    </button>
  );
}
