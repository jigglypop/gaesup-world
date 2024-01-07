import { style } from "@vanilla-extract/css";
import { flex_absolute, glass } from "../../styles";

export const tooltip = style([
  flex_absolute({
    column: "center",
  }),
  glass({}),
  {
    top: "0",
    width: "10rem",
    fontSize: "1.25rem",
    borderRadius: "1rem",
    backgroundColor: "transparent",
    boxShadow: "0 0.25rem 0.5rem rgba(0, 0, 0, 0.2)",
    color: "white",
    zIndex: "1",
    left: "50%",
    transform: "translateX(-50%)",
    opacity: "0",
    textAlign: "center",
  },
]);

export const largeTooltip = style([
  tooltip,
  // {
  //   marginTop: '9rem'
  // }
]);
