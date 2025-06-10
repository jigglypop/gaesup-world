import { palette } from "@styles/constants/palette.css";
import { vars } from "@styles/theme.css";
import { style } from "@vanilla-extract/css";
import { flex } from "../../styles/recipe/index.css";

export const modalOuter = style([
  flex({}),
  {
    position: "fixed",
    top: "1rem",
    right: "1rem",
    paddingTop: "3rem",
    background: vars.gradient.mint,
    wordBreak: "break-all",
    WebkitBackdropFilter: "blur(10px)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 0 10px rgba(99,251,215,1)",
    overflowY: "scroll",
    overflowX: "hidden",
    zIndex: 2000,
    "@media": {
      "(max-width: 768px)": {
        width: "45rem",
      },
      "(max-width: 600px)": {
        width: "32rem",
      },
    },
  },
]);

export const cancelStyle = style([
  flex({}),
  {
    position: "absolute",
    top: "2rem",
    right: "1rem",
    fontSize: "3rem",
    background: palette.gray400,
    color: "rgba(0, 0, 0, 0.9)",
    boxShadow: `0 0 10px ${palette.gray600}`,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    zIndex: 10,
    transition: "all 0.3s ease-in-out",
    selectors: {
      "&:hover": {
        color: "rgba(0, 0, 0, 0.2)",
      },
    },
  },
]);
