import { style } from "@vanilla-extract/css";

export const pointer = style([
  {
    width: "4rem",
    height: "4rem",
    borderRadius: "50%",
    background: "#f4ffd4",
    opacity: 0.5,
  },
]);

export const border = style([
  {
    width: "4rem",
    height: "4rem",
    borderRadius: "50%",
    boxShadow: "0 0 0 0 #f4ffd4",
    transform: "scale(2)",
  },
]);
