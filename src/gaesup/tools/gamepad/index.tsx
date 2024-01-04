import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context";
import GamePadButton from "./GamePadButton";
import "./style.css";
import { gamepadType } from "./type";

type gameBoyDirectionType = {
  tag: string;
  value: string;
  name: string;
  icon: JSX.Element;
};

export const gamepadDefault = {
  on: true,
};

export function GamePad(props: gamepadType) {
  const { gamePadStyle, gamePadButtonStyle, label } = props;
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
        <div className="gamePad" style={gamePadStyle}>
          {GamePadDirections.map((item: gameBoyDirectionType, key: number) => {
            return (
              <GamePadButton
                key={key}
                value={item.value}
                name={item.name}
                gamePadButtonStyle={gamePadButtonStyle}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
