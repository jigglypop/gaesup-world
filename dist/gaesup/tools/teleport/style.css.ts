import { style } from "@vanilla-extract/css";
import { commonButton } from "../shared.css";

export const teleport = style([
  commonButton,
  {
    margin: "1rem",
    fontSize: "0.8rem",
    background: "rgba(0, 0, 0, 0.6)",
    boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.6)",
    transition: "all 0.2s ease-in",
    borderRadius: "50%",
  },
]);
