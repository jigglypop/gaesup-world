import { useContext } from "react";
import { GaesupWorldContext, GaesupWorldDispatchContext } from "../context";

export type joyStickBallType = {
  x: string;
  y: string;
  position: string;
  background: string;
  boxShadow: string;
};

export type joyStickOriginType = {
  x: number;
  y: number;
  angle: number;
  currentRadius: number;
  originRadius: number;
  isIn: boolean;
  isOn: boolean;
};

export type joyStickType = {
  on: boolean;
  joyStickBall: joyStickBallType;
  joyStickOrigin: joyStickOriginType;
};

export const joyStickBallDefault = {
  x: "50%",
  y: "50%",
  position: "absolute",
  background: "rgba(0, 0, 0, 0.5)",
  boxShadow: "0 0 10px  rgba(0, 0, 0, 0.5)",
};

export const joyStickOriginDefault = {
  x: 0,
  y: 0,
  angle: Math.PI / 2,
  currentRadius: 0,
  originRadius: 0,
  isIn: true,
  isOn: false,
};

export const joyStickDefault = {
  on: false,
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
