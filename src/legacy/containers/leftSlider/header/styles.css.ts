import { scDream } from "@styles/fonts.css";
import { flex, glass } from "@styles/recipe/index.css";
import { style, styleVariants } from "@vanilla-extract/css";

export const editorHeader = style([
  flex({ row: "center" }),
  {
    justifyContent: "start",
    position: "sticky",
    top: 0,
    right: 0,
    width: "100%",
    height: "5rem",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(1rem)",
    zIndex: 2000,
  },
]);

const tapBase = style([
  flex({}),
  glass({}),
  {
    width: "4.5rem",
    height: "2.5rem",
    margin: "0.4rem",
    padding: "0.5rem",
    transition: "all 0.1s ease",
    borderRadius: "0.5rem",
    fontSize: "1.1rem",
    fontFamily: scDream,
    fontWeight: 400,
    cursor: "pointer",
    ":hover": {
      backgroundColor: "rgba(50, 50, 50, 0.3)",
    },
  },
]);

export const tap = styleVariants({
  active: [
    tapBase,
    {
      backgroundColor: "rgba(255,255,255,0.8)",
      boxShadow: "0 0 0.4rem rgba(255,255,255,0.6)",
      color: "rgba(50,50,50,0.8)",
      textShadow: "0 0 0.1rem rgba(50,50,50,0.8)",
    },
  ],
  inactive: [
    tapBase,
    {
      backgroundColor: "rgba(50,50,50,0.8)",
      boxShadow: "0 0 1rem rgba(0,0,0,0.6)",
      color: "rgba(255,255,255,0.8)",
      textShadow: "0 0 0.1rem rgba(255, 255, 255, 0.8)",
    },
  ],
});
