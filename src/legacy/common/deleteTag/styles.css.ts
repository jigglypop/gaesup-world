import { flex } from "@styles/recipe/index.css";
import { style } from "@vanilla-extract/css";

export const fixedButtonContainer = style({
  position: "absolute",
  bottom: "20px",
  right: "20px",
  pointerEvents: "auto",
});

export const fixedButton = style([
  flex({}),
  {
    backgroundColor: "red",
    border: "none",
    borderRadius: "50%",
    width: "4rem",
    height: "4rem",
    cursor: "pointer",
    color: "white",
    fontSize: "2.4rem",
    transition: "all 0.3s ease-in",
  },
]);

export const fixedButtonHover = style({
  backgroundColor: "darkred",
});
