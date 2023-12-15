import { useContext } from "react";

import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context/index.js";
import { joyStickBallType, joyStickOriginType } from "./type.js";

export const joyStickBallDefault = {
  top: "50%",
  left: "50%",
};

export const joyStickOriginDefault = {
  x: 0,
  y: 0,
  angle: Math.PI / 2,
  currentRadius: 0,
  originRadius: 0,
  isIn: true,
  isOn: false,
  isUp: true,
  isCenter: true,
};

export const joyStickInnerDefault = {
  joyStickBall: joyStickBallDefault,
  joyStickOrigin: joyStickOriginDefault,
};

export default function useJoyStick() {
  const { joystick } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { joyStickBall, joyStickOrigin } = joystick;

  const setBall = (ball: joyStickBallType) => {
    joystick.joyStickBall = Object.assign(joyStickBall, ball);
    dispatch({
      type: "update",
      payload: {
        joystick: {
          ...joystick,
          joyStickBall: {
            ...joystick.joyStickBall,
          },
        },
      },
    });
  };

  const setOrigin = (origin: joyStickOriginType) => {
    joystick.joyStickOrigin = Object.assign(joyStickOrigin, origin);
    dispatch({
      type: "update",
      payload: {
        joystick: {
          ...joystick,
          joyStickOrigin: {
            ...joystick.joyStickOrigin,
          },
        },
      },
    });
  };
  return {
    joyStickOrigin,
    joyStickBall,
    setBall,
    setOrigin,
  };
}
