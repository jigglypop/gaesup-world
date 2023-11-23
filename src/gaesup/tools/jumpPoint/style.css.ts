import { mainButton } from "@/components/main/style.css";
import { fixed, flex } from "@styles/recipe/index.css";
import { style } from "@vanilla-extract/css";

export const jumpPoints = style([
  fixed({
    north_east: true,
  }),
  flex({}),
  {
    margin: "1rem",
    zIndex: 1000,
  },
]);

export const jumpPoint = style([
  mainButton({}),
  flex({}),
  {
    margin: "1rem",
    fontSize: "0.8rem",
    borderRadius: "50%",
    width: "5rem",
    height: "5rem",
    color: "white",
    background: "rgba(0, 0, 0, 0.6)",
    boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.6)",
    transition: "all 0.2s ease-in",
    cursor: "pointer",
  },
]);
