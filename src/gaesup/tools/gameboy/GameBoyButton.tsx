import { useAtom } from "jotai";
import { controlAtom } from "../../stores/control";
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
      }}
      onPointerDown={() => onMouseDown()}
      onPointerUp={() => onMouseLeave()}
    >
      {icon}
    </button>
  );
}
