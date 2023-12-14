import { style } from "@vanilla-extract/css";
import { fixed, flex } from "../../../styles/recipe/index.css";

export const joyStick = style([
  fixed({
    south_east: true,
  }),
  flex({
    column: "7",
  }),
  {
    width: "100%",
  },
]);

export const joyStickInner = style([
  flex({
    row: "center",
  }),
  {
    margin: "5rem",
    padding: "1rem",
    width: "12rem",
    height: "12rem",
    overflow: "auto",
    borderRadius: "50%",
    background: "rgba(0, 0, 0, 0.5)",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
    ":after": {
      content: "''",
      width: "10rem",
      height: "10rem",
      borderRadius: "50%",
      background: "rgba(0, 0, 0, 0.2)",
    },
  },
]);

export const joystickBall = style([
  {
    width: "5rem",
    height: "5rem",
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    background: "rgba(0, 0, 0, 0.5)",
    boxShadow: "0 0 10px  rgba(0, 0, 0, 0.5)",
    cursor: "pointer",
  },
]);
