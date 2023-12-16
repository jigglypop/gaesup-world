import { keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { flex_absolute, glass } from "../../../styles/recipe/index.css";
import { sprinkles } from "../../../styles/sprinkles/index.css";
import { vars } from "../../../styles/theme.css";

export const pulseWhite = keyframes({
  "0%": {
    boxShadow: "0 0 0 0 rgba(255, 255, 255, 0.7)",
    opacity: 1,
  },
  "70%": {
    boxShadow: "0 0 0 10px rgba(255, 255, 255, 0)",
    opacity: 0.7,
  },
  "100%": {
    boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)",
    opacity: 1,
  },
});

export const avatar = style([
  flex_absolute({
    center: true,
  }),
  {
    width: "2rem",
    height: "2rem",
    borderRadius: "50%",
    background: "rgba(5,222,250,1)",
    boxShadow: "0 0 10px rgba(5,222,250,1)",
    border: "2px solid transparent",
    objectFit: "cover",
    zIndex: 100,
    animation: `${pulseWhite} 2s infinite`,
  },
]);

export const plusMinus = style([
  {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "2rem",
    height: "2rem",
    borderRadius: "50%",
    background: "rgba(0, 0, 0, 0.5)",
    boxShadow: "0 0 5px rgba(0, 0, 0, 0.5)",
    transition: "all 0.5s ease-in",
    cursor: "pointer",
    border: "2px solid transparent",
    ":hover": {
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
    },
  },
]);

export const avatarImage = style([
  {
    width: "4rem",
    height: "4rem",
    borderRadius: "50%",
    background: vars.gradient.purple,
    border: "2px solid transparent",
    objectFit: "cover",
  },
]);

export const border = style([
  {
    width: "4rem",
    height: "4rem",
    borderRadius: "50%",
    boxShadow: "0 0 0 0 rgba(255, 255, 255, 1)",
    transform: "scale(1)",
    animation: `${pulseWhite} 2s infinite`,
    cursor: "pointer",
    transition: "all 0.5s ease-in",
    selectors: {
      "&:hover": {
        transform: "scale(1.1)",
      },
    },
  },
]);

export const minimap = style([
  sprinkles({
    w: {
      mobile: "15",
      tablet: "16",
      laptop: "18",
      desktop: "19",
    },
    h: {
      mobile: "15",
      tablet: "16",
      laptop: "18",
      desktop: "19",
    },
  }),
  {
    margin: "1rem",
    borderRadius: "50%",
    background: "rgba(0, 0, 0, 0.9)",
    boxShadow: `0 0 10px rgba(0, 0, 0, 0.9)`,
    WebkitBackdropFilter: "blur(10px)",
    backdropFilter: "blur(10px)",
  },
]);

export const minimapOuter = style([
  flex_absolute({
    center: true,
  }),
]);

export const minimapInner = style([
  sprinkles({
    w: {
      mobile: "14",
      tablet: "15",
      laptop: "17",
      desktop: "18",
    },
    h: {
      mobile: "14",
      tablet: "15",
      laptop: "17",
      desktop: "18",
    },
  }),
  {
    zIndex: 2,
    position: "absolute",
    display: "flex",
    top: "50%",
    left: "50%",
    transformOrigin: "50% 50%",
    borderRadius: "50%",
    background: "rgba(0, 0, 0, 0.9)",
    overflow: "hidden",
  },
]);

export const text = style([
  {
    fontSize: "1rem",
    color: "white",
    textShadow: "0 0 10px black",
  },
]);

export const scale = style([
  glass({}),
  {
    position: "absolute",
    width: "13rem",
    bottom: "-3rem",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    textAlign: "center",
    fontSize: "1.2rem",
    color: "white",
    textShadow: "0 0 10px black",
    padding: "0.5rem",
    borderRadius: "0.5rem",
    boxShadow: "0 0 10px solid black",
    background: "rgba(0, 0, 0, 0.5)",
    zIndex: 3,
  },
]);

export const minimapObject = style([
  flex_absolute({}),
  {
    borderRadius: "2px",
    background: "rgba(99,251,215,0.4)",
    boxShadow: "0 0 10px rgba(99,251,215,0.4)",
    border: "2px solid rgba(99,251,215,1)",
    opacity: 0.5,
  },
]);

export const direction = recipe({
  base: {
    position: "absolute",
    color: "rgba(99,251,215,1)",
    textShadow: "0 0 10px rgba(99,251,215,1)",
    margin: "0.5rem",
    fontSize: "1.2rem",
  },
  variants: {
    east: {
      true: {
        top: "50%",
        transform: "translateY(-50%)",
        left: 0,
      },
    },
    west: {
      true: {
        top: "50%",
        transform: "translateY(-50%)",
        right: 0,
      },
    },
    north: {
      true: {
        top: 0,
        transform: "translateX(-50%)",
        left: "50%",
      },
    },
    south: {
      true: {
        bottom: 0,
        transform: "translateX(-50%)",
        left: "50%",
      },
    },
  },
});
