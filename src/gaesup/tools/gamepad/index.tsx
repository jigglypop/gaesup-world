import { controlAtom } from "@gaesup/stores/control";
import { optionsAtom } from "@gaesup/stores/options";
import { BiDownArrow } from "@react-icons/all-files/bi/BiDownArrow";
import { BiLeftArrow } from "@react-icons/all-files/bi/BiLeftArrow";
import { BiRightArrow } from "@react-icons/all-files/bi/BiRightArrow";
import { BiUpArrow } from "@react-icons/all-files/bi/BiUpArrow";
import { useAtom, useAtomValue } from "jotai";
import GamePadButton from "./GamePadButton";
import * as style from "./style.css";

type gameBoyDirectionType = {
  tag: string;
  value: string;
  icon: JSX.Element;
};

export const GameBoyDirections = [
  {
    tag: "up",
    value: "forward",
    icon: <BiUpArrow />,
  },
  { tag: "down", value: "backward", icon: <BiDownArrow /> },
  { tag: "left", value: "leftward", icon: <BiLeftArrow /> },
  { tag: "right", value: "rightward", icon: <BiRightArrow /> },
];

export default function GamePad() {
  const [control, setControl] = useAtom(controlAtom);
  const options = useAtomValue(optionsAtom);
  const GamePadDirections = Object.keys(control)
    .map((key) => {
      if (
        key !== "forward" &&
        key !== "backward" &&
        key !== "leftward" &&
        key !== "rightward"
      )
        return {
          tag: key,
          value: key,
        };
    })
    .filter((item) => item !== undefined)
    .filter(
      (item: gameBoyDirectionType) =>
        !(item.tag === "run" && options.controllerType === "joystick")
    );

  return (
    <div className={style.gamePad}>
      {GamePadDirections.map((item: gameBoyDirectionType, key: number) => {
        return <GamePadButton key={key} value={item.value} />;
      })}
    </div>
  );
}
