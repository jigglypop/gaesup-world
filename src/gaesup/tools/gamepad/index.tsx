import { BiDownArrow } from "@react-icons/all-files/bi/BiDownArrow";
import { BiLeftArrow } from "@react-icons/all-files/bi/BiLeftArrow";
import { BiRightArrow } from "@react-icons/all-files/bi/BiRightArrow";
import { BiUpArrow } from "@react-icons/all-files/bi/BiUpArrow";
import { useContext } from "react";
import { GaesupWorldContext } from "../../stores/context";

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
    <></>
    // <div className={style.gamePad}>
    //   {GamePadDirections.map((item: gameBoyDirectionType, key: number) => {
    //     return <GamePadButton key={key} value={item.value} />;
    //   })}
    // </div>
  );
}
