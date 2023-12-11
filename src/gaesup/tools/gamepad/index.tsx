import { useContext } from "react";
import { GaesupWorldContext } from "../../stores/context/gaesupworld";
import GamePadButton from "./GamePadButton";
import * as style from "./style.css";

type gameBoyDirectionType = {
  tag: string;
  value: string;
  icon: JSX.Element;
};

export default function GamePad() {
  const { control } = useContext(GaesupWorldContext);
  const { mode } = useContext(GaesupWorldContext);
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
        !(item.tag === "run" && mode.controller === "joystick")
    );

  return (
    <div className={style.gamePad}>
      {GamePadDirections.map((item: gameBoyDirectionType, key: number) => {
        return <GamePadButton key={key} value={item.value} />;
      })}
    </div>
  );
}
