import { useState } from "react";

import { assignInlineVars } from "@vanilla-extract/dynamic";
import { usePushKey } from "../pushKey/index.js";
import { VECssType } from "../type.js";
import * as style from "./style.css";

export default function GamePadButton({
  value,
  name,
  gamepadButtonStyle,
}: {
  value: string;
  name: string;
  gamepadButtonStyle: VECssType;
}) {
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
      style={assignInlineVars(gamepadButtonStyle)}
    >
      {name}
    </button>
  );
}
