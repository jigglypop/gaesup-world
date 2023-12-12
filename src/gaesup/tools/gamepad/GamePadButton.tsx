import { useContext, useState } from "react";
import { usePushKey } from "../../stores/control";
import { GaesupToolsContext } from "../context";
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
      className={`${style.padButton({
        isClicked: isClicked,
      })}`}
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
