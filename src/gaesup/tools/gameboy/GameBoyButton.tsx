import { controlAtom } from "@gaesup/stores/control";
import { useAtom } from "jotai";
import * as style from "./style.css";

export type gameBoyButtonType = {
  tag: "up" | "down" | "left" | "right";
  value: string;
  icon: JSX.Element;
};

export default function GameBoyButton({ tag, value, icon }: gameBoyButtonType) {
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
      className={`${style.gameBoyButtonRecipe({
        tag: tag,
      })}`}
      onMouseDown={() => onMouseDown()}
      onMouseUp={() => onMouseLeave()}
      onMouseLeave={() => onMouseLeave()}
      onContextMenu={(e) => {
        e.preventDefault();
        onMouseLeave();
      }}
      onPointerDown={(e) => onMouseDown()}
      onPointerUp={(e) => onMouseLeave()}
    >
      {icon}
    </button>
  );
}
