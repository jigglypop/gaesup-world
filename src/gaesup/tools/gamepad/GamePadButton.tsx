import { CSSProperties, useState } from "react";

import { usePushKey } from "../pushKey/index.js";
import "./style.css";

export default function GamePadButton({
  value,
  name,
  gamePadButtonStyle,
}: {
  value: string;
  name: string;
  gamePadButtonStyle: CSSProperties;
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
      className={`padButton ${isClicked ? "isClicked" : ""}`}
      onMouseDown={() => onMouseDown()}
      onMouseUp={() => onMouseLeave()}
      onMouseLeave={() => onMouseLeave()}
      onContextMenu={(e) => {
        e.preventDefault();
        onMouseLeave();
      }}
      onPointerDown={() => onMouseDown()}
      onPointerUp={() => onMouseLeave()}
      style={gamePadButtonStyle}
    >
      {name}
    </button>
  );
}
