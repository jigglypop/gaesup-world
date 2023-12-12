import { Dispatch } from "react";
import { gameboyType } from "./gameboy/type";
import { gamepadType } from "./gamepad/type";
import { joyStickType } from "./joystick/type";
import { keyBoardToolTipType } from "./keyBoardToolTip/type";
import { minimapType } from "./minimap/type";

export type keyboardMapType = { name: string; keys: string[] }[];
export type gaesupToolsPropType = {
  keyboardToolTip: keyBoardToolTipType;
  joystick: joyStickType;
  minimap: minimapType;
  gameboy: gameboyType;
  gamepad: gamepadType;
};

export type dispatchType<T> = Dispatch<{
  type: string;
  payload?: Partial<T>;
}>;

export type gaesupToolsPartialPropType = Partial<gaesupToolsPropType>;
export type gaesupDisptachType = Dispatch<{
  type: string;
  payload?: Partial<gaesupToolsPropType>;
}>;
