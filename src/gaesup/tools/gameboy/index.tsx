import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context";
import GameBoyButton, { gameBoyButtonType } from "./GameBoyButton";
import "./style.css";
import { gameboyType } from "./type";

export const GameBoyDirections = [
  {
    tag: "up",
    value: "forward",
    icon: <></>,
  },
  { tag: "down", value: "backward", icon: <></> },
  { tag: "left", value: "leftward", icon: <></> },
  { tag: "right", value: "rightward", icon: <></> },
];

export function GameBoy(props: gameboyType) {
  const { mode } = useContext(GaesupWorldContext);
  const { gameboyStyle, gameboyButtonStyle } = props;

  return (
    <>
      {mode.controller === "gameboy" && (
        <div className="gameboy" style={gameboyStyle}>
          {GameBoyDirections.map((item: gameBoyButtonType, key: number) => {
            return (
              <GameBoyButton
                key={key}
                tag={item.tag}
                value={item.value}
                icon={item.icon}
                gameboyButtonStyle={gameboyButtonStyle}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
