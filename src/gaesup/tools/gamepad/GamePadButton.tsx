import { usePushKey } from "../../stores/control";
import * as style from "./style.css";

export default function GamePadButton({ value }: { value: string }) {
  const { pushKey } = usePushKey();

  const onMouseDown = () => {
    pushKey(value, true);
  };

  const onMouseLeave = () => {
    pushKey(value, false);
  };

  return (
    <button
      className={`${style.gamePadButtonRecipe}`}
      onMouseDown={() => onMouseDown()}
      onMouseUp={() => onMouseLeave()}
      onMouseLeave={() => onMouseLeave()}
      onContextMenu={(e) => {
        e.preventDefault();
        onMouseLeave();
      }}
      onPointerDown={() => onMouseDown()}
      onPointerUp={() => onMouseLeave()}
    >
      {value}
    </button>
  );
}
