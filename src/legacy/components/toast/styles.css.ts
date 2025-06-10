import { scDream } from "@styles/fonts.css";
import { flex } from "@styles/recipe/index.css";
import { vars } from "@styles/theme.css";
import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const toast = style({
  position: "fixed",
  bottom: "2rem",
  right: "2rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  zIndex: 100000,
  minWidth: "40rem",
  color: "white",
  padding: 0,
  margin: 0,
});

export const toastItem = style([
  flex({ column: "center" }),
  {
    position: "relative",
    color: "rgba(0, 0, 0, 0.8)",
    borderRadius: "1rem",
    margin: "1rem",
    padding: 0,
    minWidth: "35rem",
    width: "100%",
    height: "6rem",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.8)",
  },
]);

export const filter = style({
  position: "absolute",
  width: "100%",
  height: "100%",
  borderRadius: "1rem",
  overflow: "hidden",
});

export const toastItemBase = style([
  filter,
  {
    background: vars.gradient.green,
  },
]);

export const toastItemFront = style([filter]);

export const text = style([
  flex({ column: "center" }),
  {
    position: "relative",
    width: "100%",
    height: "100%",
    fontSize: "1.4rem",
    fontFamily: scDream,
    fontWeight: 400,
  },
]);

export const toastRecipe = recipe({
  base: toastItemBase,
  variants: {
    type: {
      npc: {},
      warning: {},
      error: {
        background: vars.gradient.red,
        boxShadow: "0 0 10px rgba(236,54,110,1)",
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: "1.4rem",
      },
    },
  },
});
