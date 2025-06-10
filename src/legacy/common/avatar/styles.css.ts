import { pulseWhite } from "@styles/keyframes/keyframes.css";
import { vars } from "@styles/theme.css";
import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const avatarImage = style([
  {
    borderRadius: "50%",
    background: vars.gradient.green,
    border: "2px solid transparent",
    objectFit: "cover",
  },
]);

export const avatarImageResipe = recipe({
  base: avatarImage,
  variants: {
    color: {
      2: {
        background: vars.gradient.red,
      },
      1: {
        background: vars.gradient.green,
      },
      0: {
        background: vars.gradient.black,
      },
    },
  },
});

export const avatarBorder = style([
  {
    borderRadius: "50%",
    boxShadow: "0 0 0 0 rgba(255, 255, 255, 1)",
    cursor: "pointer",
    transition: "all 0.5s ease-in",
    animation: `${pulseWhite} 2s infinite`,

    selectors: {
      "&:hover": {
        transform: "scale(1.1)",
      },
    },
  },
]);
