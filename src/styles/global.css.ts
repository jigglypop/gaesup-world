import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./theme.css";

globalStyle(":root", {
  background: vars.themes.background,
  color: vars.themes.text.normal,
});

globalStyle("html", {
  boxSizing: "border-box",
  fontSize: "62.5%",
  overflowX: "hidden",
  padding: 0,
});

globalStyle("body", {
  position: "relative",
  margin: 0,
});

globalStyle("*, *::before, *::after", {
  boxSizing: "border-box",
});

globalStyle("a", {
  cursor: "pointer",
  textDecoration: "none",
  color: "inherit",
});

globalStyle("input, input:focus", {
  border: "none",
  borderRight: "0px",
  borderTop: "0px",
  borderLeft: "0px",
  borderBottom: "0px",
  outline: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  appearance: "none",
});

globalStyle("button, button:focus", {
  border: "none",
  outline: "none",
});

globalStyle("input::-ms-clear", {
  display: "none",
});

globalStyle(
  'input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button',
  {
    WebkitAppearance: "none",
    MozAppearance: "none",
    appearance: "none",
  }
);

globalStyle(
  'input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear',
  {
    display: "none",
  }
);
// 스크롤

globalStyle("::-webkit-scrollbar", {
  width: "1.8rem",
});

globalStyle("::-webkit-scrollbar-thumb", {
  background: vars.gradient.purple,
  borderRadius: "1rem",
  border: "0.4rem solid transparent",
  backgroundClip: "padding-box",
});

globalStyle("::-webkit-scrollbar-track", {
  WebkitBackdropFilter: "blur(10px)",
  backdropFilter: "blur(10px)",
});

globalStyle(
  "input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active",
  {
    transition: "background-color 10000s",
    WebkitTextFillColor: "black !important",
  }
);
