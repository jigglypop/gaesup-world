import { style } from "@vanilla-extract/css";
import { mobileButton } from "../../../styles/recipe/button.css";
import { flex } from "../../../styles/recipe/index.css";

export const gamePad = style([
  flex({
    row: "center",
  }),
  {
    width: "100%",
    margin: "1rem",
    zIndex: 10000,
  },
]);

export const gamePadButtonRecipe = style([mobileButton({})]);
