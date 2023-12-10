"use client";

import { useContext, useEffect } from "react";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../stores/context";
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
  const { minimap, mode } = useContext(GaesupWorldContext);
  const { control } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  useEffect(() => {
    const keyboard = keyboardMap.reduce((maps, keyboardMapItem) => {
      maps[keyboardMapItem.name] = false;
      return maps;
    }, {});
    const assignedControl = Object.assign(control, keyboard);
    // setControl((control) => ({
    //   ...Object.assign(control, keyboard),
    // }));
    dispatch({
      type: "update",
      payload: {
        control: {
          ...assignedControl,
        },
      },
    });
  }, []);

  return (
    <>
      <div className={style.footer}>
        <div className={style.footerUpper}>
          {(mode.controller === "joystick" ||
            mode.controller === "gameboy") && <GamePad />}
        </div>
        <div className={style.footerLower}>
          {mode.controller === "joystick" && <JoyStick />}
          {mode.controller === "gameboy" && <GameBoy />}
          {mode.controller === "keyboard" && (
            <KeyBoardToolTip keyboardMap={keyboardMap} />
          )}
          {minimap.on && <MiniMap />}
        </div>
      </div>

      <JumpPoint />
    </>
  );
}
