import { controlAtom } from "@gaesup/stores/control";
import { useAtom } from "jotai";
import * as style from "./style.css";

export type gamePadButtonType = {
  tag: string;
  value: string;
};

export default function GamePadButton({ tag, value }: gamePadButtonType) {
  const [control, setControl] = useAtom(controlAtom);

  const pushKey = (key: string, value: boolean) => {
    setControl((control) => ({
      ...control,
      [key]: value,
    }));
  };

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
