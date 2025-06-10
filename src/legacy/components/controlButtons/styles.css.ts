import { fixed } from "@styles/recipe/index.css";
import { vars } from "@styles/theme.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const controlButtons = style([
  fixed({
    south_east: true,
  }),
  {
    bottom: "1rem",
    zIndex: 1000,
    overflow: "hidden",
    "@media": {
      "(max-width: 768px)": {
        bottom: "6rem",
      },
    },
  },
]);

globalStyle(`${controlButtons} .gamePad`, {
  gridTemplateColumns: "repeat(2, 12rem)",
  height: "9rem",
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "repeat(2, 9rem)",
      height: "7rem",
    },
    "(max-width: 371px)": {
      gridTemplateColumns: "repeat(2, 7rem)",
      height: "5.5rem",
    },
  },
});

globalStyle(`${controlButtons} .padButton`, {
  width: "10rem",
  height: "8rem",
  fontSize: "1.4rem",
  borderRadius: "1rem",
  transition: "all 0.5s ease-in-out",
  "@media": {
    "(max-width: 768px)": {
      width: "8rem",
      height: "6rem",
      fontSize: "1.2rem",
    },
    "(max-width: 371px)": {
      width: "6rem",
      height: "4.5rem",
      fontSize: "1.2rem",
    },
  },
});

globalStyle(`${controlButtons} .padButton.isClicked`, {
  background: vars.gradient.mint,
  boxShadow: "0 0 10px rgba(99,251,215,1)",
});
