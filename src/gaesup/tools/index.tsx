import { useContext, useMemo, useReducer } from "react";
import { GaesupWorldContext } from "../world/context";
import { GaesupToolsContext, GaesupToolsDispatchContext } from "./context";
import GameBoy from "./gameboy";
import { gameboyDefault } from "./gameboy/default";
import GamePad from "./gamepad";
import { gamepadDefault } from "./gamepad/default";
import JoyStick from "./joystick";
import { joyStickDefault } from "./joystick/default";
import KeyBoardToolTip from "./keyBoardToolTip";
import { keyboardToolTipDefault } from "./keyBoardToolTip/default";
import MiniMap from "./minimap";
import { minimapDefault } from "./minimap/default";
import { gaesupToolsReducer } from "./reducer";
import * as style from "./style.css";
import { gaesupToolsPartialPropType } from "./type";
export function GaeSupTools({
  keyboardToolTip,
  joystick,
  minimap,
  gameboy,
  gamepad,
}: gaesupToolsPartialPropType) {
  const worldContext = useContext(GaesupWorldContext);
  const { mode } = worldContext;

  const [tools, toolsDispatch] = useReducer(gaesupToolsReducer, {
    keyboardToolTip: Object.assign(
      keyboardToolTipDefault,
      keyboardToolTip || {}
    ),
    joystick: Object.assign(joyStickDefault, joystick || {}),
    minimap: Object.assign(minimapDefault, minimap || {}),
    gameboy: Object.assign(gameboyDefault, gameboy || {}),
    gamepad: Object.assign(gamepadDefault, gamepad || {}),
  });

  const gaesupTool = useMemo(
    () => ({
      value: tools,
      dispatch: toolsDispatch,
    }),
    [
      tools.keyboardToolTip,
      tools.joystick,
      tools.minimap,
      tools.gameboy,
      tools.gamepad,
    ]
  );

  return (
    <GaesupToolsContext.Provider value={gaesupTool.value}>
      <GaesupToolsDispatchContext.Provider value={gaesupTool.dispatch}>
        <div className={style.footer}>
          <div className={style.footerUpper}>
            {(mode.controller === "joystick" ||
              mode.controller === "gameboy") &&
              gaesupTool.value.gamepad.on && <GamePad />}
          </div>
          <div className={style.footerLower}>
            {mode.controller === "joystick" && gaesupTool.value.joystick.on && (
              <JoyStick />
            )}
            {mode.controller === "gameboy" && gaesupTool.value.gameboy.on && (
              <GameBoy />
            )}
            {mode.controller === "keyboard" &&
              gaesupTool.value.keyboardToolTip.on && <KeyBoardToolTip />}
            {gaesupTool.value.minimap.on && <MiniMap />}
          </div>
        </div>

        {/* <JumpPoint /> */}
      </GaesupToolsDispatchContext.Provider>
    </GaesupToolsContext.Provider>
  );
}
