import { useContext } from "react";

import { assignInlineVars } from "@vanilla-extract/dynamic";
import { GaesupWorldContext } from "../../world/context/index.js";
import GamePadButton from "./GamePadButton.js";
import * as style from "./style.css";
import { gamepadType } from "./type.js";

type gameBoyDirectionType = {
  tag: string;
  value: string;
  name: string;
  icon: JSX.Element;
};

export function GamePad(props: gamepadType) {
  const { gamepadStyle, gamepadGridStyle, gamepadButtonStyle, label } = props;
  const { control, mode } = useContext(GaesupWorldContext);
  const GamePadDirections = Object.keys(control)
    .map((key) => {
      const name = label?.[key] || key;
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
    <>
      {(mode.controller === "joystick" || mode.controller === "gameboy") && (
        <div className={style.gamePad} style={assignInlineVars(gamepadStyle)}>
          <div
            className={style.gamePadGrid}
            style={assignInlineVars(gamepadGridStyle)}
          >
            {GamePadDirections.map(
              (item: gameBoyDirectionType, key: number) => {
                return (
                  <GamePadButton
                    key={key}
                    value={item.value}
                    name={item.name}
                    gamepadButtonStyle={gamepadButtonStyle}
                  />
                );
              }
            )}
          </div>
        </div>
      )}
    </>
  );
}
