import { scDream } from "@styles/fonts.css";
import { style } from "@vanilla-extract/css";

export const toggleSliderOuter = style({
  position: "absolute",

  minWidth: "3rem",
  minHeight: "3rem",

  zIndex: 100,
  color: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(1rem)",
  borderRadius: "1rem",
  boxShadow: "0 0 1rem rgba(0, 0, 0, 0.6)",
  background: "rgba(0, 0, 0, 0.6)",
  fontSize: "2rem",
  padding: "0.5rem",
  transition: "all 0.2s ease-in",
});

export const sliderInner = style({
  gridRow: "2/3",
  gridColumn: "1/2",
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "scroll",
});

export const sliderHeader = style({
  gridRow: "1/2",
  gridColumn: "1/2",

  position: "relative",
  width: "100%",
  padding: "0.5rem",

  display: "flex",
  alignItems: "center",
  fontFamily: scDream,
  fontWeight: 700,
});

export const sliderTag = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "1.3rem",
});
export const sliderButton = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "1.5rem",
  cursor: "pointer",
});
