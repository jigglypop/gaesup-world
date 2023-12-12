import { useContext } from "react";
import { GaesupToolsContext } from "../context";
import GameBoyButton, { gameBoyButtonType } from "./GameBoyButton";
import * as style from "./style.css";

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

export default function GameBoy() {
  const {
    gameboy: { gameboyStyle, gameboyInnerStyle },
  } = useContext(GaesupToolsContext);
  return (
    <div className={style.gameBoy} style={gameboyStyle}>
      <div className={style.gameBoyInner} style={gameboyInnerStyle}>
        {GameBoyDirections.map((item: gameBoyButtonType, key: number) => {
          return (
            <GameBoyButton
              key={key}
              tag={item.tag}
              value={item.value}
              icon={item.icon}
            />
          );
        })}
      </div>
    </div>
  );
}
