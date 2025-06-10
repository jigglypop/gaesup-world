import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./theme.css";

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
  outline: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  appearance: "none",
});

globalStyle("textarea, textarea:focus", {
  border: "none",
  outline: "none",
  resize: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  appearance: "none",
});

globalStyle("button, button:focus", {
  border: "none",
  outline: "none",
});

globalStyle(
  "input::-ms-clear, input[type='password']::-ms-reveal, input[type='password']::-ms-clear",
  {
    display: "none",
  }
);

globalStyle("::-webkit-scrollbar", {
  width: "1.8rem",
});

globalStyle("::-webkit-scrollbar-thumb", {
  background: vars.gradient.black,
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
