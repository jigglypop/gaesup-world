import { style } from "@vanilla-extract/css";
import { flex } from "../../styles/recipe/index.css";

export const cancelStyle = style([
  flex({}),
  {
    position: "absolute",
    top: "2rem",
    right: "1rem",
    fontSize: "3rem",
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
