import { useContext } from "react";

import { GaesupWorldContext } from "../../world/context/index.js";
import { GaesupToolsContext } from "../context.js";
import GamePadButton from "./GamePadButton.js";
import * as style from "./style.css";

type gameBoyDirectionType = {
  tag: string;
  value: string;
  name: string;
  icon: JSX.Element;
};

export default function GamePad() {
  const {
    gamepad: { gamepadStyle, gamepadGridStyle },
    keyboardToolTip: { keyBoardLabel },
  } = useContext(GaesupToolsContext);
  const { control, mode } = useContext(GaesupWorldContext);
  const GamePadDirections = Object.keys(control)
    .map((key) => {
      const name = keyBoardLabel?.[key] || key;
      if (
        key !== "forward" &&
        key !== "backward" &&
        key !== "leftward" &&
        key !== "rightward"
      )
        return {
          tag: key,
          value: key,
          name: name,
        };
    })
    .filter((item) => item !== undefined)
    .filter(
      (item: gameBoyDirectionType) =>
        !(item.tag === "run" && mode.controller === "joystick")
    );

  return (
    <div
      className={style.gamePad}
      // style={gamepadStyle}
    >
      <div
        className={style.gamePadGrid}
        // style={gamepadGridStyle}
      >
        {GamePadDirections.map((item: gameBoyDirectionType, key: number) => {
          return (
            <GamePadButton key={key} value={item.value} name={item.name} />
          );
        })}
      </div>
    </div>
  );
}
