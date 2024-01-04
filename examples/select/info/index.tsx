"use client";

import { useContext, useEffect, useState } from "react";
import { isDesktop } from "react-device-detect";
import { V3, ZoomButton } from "../../../src";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../../src/gaesup/world/context";
import { button } from "../styles/recipe/button.css";
import * as style from "./style.css";

export default function Info() {
  const { mode } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    dispatch({
      type: "update",
      payload: {
        mode: {
          ...mode,
          type: "character",
          controller: isDesktop ? "keyboard" : "joystick",
          control: "orbit",
        },
      },
    });
  }, []);

  return (
    <div className={style.infoStyle}>
      <div>
        <p className={style.text}>GAESUP WORLD</p>
      </div>
      <hr />
      <div className={style.infoInner}>
        <p className={style.small}>TYPE</p>
        <button
          className={button({ black: mode.type === "character" })}
          style={{ width: "7rem" }}
          onClick={() => {
            dispatch({
              type: "update",
              payload: {
                mode: {
                  ...mode,
                  type: "character",
                },
              },
            });
          }}
        >
          character
        </button>
        <button
          className={button({ black: mode.type === "vehicle" })}
          style={{ width: "6rem" }}
          onClick={() => {
            dispatch({
              type: "update",
              payload: {
                mode: {
                  ...mode,
                  type: "vehicle",
                },
              },
            });
          }}
        >
          vehicle
        </button>
        <button
          className={button({ black: mode.type === "airplane" })}
          style={{ width: "6rem" }}
          onClick={() => {
            dispatch({
              type: "update",
              payload: {
                mode: {
                  ...mode,
                  type: "airplane",
                },
              },
            });
          }}
        >
          airplane
        </button>
      </div>
      <div className={style.infoInner}>
        <p className={style.small}>CONTROL</p>
        {isDesktop && (
          <button
            className={button({ black: mode.controller === "keyboard" })}
            style={{ width: "7rem" }}
            onClick={() => {
              dispatch({
                type: "update",
                payload: {
                  mode: {
                    ...mode,
                    controller: "keyboard",
                  },
                },
              });
            }}
          >
            keyboard
          </button>
        )}
        <button
          className={button({ black: mode.controller === "joystick" })}
          style={{ width: "6rem" }}
          onClick={() => {
            dispatch({
              type: "update",
              payload: {
                mode: {
                  ...mode,
                  controller: "joystick",
                },
              },
            });
          }}
        >
          joystick
        </button>
        <button
          className={button({ black: mode.controller === "gameboy" })}
          style={{ width: "6rem" }}
          onClick={() => {
            dispatch({
              type: "update",
              payload: {
                mode: {
                  ...mode,
                  controller: "gameboy",
                },
              },
            });
          }}
        >
          gameboy
        </button>
      </div>
      <div className={style.infoInner}>
        <p className={style.small}>CAMERA</p>
        <button
          className={button({ black: mode.control === "orbit" })}
          style={{ width: "4rem" }}
          onClick={() => {
            dispatch({
              type: "update",
              payload: {
                mode: {
                  ...mode,
                  control: "orbit",
                },
              },
            });
          }}
        >
          orbit
        </button>
        {mode.type === "character" && (
          <button
            className={button({ black: mode.control === "normal" })}
            style={{ width: "6rem" }}
            onClick={() => {
              dispatch({
                type: "update",
                payload: {
                  mode: {
                    ...mode,
                    control: "normal",
                  },
                },
              });
            }}
          >
            normal
          </button>
        )}
      </div>
      <div className={style.infoInner}>
        <p className={style.small}>ZOOM</p>
        <div
          className={style.cameraLeft}
          onClick={() => {
            setZoom(!zoom);
          }}
        >
          <ZoomButton position={zoom ? V3(20, 5, 20) : V3(10, 5, 10)}>
            {zoom ? "IN" : "OUT"}
          </ZoomButton>
        </div>
      </div>
    </div>
  );
}
