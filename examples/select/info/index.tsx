"use client";

import { useContext, useEffect } from "react";
import { V3 } from "../../../src";
import { useZoom } from "../../../src/gaesup/tools/zoomButton";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../../src/gaesup/world/context";
import { Icon } from "../icon";
import * as style from "./style.css";
// FaCarSide lazy loading

export default function Info() {
  const { mode, activeState } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { setZoom, isZoom } = useZoom();

  const setType = (type: "character" | "vehicle" | "airplane") => {
    dispatch({
      type: "update",
      payload: {
        mode: {
          ...mode,
          type: type,
          control: "orbit",
        },
      },
    });
  };

  const setController = (controller: "keyboard" | "joystick" | "gameboy") => {
    dispatch({
      type: "update",
      payload: {
        mode: {
          ...mode,
          controller,
        },
      },
    });
  };

  const setControl = (control: "orbit" | "normal") => {
    dispatch({
      type: "update",
      payload: {
        mode: {
          ...mode,
          control,
        },
      },
    });
  };

  useEffect(() => {
    setTimeout(async () => {
      await setZoom(V3(7, 2, 7), true);
    }, 1000);
  }, []);

  return (
    <div className={style.infoStyle}>
      <Icon
        ToolTip={
          <>
            <p
              className={style.pRecipe({ selected: mode.type === "character" })}
              onClick={() => setType("character")}
            >
              character
            </p>
            <p
              className={style.pRecipe({ selected: mode.type === "vehicle" })}
              onClick={() => setType("vehicle")}
            >
              vehicle
            </p>
            <p
              className={style.pRecipe({ selected: mode.type === "airplane" })}
              onClick={() => setType("airplane")}
            >
              airplane
            </p>
          </>
        }
        toolTipStyles={{
          background: "rgba(0,0,0,0.8)",
        }}
      >
        <button className={style.glassButton}>{mode.type}</button>
      </Icon>
      <Icon
        ToolTip={
          <>
            <p
              className={style.pRecipe({ selected: mode.control === "orbit" })}
              onClick={() => setControl("orbit")}
            >
              orbit
            </p>
            {mode.type === "character" && (
              <p
                className={style.pRecipe({
                  selected: mode.control === "normal",
                })}
                onClick={() => setControl("normal")}
              >
                normal
              </p>
            )}
          </>
        }
        toolTipStyles={{
          background: "rgba(0,0,0,0.8)",
        }}
      >
        <button className={style.glassButton}>{mode.control}</button>
      </Icon>
      <Icon
        ToolTip={
          <>
            <p
              className={style.pRecipe({
                selected: mode.controller === "keyboard",
              })}
              onClick={() => setController("keyboard")}
            >
              keyboard
            </p>
            <p
              className={style.pRecipe({
                selected: mode.controller === "joystick",
              })}
              onClick={() => setController("joystick")}
            >
              joystick
            </p>
            <p
              className={style.pRecipe({
                selected: mode.controller === "gameboy",
              })}
              onClick={() => setController("gameboy")}
            >
              gameboy
            </p>
          </>
        }
        toolTipStyles={{
          background: "rgba(0,0,0,0.8)",
        }}
      >
        <button className={style.glassButton}>{mode.controller}</button>
      </Icon>

      <Icon
        ToolTip={
          <>
            <p
              className={style.pRecipe({
                selected: isZoom,
              })}
              onClick={() => setZoom(V3(5, 2, 5), true)}
            >
              zoomIn
            </p>
            <p
              className={style.pRecipe({
                selected: !isZoom,
              })}
              onClick={() => setZoom(V3(12, 5, 12), false)}
            >
              zoomOut
            </p>
          </>
        }
        toolTipStyles={{
          background: "rgba(0,0,0,0.8)",
        }}
      >
        <button className={style.glassButton}>
          {isZoom ? "zoomIn" : "zoomOut"}
        </button>
      </Icon>
    </div>
  );
}
