"use client";

import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import { controlAtom } from "../stores/control";
import { optionsAtom } from "../stores/options";
import GameBoy from "./gameboy";
import GamePad from "./gamepad";
import JoyStick from "./joystick";
import JumpPoint from "./jumpPoint";
import KeyBoardToolTip from "./keyBoardToolTip";
import MiniMap from "./minimap";
import * as style from "./style.css";
export default function GaeSupTools({
  keyboardMap,
}: {
  keyboardMap: { name: string; keys: string[] }[];
}) {
  const options = useAtomValue(optionsAtom);
  const [control, setControl] = useAtom(controlAtom);
  const { controllerType } = options;
  useEffect(() => {
    const keyboard = keyboardMap.reduce((maps, keyboardMapItem) => {
      maps[keyboardMapItem.name] = false;
      return maps;
    }, {});
    setControl((control) => ({
      ...Object.assign(control, keyboard),
    }));
  }, []);
  return (
    <>
      <div className={style.footer}>
        <div className={style.footerUpper}>
          {(controllerType === "joystick" || controllerType === "gameboy") && (
            <GamePad />
          )}
        </div>
        <div className={style.footerLower}>
          {controllerType === "joystick" && <JoyStick />}
          {controllerType === "gameboy" && <GameBoy />}
          {controllerType === "keyboard" && (
            <KeyBoardToolTip keyboardMap={keyboardMap} />
          )}
          {options.minimap && <MiniMap />}
        </div>
      </div>

      <JumpPoint />
    </>
  );
}
